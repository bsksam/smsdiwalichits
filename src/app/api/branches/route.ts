import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const result = await client.execute(`
      SELECT b.*,
             (SELECT COUNT(*) FROM customers WHERE branch_id = b.id) as customer_count,
             (SELECT COUNT(*) FROM scheme_members WHERE branch_id = b.id) as member_count,
             (SELECT COALESCE(SUM(total_amount), 0) FROM payments WHERE branch_id = b.id AND status = 'completed') as total_collection
      FROM branches b
      ORDER BY b.id ASC
    `);

    return NextResponse.json({ branches: result.rows });
  } catch (error: any) {
    console.error("Branches fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Only Admins can register branches" }, { status: 403 });
    }

    const data = await req.json();
    const { name, address, city, district, pincode, phone, email } = data;

    if (!name || !address || !city || !phone) {
      return NextResponse.json({ error: "Branch Name, Address, City, and Phone are required" }, { status: 400 });
    }

    const countRes = await client.execute("SELECT COUNT(*) as count FROM branches");
    const nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
    const code = `BR-${String(nextSeq).padStart(2, "0")}`;

    const insertRes = await client.execute({
      sql: `INSERT INTO branches (code, name, address, city, district, pincode, phone, email, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [code, name.trim(), address.trim(), city.trim(), district || "Salem", pincode || "636001", phone.trim(), email || null],
    });

    const newBranchId = Number(insertRes.lastInsertRowid);

    await logAudit({
      userId: currentUser.id,
      action: "CREATE_BRANCH",
      entityType: "branch",
      entityId: newBranchId,
      details: { code, name, city },
    });

    return NextResponse.json({ success: true, message: "Branch registered successfully" });
  } catch (error: any) {
    console.error("Branch creation error:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Only Admins can edit branches" }, { status: 403 });
    }

    const data = await req.json();
    const { id, name, address, city, district, pincode, phone, email, isMainBranch } = data;

    if (!id || !name || !address || !city || !phone) {
      return NextResponse.json({ error: "Branch ID, Name, Address, City, and Phone are required" }, { status: 400 });
    }

    // If marked as main branch, unmark others
    if (isMainBranch) {
      await client.execute({
        sql: "UPDATE branches SET is_main_branch = 0",
        args: [],
      });
    }

    await client.execute({
      sql: `UPDATE branches 
            SET name = ?, address = ?, city = ?, district = ?, pincode = ?, phone = ?, email = ?, 
                is_main_branch = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [
        name.trim(),
        address.trim(),
        city.trim(),
        district || "Salem",
        pincode || "636001",
        phone.trim(),
        email || null,
        isMainBranch ? 1 : 0,
        id,
      ],
    });

    await logAudit({
      userId: currentUser.id,
      action: "UPDATE_BRANCH",
      entityType: "branch",
      entityId: id,
      details: { name, city, phone, isMainBranch },
    });

    return NextResponse.json({ success: true, message: "Branch updated successfully" });
  } catch (error: any) {
    console.error("Branch update error:", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}
