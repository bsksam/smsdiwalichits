import { NextResponse } from "next/server";
import { client } from "@/db";
import { getCurrentCustomer } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getCurrentCustomer();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Please log in to make a payment" }, { status: 401 });
    }

    const customerId = session.customerId;
    const body = await req.json();
    const { memberId, installmentId, paymentMode = "UPI", transactionRef, lateFee = 0, discount = 0, remarks } = body;

    if (!memberId) {
      return NextResponse.json({ error: "Enrolled Scheme Member ID is required" }, { status: 400 });
    }

    // 1. Check if Payment Lock Days is active in app_settings
    const settingsRes = await client.execute("SELECT setting_key, setting_value FROM app_settings WHERE setting_key IN ('payment_lock_enabled', 'payment_lock_days', 'payment_lock_message')");
    const settingsMap: Record<string, string> = {};
    for (const r of settingsRes.rows) {
      settingsMap[String(r.setting_key)] = String(r.setting_value);
    }

    // Verify scheme member belongs to logged-in customer
    const memberRes = await client.execute({
      sql: `SELECT sm.*, s.name as scheme_name, s.monthly_amount, s.total_months 
            FROM scheme_members sm
            JOIN schemes s ON sm.scheme_id = s.id
            WHERE sm.id = ? AND sm.customer_id = ?`,
      args: [memberId, customerId],
    });

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: "Enrolled scheme not found for this customer" }, { status: 404 });
    }

    const member = memberRes.rows[0];

    // 2. Determine target installment
    let targetInst: any = null;
    if (installmentId) {
      const instRes = await client.execute({
        sql: "SELECT * FROM installments WHERE id = ? AND member_id = ? AND customer_id = ?",
        args: [installmentId, memberId, customerId],
      });
      if (instRes.rows.length === 0) {
        return NextResponse.json({ error: "Installment schedule not found" }, { status: 404 });
      }
      targetInst = instRes.rows[0];
      if (targetInst.status === "paid") {
        return NextResponse.json({ error: `Installment #${targetInst.installment_number} is already paid!` }, { status: 400 });
      }
    } else {
      // Find the next pending installment in sequence
      const nextRes = await client.execute({
        sql: "SELECT * FROM installments WHERE member_id = ? AND status != 'paid' ORDER BY installment_number ASC LIMIT 1",
        args: [memberId],
      });
      if (nextRes.rows.length === 0) {
        return NextResponse.json({ error: "All 12 installments for this scheme are already paid!" }, { status: 400 });
      }
      targetInst = nextRes.rows[0];
    }

    // Check payment lock enforcement
    if (settingsMap.payment_lock_enabled === "true") {
      const lockDays = parseInt(settingsMap.payment_lock_days || "10", 10);
      const dueDate = new Date(targetInst.due_date);
      const lockCutoff = new Date(dueDate.getTime() + lockDays * 24 * 60 * 60 * 1000);
      const now = new Date();
      if (now > lockCutoff) {
        const lockMsg = settingsMap.payment_lock_message || "Online payment is locked for this installment. Please visit our store counter.";
        return NextResponse.json({ error: lockMsg }, { status: 403 });
      }
    }

    const baseAmount = Number(targetInst.amount) || Number(member.monthly_amount);
    const appliedLateFee = Number(lateFee) || 0;
    const appliedDiscount = Number(discount) || 0;
    const totalAmount = baseAmount + appliedLateFee - appliedDiscount;
    const payDate = new Date().toISOString().split("T")[0];
    const year = new Date().getFullYear();

    // 3. Generate Receipt Number: RCP-YYYY-XXXXX
    const payCountRes = await client.execute("SELECT COUNT(*) as count FROM payments");
    const nextReceiptSeq = Number(payCountRes.rows[0]?.count || 0) + 1;
    const receiptNumber = `RCP-${year}-${String(nextReceiptSeq).padStart(5, "0")}`;

    // 4. Record Payment
    const insertPaymentRes = await client.execute({
      sql: `INSERT INTO payments 
            (receipt_number, customer_id, scheme_id, member_id, installment_id, installment_number, amount, discount, late_fee, total_amount, payment_date, payment_mode, transaction_ref, collected_by_user_id, branch_id, remarks, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'completed')`,
      args: [
        receiptNumber,
        customerId,
        member.scheme_id,
        memberId,
        targetInst.id,
        targetInst.installment_number,
        baseAmount,
        appliedDiscount,
        appliedLateFee,
        totalAmount,
        payDate,
        paymentMode.toUpperCase(),
        transactionRef ? transactionRef.trim() : null,
        member.branch_id || 1,
        remarks || `Online customer portal payment for Month #${targetInst.installment_number}`,
      ],
    });

    const paymentId = Number(insertPaymentRes.lastInsertRowid);

    // 5. Insert Receipt
    await client.execute({
      sql: `INSERT INTO receipts (receipt_number, payment_id, customer_id, total_amount, payment_mode, payment_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        receiptNumber,
        paymentId,
        customerId,
        totalAmount,
        paymentMode.toUpperCase(),
        payDate,
        `Self payment for ${member.scheme_name} (Month #${targetInst.installment_number})`,
      ],
    });

    // 6. Update Installment
    await client.execute({
      sql: `UPDATE installments 
            SET paid_amount = ?, status = 'paid', paid_date = ?, receipt_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [baseAmount, payDate, paymentId, targetInst.id],
    });

    // 7. Update Scheme Member progress
    await client.execute({
      sql: `UPDATE scheme_members 
            SET completed_installments = completed_installments + 1,
                total_paid_amount = total_paid_amount + ?,
                total_pending_amount = MAX(0, total_pending_amount - ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [baseAmount, baseAmount, memberId],
    });

    // 8. Audit Log
    await logAudit({
      userId: customerId,
      action: "CUSTOMER_PAY_INSTALLMENT",
      entityType: "payment",
      entityId: paymentId,
      details: {
        receiptNumber,
        amount: totalAmount,
        baseAmount,
        lateFee: appliedLateFee,
        installmentNumber: targetInst.installment_number,
        paymentMode,
        passbookNumber: member.passbook_number,
      },
    });

    return NextResponse.json({
      success: true,
      receiptNumber,
      paymentId,
      installmentNumber: targetInst.installment_number,
      amount: totalAmount,
      baseAmount,
      lateFee: appliedLateFee,
      paymentDate: payDate,
      passbookNumber: member.passbook_number,
      schemeName: member.scheme_name,
      message: `Payment of ₹${totalAmount.toLocaleString("en-IN")} received successfully! Receipt #${receiptNumber}`,
    });
  } catch (error: any) {
    console.error("Customer payment error:", error);
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 });
  }
}
