import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const schemeId = Number(params.id);
    const { customerId, customStartDate } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // Get Scheme details
    const schemeRes = await client.execute({
      sql: "SELECT * FROM schemes WHERE id = ?",
      args: [schemeId],
    });
    if (schemeRes.rows.length === 0) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }
    const scheme = schemeRes.rows[0];

    // Check if customer already enrolled in this scheme
    const checkRes = await client.execute({
      sql: "SELECT id FROM scheme_members WHERE scheme_id = ? AND customer_id = ? AND status = 'active'",
      args: [schemeId, customerId],
    });
    if (checkRes.rows.length > 0) {
      return NextResponse.json({ error: "Customer is already enrolled in this scheme" }, { status: 400 });
    }

    // Generate unique passbook number
    const countRes = await client.execute({
      sql: "SELECT COUNT(*) as count FROM scheme_members WHERE scheme_id = ?",
      args: [schemeId],
    });
    const nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
    const passbookNumber = `PB-${scheme.scheme_code}-${String(nextSeq).padStart(3, "0")}`;

    const startDate = customStartDate || new Date().toISOString().split("T")[0];
    const totalMonths = Number(scheme.total_months) || 12;
    const monthlyAmount = Number(scheme.monthly_amount);
    const totalDue = monthlyAmount * totalMonths;

    // Enroll in scheme_members
    const memberRes = await client.execute({
      sql: `INSERT INTO scheme_members 
            (scheme_id, customer_id, passbook_number, enrolled_date, status, completed_installments, total_paid_amount, total_pending_amount, maturity_date, branch_id)
            VALUES (?, ?, ?, ?, 'active', 0, 0, ?, ?, 1)`,
      args: [schemeId, customerId, passbookNumber, startDate, totalDue, scheme.end_date],
    });
    const memberId = Number(memberRes.lastInsertRowid);

    // Auto-generate installment schedules for every month
    const startObj = new Date(startDate);
    const dueDay = Number(scheme.due_day) || 10;

    for (let i = 1; i <= totalMonths; i++) {
      const dueMonthDate = new Date(startObj.getFullYear(), startObj.getMonth() + (i - 1), dueDay);
      const yyyy = dueMonthDate.getFullYear();
      const mm = String(dueMonthDate.getMonth() + 1).padStart(2, "0");
      const dd = String(dueDay).padStart(2, "0");
      const dueDate = `${yyyy}-${mm}-${dd}`;

      await client.execute({
        sql: `INSERT INTO installments 
              (member_id, scheme_id, customer_id, installment_number, due_date, amount, paid_amount, status)
              VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,
        args: [memberId, schemeId, customerId, i, dueDate, monthlyAmount],
      });
    }

    await logAudit({
      userId: user?.id,
      action: "ENROLL_SCHEME_MEMBER",
      entityType: "scheme_member",
      entityId: memberId,
      details: { schemeId, customerId, passbookNumber, totalMonths, monthlyAmount },
    });

    return NextResponse.json({
      success: true,
      memberId,
      passbookNumber,
      message: `Customer enrolled successfully with Passbook ${passbookNumber}`,
    });
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Failed to enroll customer in scheme" }, { status: 500 });
  }
}
