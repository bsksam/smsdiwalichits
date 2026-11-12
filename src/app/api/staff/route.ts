import { NextResponse } from "next/server";
import { client } from "@/db";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const result = await client.execute(`
      SELECT u.id, u.username, u.full_name, u.mobile, u.role, u.branch_id, u.status, u.created_at,
             b.name as branch_name,
             (SELECT COUNT(*) FROM payments WHERE collected_by_user_id = u.id) as collection_count,
             (SELECT COALESCE(SUM(total_amount), 0) FROM payments WHERE collected_by_user_id = u.id AND status = 'completed') as total_collected
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      ORDER BY u.id ASC
    `);

    return NextResponse.json({ staff: result.rows });
  } catch (error: any) {
    console.error("Staff fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Only Admins can create staff accounts" }, { status: 403 });
    }

    const data = await req.json();
    const { username, password, fullName, mobile, role = "cashier", branchId = 1 } = data;

    if (!username || !password || !fullName || !mobile) {
      return NextResponse.json({ error: "Username, Password, Full Name, and Mobile are required" }, { status: 400 });
    }

    const checkUser = await client.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [username.trim()],
    });
    if (checkUser.rows.length > 0) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await client.execute({
      sql: `INSERT INTO users (username, password_hash, full_name, mobile, role, branch_id, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      args: [username.trim(), passwordHash, fullName.trim(), mobile.trim(), role, branchId],
    });

    const newUserId = Number(insertRes.lastInsertRowid);

    await logAudit({
      userId: currentUser.id,
      action: "CREATE_STAFF",
      entityType: "user",
      entityId: newUserId,
      details: { username, fullName, role },
    });

    return NextResponse.json({ success: true, message: "Staff user created successfully" });
  } catch (error: any) {
    console.error("Staff creation error:", error);
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Only Admins can edit staff accounts" }, { status: 403 });
    }

    const data = await req.json();
    const { id, fullName, mobile, role, branchId, status, newPassword } = data;

    if (!id || !fullName || !mobile || !role) {
      return NextResponse.json({ error: "Staff ID, Full Name, Mobile, and Role are required" }, { status: 400 });
    }

    if (newPassword && newPassword.trim().length >= 4) {
      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      await client.execute({
        sql: `UPDATE users 
              SET full_name = ?, mobile = ?, role = ?, branch_id = ?, status = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [fullName.trim(), mobile.trim(), role, branchId || 1, status || "active", passwordHash, id],
      });
    } else {
      await client.execute({
        sql: `UPDATE users 
              SET full_name = ?, mobile = ?, role = ?, branch_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [fullName.trim(), mobile.trim(), role, branchId || 1, status || "active", id],
      });
    }

    await logAudit({
      userId: currentUser.id,
      action: "UPDATE_STAFF",
      entityType: "user",
      entityId: id,
      details: { fullName, role, branchId, status, passwordUpdated: Boolean(newPassword) },
    });

    return NextResponse.json({ success: true, message: "Staff user updated successfully" });
  } catch (error: any) {
    console.error("Staff update error:", error);
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}
