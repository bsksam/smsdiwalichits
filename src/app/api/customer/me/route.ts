import { NextResponse } from "next/server";
import { client } from "@/db";
import { getCurrentCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentCustomer();
    if (!session || !session.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = session.customerId;

    // 1. Customer profile
    const custRes = await client.execute({
      sql: `SELECT c.*, b.name as branch_name 
            FROM customers c 
            LEFT JOIN branches b ON c.branch_id = b.id 
            WHERE c.id = ?`,
      args: [customerId],
    });

    if (custRes.rows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const customer = custRes.rows[0];

    // 2. Enrolled Schemes (with passbook details)
    const schemesRes = await client.execute({
      sql: `SELECT sm.*, s.name as scheme_name, s.tamil_name as scheme_tamil_name, 
                   s.monthly_amount, s.total_months, s.grocery_package_value, s.bonus_percentage,
                   s.terms_conditions, s.terms_conditions_tamil, s.end_date
            FROM scheme_members sm
            JOIN schemes s ON sm.scheme_id = s.id
            WHERE sm.customer_id = ?
            ORDER BY sm.id ASC`,
      args: [customerId],
    });

    // 3. Installments for all enrolled schemes
    const instRes = await client.execute({
      sql: `SELECT i.*, s.name as scheme_name, sm.passbook_number,
                   p.receipt_number, p.payment_mode
            FROM installments i
            JOIN schemes s ON i.scheme_id = s.id
            JOIN scheme_members sm ON i.member_id = sm.id
            LEFT JOIN payments p ON (i.id = p.installment_id AND p.status = 'completed')
            WHERE i.customer_id = ?
            ORDER BY i.member_id ASC, i.installment_number ASC`,
      args: [customerId],
    });

    // 4. Payments history
    const payRes = await client.execute({
      sql: `SELECT p.*, s.name as scheme_name, sm.passbook_number
            FROM payments p
            JOIN schemes s ON p.scheme_id = s.id
            JOIN scheme_members sm ON p.member_id = sm.id
            WHERE p.customer_id = ?
            ORDER BY p.id DESC`,
      args: [customerId],
    });

    // 5. Available Schemes to Join (catalog)
    const availableSchemesRes = await client.execute({
      sql: "SELECT * FROM schemes WHERE status = 'active' ORDER BY monthly_amount ASC",
    });

    return NextResponse.json({
      customer,
      enrolledSchemes: schemesRes.rows,
      installments: instRes.rows,
      payments: payRes.rows,
      availableSchemes: availableSchemesRes.rows,
    });
  } catch (error: any) {
    console.error("Customer me fetch error:", error);
    return NextResponse.json({ error: "Failed to load customer profile" }, { status: 500 });
  }
}
