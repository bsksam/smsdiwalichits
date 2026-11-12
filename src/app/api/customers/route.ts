import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let sql = `
      SELECT c.*, b.name as branch_name,
        (SELECT COUNT(*) FROM scheme_members WHERE customer_id = c.id AND status = 'active') as active_schemes_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM payments WHERE customer_id = c.id AND status = 'completed') as total_paid
      FROM customers c
      LEFT JOIN branches b ON c.branch_id = b.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (search) {
      sql += ` AND (
        c.full_name LIKE ? 
        OR c.mobile LIKE ? 
        OR c.alt_mobile LIKE ? 
        OR c.customer_code LIKE ? 
        OR c.city LIKE ?
        OR EXISTS (
          SELECT 1 FROM scheme_members sm 
          JOIN schemes s ON sm.scheme_id = s.id 
          WHERE sm.customer_id = c.id 
            AND (sm.passbook_number LIKE ? OR s.name LIKE ? OR s.tamil_name LIKE ? OR s.scheme_code LIKE ? OR CAST(s.monthly_amount AS TEXT) LIKE ?)
        )
      )`;
      const term = `%${search}%`;
      args.push(term, term, term, term, term, term, term, term, term, term);
    }

    if (status) {
      sql += ` AND c.status = ?`;
      args.push(status);
    }

    sql += ` ORDER BY c.id DESC`;

    const result = await client.execute({ sql, args });

    // Fetch enrolled schemes for each customer
    const customerIds = result.rows.map((c: any) => c.id);
    let schemesByCustomer: Record<number, any[]> = {};
    if (customerIds.length > 0) {
      const placeholders = customerIds.map(() => "?").join(",");
      const schemesRes = await client.execute({
        sql: `SELECT sm.id as member_id, sm.customer_id, sm.passbook_number, sm.status as member_status,
                     sm.completed_installments, sm.total_paid_amount, sm.total_pending_amount,
                     s.id as scheme_id, s.name as scheme_name, s.tamil_name as scheme_tamil_name,
                     s.monthly_amount, s.total_months, s.grocery_package_value
              FROM scheme_members sm
              JOIN schemes s ON sm.scheme_id = s.id
              WHERE sm.customer_id IN (${placeholders})
              ORDER BY sm.id ASC`,
        args: customerIds,
      });

      for (const row of schemesRes.rows as any[]) {
        if (!schemesByCustomer[row.customer_id]) {
          schemesByCustomer[row.customer_id] = [];
        }
        schemesByCustomer[row.customer_id].push(row);
      }
    }

    const customersWithSchemes = result.rows.map((c: any) => ({
      ...c,
      enrolled_schemes: schemesByCustomer[c.id] || [],
    }));

    return NextResponse.json({
      customers: customersWithSchemes,
    });
  } catch (error: any) {
    console.error("Customers list error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
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
      aadhaarRef,
      photoUrl,
      idProofUrl,
      nomineeName,
      nomineeRelation,
      nomineeMobile,
      branchId,
    } = data;

    if (!fullName || !mobile || !address || !city) {
      return NextResponse.json({ error: "Full Name, Mobile, Address, and City are required" }, { status: 400 });
    }

    // Auto-generate customer code
    const countRes = await client.execute("SELECT COUNT(*) as count FROM customers");
    const nextNum = Number(countRes.rows[0]?.count || 0) + 1;
    const year = new Date().getFullYear();
    const customerCode = `DC-${year}-${String(nextNum).padStart(4, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    const insertRes = await client.execute({
      sql: `INSERT INTO customers 
            (customer_code, full_name, father_husband_name, mobile, alt_mobile, address, city, district, pincode, aadhaar_ref, photo_url, id_proof_url, registration_date, nominee_name, nominee_relation, nominee_mobile, branch_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        customerCode,
        fullName.trim(),
        fatherOrHusbandName || null,
        mobile.trim(),
        altMobile || null,
        address.trim(),
        city.trim(),
        district?.trim() || "Salem",
        pincode?.trim() || "636001",
        aadhaarRef ? aadhaarRef.slice(-4) : null,
        photoUrl || null,
        idProofUrl || null,
        today,
        nomineeName || null,
        nomineeRelation || null,
        nomineeMobile || null,
        branchId || 1,
      ],
    });

    const newCustomerId = Number(insertRes.lastInsertRowid);

    await logAudit({
      userId: user?.id,
      action: "CREATE_CUSTOMER",
      entityType: "customer",
      entityId: newCustomerId,
      details: { customerCode, fullName, mobile },
    });

    return NextResponse.json({
      success: true,
      customerId: newCustomerId,
      customerCode,
      message: "Customer registered successfully",
    });
  } catch (error: any) {
    console.error("Customer creation error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
