import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const result = await client.execute(`
      SELECT r.*, c.full_name as customer_name, c.mobile as customer_mobile, c.customer_code,
             s.name as scheme_name, s.tamil_name as scheme_tamil_name, sm.passbook_number,
             pt.name as package_name, pt.tamil_name as package_tamil_name,
             u.full_name as issued_by_name
      FROM redemptions r
      JOIN customers c ON r.customer_id = c.id
      JOIN schemes s ON r.scheme_id = s.id
      JOIN scheme_members sm ON r.member_id = sm.id
      LEFT JOIN package_templates pt ON r.package_id = pt.id
      LEFT JOIN users u ON r.issued_by_user_id = u.id
      ORDER BY r.id DESC
    `);

    // Fetch eligible members who can redeem (e.g. 12 installments completed or status active)
    const eligibleMembersRes = await client.execute(`
      SELECT sm.*, c.full_name as customer_name, c.mobile as customer_mobile, c.customer_code,
             s.name as scheme_name, s.tamil_name as scheme_tamil_name, s.monthly_amount, s.total_months,
             s.grocery_package_value, s.redemption_type,
             (SELECT id FROM package_templates WHERE scheme_id = s.id LIMIT 1) as default_package_id
      FROM scheme_members sm
      JOIN customers c ON sm.customer_id = c.id
      JOIN schemes s ON sm.scheme_id = s.id
      WHERE sm.status = 'active'
      ORDER BY sm.completed_installments DESC, sm.id ASC
    `);

    return NextResponse.json({
      redemptions: result.rows,
      eligibleMembers: eligibleMembersRes.rows,
    });
  } catch (error: any) {
    console.error("Redemptions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      memberId,
      packageId,
      redemptionType = "grocery_package", // grocery_package or cash
      cashAmount = 0,
      customerAcknowledged = true,
      remarks,
    } = data;

    if (!memberId) {
      return NextResponse.json({ error: "Scheme member is required" }, { status: 400 });
    }

    // 1. Fetch member and scheme details
    const memberRes = await client.execute({
      sql: `SELECT sm.*, s.name as scheme_name, s.total_months, s.grocery_package_value, s.redemption_type as scheme_redemption_type,
                   c.full_name as customer_name, c.mobile as customer_mobile, c.id as cust_id
            FROM scheme_members sm
            JOIN schemes s ON sm.scheme_id = s.id
            JOIN customers c ON sm.customer_id = c.id
            WHERE sm.id = ?`,
      args: [memberId],
    });

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ error: "Scheme member record not found" }, { status: 404 });
    }

    const member = memberRes.rows[0];

    // Check if already redeemed
    const existingRedemption = await client.execute({
      sql: "SELECT id FROM redemptions WHERE member_id = ? AND status = 'issued'",
      args: [memberId],
    });
    if (existingRedemption.rows.length > 0) {
      return NextResponse.json({ error: "This member has already redeemed their Diwali chit package!" }, { status: 400 });
    }

    // Check cash redemption legality rule
    if (redemptionType === "cash" && member.scheme_redemption_type !== "grocery_or_cash") {
      return NextResponse.json({
        error: "Cash redemption is not legally permitted for this scheme. Only grocery package issue is allowed.",
      }, { status: 400 });
    }

    // 2. Generate redemption invoice number: RED-YYYY-XXXX
    const year = new Date().getFullYear();
    const countRes = await client.execute("SELECT COUNT(*) as count FROM redemptions");
    const nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
    const redemptionNumber = `RED-${year}-${String(nextSeq).padStart(4, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    // 3. Insert into redemptions
    const totalVal = redemptionType === "cash" ? Number(cashAmount) : Number(member.grocery_package_value);

    const insertRedemptionRes = await client.execute({
      sql: `INSERT INTO redemptions 
            (redemption_number, member_id, customer_id, scheme_id, package_id, redemption_type, redemption_date, total_package_value, cash_amount, stock_deducted, customer_acknowledged, remarks, status, issued_by_user_id, branch_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'issued', ?, 1)`,
      args: [
        redemptionNumber,
        memberId,
        member.customer_id,
        member.scheme_id,
        packageId || null,
        redemptionType,
        today,
        totalVal,
        redemptionType === "cash" ? Number(cashAmount) : 0,
        customerAcknowledged ? 1 : 0,
        remarks || "Diwali festival package delivered with acknowledgement",
        user?.id || 1,
      ],
    });

    const redemptionId = Number(insertRedemptionRes.lastInsertRowid);

    // 4. If grocery package, deduct stock and insert redemption items snapshot
    if (redemptionType === "grocery_package" && packageId) {
      const itemsRes = await client.execute({
        sql: `SELECT pi.*, gp.name as product_name, gp.tamil_name as tamil_product_name, gp.unit, gp.stock_quantity
              FROM package_items pi
              JOIN grocery_products gp ON pi.product_id = gp.id
              WHERE pi.package_id = ?`,
        args: [packageId],
      });

      for (const item of itemsRes.rows) {
        const qtyToDeduct = Number(item.quantity);
        const prevStock = Number(item.stock_quantity);
        const newStock = Math.max(0, prevStock - qtyToDeduct);

        // Insert snapshot
        await client.execute({
          sql: `INSERT INTO redemption_items 
                (redemption_id, product_id, product_name, tamil_product_name, quantity, unit, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            redemptionId,
            item.product_id,
            item.product_name,
            item.tamil_product_name,
            qtyToDeduct,
            item.unit,
            item.unit_value,
            item.total_value,
          ],
        });

        // Deduct product stock
        await client.execute({
          sql: `UPDATE grocery_products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          args: [newStock, item.product_id],
        });

        // Stock transaction record
        await client.execute({
          sql: `INSERT INTO stock_transactions 
                (product_id, transaction_type, quantity_change, previous_stock, new_stock, reference_type, reference_id, notes, created_by_user_id)
                VALUES (?, 'redemption_deduction', ?, ?, ?, 'redemption', ?, 'Deducted for Diwali Chit redemption delivery', ?)`,
          args: [item.product_id, -qtyToDeduct, prevStock, newStock, redemptionNumber, user?.id || 1],
        });
      }
    }

    // 5. Update scheme member status to completed
    await client.execute({
      sql: `UPDATE scheme_members SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [memberId],
    });

    // 6. Audit log
    await logAudit({
      userId: user?.id,
      action: "GROCERY_REDEMPTION",
      entityType: "redemption",
      entityId: redemptionId,
      details: {
        redemptionNumber,
        memberId,
        customerName: member.customer_name,
        redemptionType,
        totalVal,
      },
    });

    return NextResponse.json({
      success: true,
      redemptionId,
      redemptionNumber,
      message: `Diwali Chit redemption ${redemptionNumber} processed successfully! Stock updated.`,
    });
  } catch (error: any) {
    console.error("Redemption processing error:", error);
    return NextResponse.json({ error: "Failed to process redemption" }, { status: 500 });
  }
}
