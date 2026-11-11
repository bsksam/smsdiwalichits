import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id;

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

    // 2. Enrolled Schemes
    const schemesRes = await client.execute({
      sql: `SELECT sm.*, s.name as scheme_name, s.tamil_name as scheme_tamil_name, 
                   s.monthly_amount, s.total_months, s.grocery_package_value, s.bonus_percentage
            FROM scheme_members sm
            JOIN schemes s ON sm.scheme_id = s.id
            WHERE sm.customer_id = ?
            ORDER BY sm.id DESC`,
      args: [customerId],
    });

    // 3. Payments History
    const paymentsRes = await client.execute({
      sql: `SELECT p.*, s.name as scheme_name, u.full_name as collected_by_name
            FROM payments p
            JOIN schemes s ON p.scheme_id = s.id
            LEFT JOIN users u ON p.collected_by_user_id = u.id
            WHERE p.customer_id = ?
            ORDER BY p.id DESC`,
      args: [customerId],
    });

    // 4. Installments Ledger
    const installmentsRes = await client.execute({
      sql: `SELECT i.*, s.name as scheme_name, sm.passbook_number
            FROM installments i
            JOIN schemes s ON i.scheme_id = s.id
            JOIN scheme_members sm ON i.member_id = sm.id
            WHERE i.customer_id = ?
            ORDER BY i.due_date ASC`,
      args: [customerId],
    });

    // 5. Redemptions History
    const redemptionsRes = await client.execute({
      sql: `SELECT r.*, s.name as scheme_name, pt.name as package_name
            FROM redemptions r
            JOIN schemes s ON r.scheme_id = s.id
            LEFT JOIN package_templates pt ON r.package_id = pt.id
            WHERE r.customer_id = ?
            ORDER BY r.id DESC`,
      args: [customerId],
    });

    return NextResponse.json({
      customer,
      schemes: schemesRes.rows,
      payments: paymentsRes.rows,
      installments: installmentsRes.rows,
      redemptions: redemptionsRes.rows,
    });
  } catch (error: any) {
    console.error("Customer detail fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch customer details" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const customerId = params.id;
    const data = await req.json();

    const {
      fullName,
      fatherOrHusbandName,
      mobile,
      altMobile,
      address,
      city,
      district,
      pincode,
      nomineeName,
      nomineeRelation,
      nomineeMobile,
      status,
    } = data;

    await client.execute({
      sql: `UPDATE customers 
            SET full_name = ?, father_husband_name = ?, mobile = ?, alt_mobile = ?, 
                address = ?, city = ?, district = ?, pincode = ?, 
                nominee_name = ?, nominee_relation = ?, nominee_mobile = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [
        fullName,
        fatherOrHusbandName || null,
        mobile,
        altMobile || null,
        address,
        city,
        district || "Salem",
        pincode || "636001",
        nomineeName || null,
        nomineeRelation || null,
        nomineeMobile || null,
        status || "active",
        customerId,
      ],
    });

    await logAudit({
      userId: user?.id,
      action: "UPDATE_CUSTOMER",
      entityType: "customer",
      entityId: customerId,
      details: data,
    });

    return NextResponse.json({ success: true, message: "Customer updated successfully" });
  } catch (error: any) {
    console.error("Customer update error:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const customerId = params.id;

    // Check if customer has payments
    const paymentsRes = await client.execute({
      sql: "SELECT COUNT(*) as count FROM payments WHERE customer_id = ?",
      args: [customerId],
    });

    if (Number(paymentsRes.rows[0]?.count || 0) > 0) {
      // Soft delete: Change status to inactive / blocked
      await client.execute({
        sql: "UPDATE customers SET status = 'blocked', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        args: [customerId],
      });
    } else {
      await client.execute({
        sql: "DELETE FROM customers WHERE id = ?",
        args: [customerId],
      });
    }

    await logAudit({
      userId: user?.id,
      action: "DELETE_CUSTOMER",
      entityType: "customer",
      entityId: customerId,
      details: { customerId },
    });

    return NextResponse.json({ success: true, message: "Customer removed successfully" });
  } catch (error: any) {
    console.error("Customer delete error:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
