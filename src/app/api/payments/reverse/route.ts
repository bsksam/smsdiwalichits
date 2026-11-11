import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Only Super Admin, Admin, and Manager can reverse
    if (!["super_admin", "admin", "manager"].includes(user.role)) {
      return NextResponse.json({ error: "Permission denied. Only Admins and Managers can reverse transactions." }, { status: 403 });
    }

    const { paymentId, reason } = await req.json();

    if (!paymentId || !reason || reason.trim().length < 5) {
      return NextResponse.json({ error: "Payment ID and a mandatory detailed reversal reason (at least 5 characters) are required." }, { status: 400 });
    }

    // Fetch existing payment
    const payRes = await client.execute({
      sql: "SELECT * FROM payments WHERE id = ?",
      args: [paymentId],
    });
    if (payRes.rows.length === 0) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const payment = payRes.rows[0];
    if (payment.status === "reversed") {
      return NextResponse.json({ error: "This payment has already been reversed." }, { status: 400 });
    }

    const now = new Date().toISOString();

    // 1. Mark payment as reversed
    await client.execute({
      sql: `UPDATE payments 
            SET status = 'reversed', reversal_reason = ?, reversed_at = ?, reversed_by_user_id = ?
            WHERE id = ?`,
      args: [reason.trim(), now, user.id, paymentId],
    });

    // 2. Revert installment if linked
    if (payment.installment_id) {
      await client.execute({
        sql: `UPDATE installments 
              SET paid_amount = 0, status = 'pending', paid_date = NULL, receipt_id = NULL, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [payment.installment_id],
      });
    }

    // 3. Revert scheme member totals
    const payAmount = Number(payment.amount);
    await client.execute({
      sql: `UPDATE scheme_members 
            SET completed_installments = CASE WHEN completed_installments > 0 THEN completed_installments - 1 ELSE 0 END,
                total_paid_amount = CASE WHEN total_paid_amount >= ? THEN total_paid_amount - ? ELSE 0 END,
                total_pending_amount = total_pending_amount + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [payAmount, payAmount, payAmount, payment.member_id],
    });

    // 4. Financial Audit Trail
    await logAudit({
      userId: user.id,
      action: "PAYMENT_REVERSE",
      entityType: "payment",
      entityId: paymentId,
      details: {
        receiptNumber: payment.receipt_number,
        customerId: payment.customer_id,
        schemeId: payment.scheme_id,
        amount: payment.total_amount,
        reversalReason: reason.trim(),
        reversedBy: user.username,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${payment.receipt_number} has been reversed successfully with audit logging.`,
    });
  } catch (error: any) {
    console.error("Payment reversal error:", error);
    return NextResponse.json({ error: "Failed to reverse transaction" }, { status: 500 });
  }
}
