import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const customerId = searchParams.get("customerId");
    const schemeId = searchParams.get("schemeId");
    const paymentMode = searchParams.get("paymentMode");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    let sql = `
      SELECT p.*, c.full_name as customer_name, c.mobile as customer_mobile, c.customer_code,
             s.name as scheme_name, s.tamil_name as scheme_tamil_name, sm.passbook_number,
             u.full_name as collected_by_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      JOIN schemes s ON p.scheme_id = s.id
      JOIN scheme_members sm ON p.member_id = sm.id
      LEFT JOIN users u ON p.collected_by_user_id = u.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (search) {
      sql += " AND (p.receipt_number LIKE ? OR c.full_name LIKE ? OR c.mobile LIKE ? OR sm.passbook_number LIKE ? OR s.name LIKE ? OR s.tamil_name LIKE ? OR CAST(s.monthly_amount AS TEXT) LIKE ?)";
      const term = `%${search}%`;
      args.push(term, term, term, term, term, term, term);
    }
    if (customerId) {
      sql += " AND p.customer_id = ?";
      args.push(customerId);
    }
    if (schemeId) {
      sql += " AND p.scheme_id = ?";
      args.push(schemeId);
    }
    if (paymentMode) {
      sql += " AND p.payment_mode = ?";
      args.push(paymentMode);
    }
    if (fromDate) {
      sql += " AND p.payment_date >= ?";
      args.push(fromDate);
    }
    if (toDate) {
      sql += " AND p.payment_date <= ?";
      args.push(toDate);
    }

    sql += " ORDER BY p.id DESC";

    const result = await client.execute({ sql, args });

    return NextResponse.json({ payments: result.rows });
  } catch (error: any) {
    console.error("Payments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      customerId,
      schemeId,
      memberId,
      installmentId,
      installmentNumber,
      amount,
      discount = 0,
      lateFee = 0,
      paymentMode,
      transactionRef,
      remarks,
      paymentDate,
    } = data;

    if (!customerId || !schemeId || !memberId || !amount || !paymentMode) {
      return NextResponse.json({ error: "Customer, Scheme, Member, Amount, and Payment Mode are required" }, { status: 400 });
    }

    // 1. Check if installment is already paid (prevent duplicate payment)
    let instNumber = installmentNumber;
    let targetInstId = installmentId;

    if (targetInstId) {
      const instCheck = await client.execute({
        sql: "SELECT * FROM installments WHERE id = ?",
        args: [targetInstId],
      });
      if (instCheck.rows.length === 0) {
        return NextResponse.json({ error: "Installment schedule not found" }, { status: 404 });
      }
      const instRow = instCheck.rows[0];
      if (instRow.status === "paid") {
        return NextResponse.json({ error: `Installment #${instRow.installment_number} is already paid!` }, { status: 400 });
      }
      instNumber = instRow.installment_number;
    } else {
      // Find the next pending installment for this member
      const nextInstRes = await client.execute({
        sql: "SELECT * FROM installments WHERE member_id = ? AND status != 'paid' ORDER BY installment_number ASC LIMIT 1",
        args: [memberId],
      });
      if (nextInstRes.rows.length > 0) {
        targetInstId = nextInstRes.rows[0].id;
        instNumber = nextInstRes.rows[0].installment_number;
      } else {
        // If all scheduled are paid, create an advance installment
        const maxInstRes = await client.execute({
          sql: "SELECT COALESCE(MAX(installment_number), 0) as maxNum FROM installments WHERE member_id = ?",
          args: [memberId],
        });
        instNumber = Number(maxInstRes.rows[0]?.maxNum || 0) + 1;
      }
    }

    const payDate = paymentDate || new Date().toISOString().split("T")[0];
    const totalAmount = Number(amount) - Number(discount) + Number(lateFee);

    // 2. Generate Receipt Number: RCP-YYYY-XXXXX
    const year = new Date().getFullYear();
    const payCountRes = await client.execute("SELECT COUNT(*) as count FROM payments");
    const nextReceiptSeq = Number(payCountRes.rows[0]?.count || 0) + 1;
    const receiptNumber = `RCP-${year}-${String(nextReceiptSeq).padStart(5, "0")}`;

    // 3. Insert Payment record
    const insertPaymentRes = await client.execute({
      sql: `INSERT INTO payments 
            (receipt_number, customer_id, scheme_id, member_id, installment_id, installment_number, amount, discount, late_fee, total_amount, payment_date, payment_mode, transaction_ref, collected_by_user_id, branch_id, remarks, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'completed')`,
      args: [
        receiptNumber,
        customerId,
        schemeId,
        memberId,
        targetInstId || null,
        instNumber,
        Number(amount),
        Number(discount),
        Number(lateFee),
        totalAmount,
        payDate,
        paymentMode,
        transactionRef || null,
        user?.id || 1,
        remarks || "Chit monthly installment collection",
      ],
    });

    const paymentId = Number(insertPaymentRes.lastInsertRowid);

    // 4. Update the installment status to 'paid'
    if (targetInstId) {
      await client.execute({
        sql: `UPDATE installments 
              SET paid_amount = amount, status = 'paid', paid_date = ?, receipt_id = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [payDate, paymentId, targetInstId],
      });
    }

    // 5. Update Scheme Member's completed installments and totals
    await client.execute({
      sql: `UPDATE scheme_members 
            SET completed_installments = completed_installments + 1,
                total_paid_amount = total_paid_amount + ?,
                total_pending_amount = CASE WHEN total_pending_amount >= ? THEN total_pending_amount - ? ELSE 0 END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [Number(amount), Number(amount), Number(amount), memberId],
    });

    // 6. Insert into receipts
    await client.execute({
      sql: `INSERT INTO receipts (receipt_number, payment_id, customer_id, total_amount, payment_mode, payment_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [receiptNumber, paymentId, customerId, totalAmount, paymentMode, payDate, remarks || "Monthly Chit Receipt"],
    });

    // 7. Audit log
    await logAudit({
      userId: user?.id,
      action: "PAYMENT_COLLECT",
      entityType: "payment",
      entityId: paymentId,
      details: { receiptNumber, customerId, schemeId, memberId, installmentNumber: instNumber, amount: totalAmount, paymentMode },
    });

    // 8. Fetch detailed receipt info for frontend return
    const receiptDetailRes = await client.execute({
      sql: `SELECT p.*, c.full_name as customer_name, c.mobile as customer_mobile, c.customer_code, c.address as customer_address,
                   s.name as scheme_name, s.tamil_name as scheme_tamil_name, sm.passbook_number,
                   u.full_name as collected_by_name
            FROM payments p
            JOIN customers c ON p.customer_id = c.id
            JOIN schemes s ON p.scheme_id = s.id
            JOIN scheme_members sm ON p.member_id = sm.id
            LEFT JOIN users u ON p.collected_by_user_id = u.id
            WHERE p.id = ?`,
      args: [paymentId],
    });

    return NextResponse.json({
      success: true,
      receiptNumber,
      paymentId,
      receipt: receiptDetailRes.rows[0],
      message: `Payment collected successfully. Receipt: ${receiptNumber}`,
    });
  } catch (error: any) {
    console.error("Payment collection error:", error);
    return NextResponse.json({ error: "Failed to collect payment" }, { status: 500 });
  }
}
