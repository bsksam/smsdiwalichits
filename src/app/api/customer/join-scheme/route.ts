import { NextResponse } from "next/server";
import { client } from "@/db";
import { getCurrentCustomer } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getCurrentCustomer();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Please log in to join a scheme" }, { status: 401 });
    }

    const customerId = session.customerId;
    const { schemeId } = await req.json();

    if (!schemeId) {
      return NextResponse.json({ error: "Scheme selection is required" }, { status: 400 });
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

    // Generate unique passbook number with guaranteed uniqueness
    const schemeCode = String(scheme.scheme_code || `SCH-${schemeId}`).replace(/^PB-/, "");
    const countRes = await client.execute({
      sql: "SELECT COUNT(*) as count FROM scheme_members WHERE scheme_id = ?",
      args: [schemeId],
    });
    let nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
    let passbookNumber = `PB-${schemeCode}-${String(nextSeq).padStart(3, "0")}`;

    while (true) {
      const checkPb = await client.execute({
        sql: "SELECT id FROM scheme_members WHERE passbook_number = ?",
        args: [passbookNumber],
      });
      if (checkPb.rows.length === 0) break;
      nextSeq++;
      passbookNumber = `PB-${schemeCode}-${String(nextSeq).padStart(3, "0")}`;
    }

    const startDate = new Date().toISOString().split("T")[0];
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

    // Auto-generate installment schedules for all 12 months
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
      userId: customerId,
      action: "CUSTOMER_JOIN_SCHEME",
      entityType: "scheme_member",
      entityId: memberId,
      details: { schemeId, customerId, passbookNumber, monthlyAmount },
    });

    return NextResponse.json({
      success: true,
      memberId,
      passbookNumber,
      message: `Enrolled successfully! Your new Passbook Number is ${passbookNumber}`,
    });
  } catch (error: any) {
    console.error("Customer join scheme error:", error);
    return NextResponse.json({ error: "Failed to join scheme" }, { status: 500 });
  }
}
