import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const result = await client.execute(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM scheme_members WHERE scheme_id = s.id AND status = 'active') as enrolled_members_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM payments WHERE scheme_id = s.id AND status = 'completed') as total_collected,
        (SELECT COUNT(*) FROM package_templates WHERE scheme_id = s.id) as package_count
      FROM schemes s
      ORDER BY s.id ASC
    `);

    return NextResponse.json({ schemes: result.rows });
  } catch (error: any) {
    console.error("Schemes list error:", error);
    return NextResponse.json({ error: "Failed to fetch schemes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      name,
      tamilName,
      schemeType,
      monthlyAmount,
      totalMonths,
      totalMembers,
      joiningFee,
      dueDay,
      startDate,
      endDate,
      groceryPackageValue,
      bonusPercentage,
      redemptionType,
      termsConditions,
      termsConditionsTamil,
    } = data;

    if (!name || !tamilName || !monthlyAmount || !totalMonths || !groceryPackageValue) {
      return NextResponse.json({ error: "Name, Tamil Name, Monthly Amount, Duration, and Package Value are required" }, { status: 400 });
    }

    const countRes = await client.execute("SELECT COUNT(*) as count FROM schemes");
    const nextNum = Number(countRes.rows[0]?.count || 0) + 1;
    const schemeCode = `SCH-${monthlyAmount}`;

    const insertRes = await client.execute({
      sql: `INSERT INTO schemes 
            (scheme_code, name, tamil_name, scheme_type, monthly_amount, total_months, total_members, joining_fee, due_day, start_date, end_date, grocery_package_value, bonus_percentage, redemption_type, terms_conditions, terms_conditions_tamil, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        schemeCode,
        name,
        tamilName,
        schemeType || "monthly_fixed",
        Number(monthlyAmount),
        Number(totalMonths) || 12,
        Number(totalMembers) || 100,
        Number(joiningFee) || 0,
        Number(dueDay) || 10,
        startDate || new Date().toISOString().split("T")[0],
        endDate || `${new Date().getFullYear()}-12-31`,
        Number(groceryPackageValue),
        Number(bonusPercentage) || 0,
        redemptionType || "grocery_only",
        termsConditions || "",
        termsConditionsTamil || "",
      ],
    });

    const newSchemeId = Number(insertRes.lastInsertRowid);

    await logAudit({
      userId: user?.id,
      action: "CREATE_SCHEME",
      entityType: "scheme",
      entityId: newSchemeId,
      details: { schemeCode, name, monthlyAmount },
    });

    return NextResponse.json({
      success: true,
      schemeId: newSchemeId,
      message: "Scheme created successfully",
    });
  } catch (error: any) {
    console.error("Scheme creation error:", error);
    return NextResponse.json({ error: "Failed to create scheme" }, { status: 500 });
  }
}
