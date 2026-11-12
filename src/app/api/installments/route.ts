import { NextResponse } from "next/server";
import { client } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const customerId = searchParams.get("customerId");
    const schemeId = searchParams.get("schemeId");
    const memberId = searchParams.get("memberId");
    const status = searchParams.get("status");

    let sql = `
      SELECT i.*, c.full_name as customer_name, c.mobile as customer_mobile, c.customer_code,
             s.name as scheme_name, s.tamil_name as scheme_tamil_name, s.monthly_amount, sm.passbook_number
      FROM installments i
      JOIN customers c ON i.customer_id = c.id
      JOIN schemes s ON i.scheme_id = s.id
      JOIN scheme_members sm ON i.member_id = sm.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (search) {
      sql += ` AND (
        c.full_name LIKE ? 
        OR c.mobile LIKE ? 
        OR c.customer_code LIKE ? 
        OR sm.passbook_number LIKE ? 
        OR s.name LIKE ? 
        OR s.tamil_name LIKE ? 
        OR CAST(s.monthly_amount AS TEXT) LIKE ?
      )`;
      const term = `%${search}%`;
      args.push(term, term, term, term, term, term, term);
    }

    if (customerId) {
      sql += " AND i.customer_id = ?";
      args.push(customerId);
    }
    if (schemeId) {
      sql += " AND i.scheme_id = ?";
      args.push(schemeId);
    }
    if (memberId) {
      sql += " AND i.member_id = ?";
      args.push(memberId);
    }
    if (status) {
      sql += " AND i.status = ?";
      args.push(status);
    }

    sql += " ORDER BY i.due_date ASC, i.installment_number ASC";

    const result = await client.execute({ sql, args });

    return NextResponse.json({ installments: result.rows });
  } catch (error: any) {
    console.error("Installments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch installments" }, { status: 500 });
  }
}
