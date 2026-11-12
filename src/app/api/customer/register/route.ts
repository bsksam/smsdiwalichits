import { NextResponse } from "next/server";
import { client } from "@/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      fullName,
      mobile,
      password,
      address,
      city = "Salem",
      district = "Salem",
      pincode = "636001",
      fatherOrHusbandName,
      nomineeName,
    } = data;

    if (!fullName || !mobile || !password) {
      return NextResponse.json({ error: "Name, Mobile Number, and Password are required" }, { status: 400 });
    }

    if (mobile.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters long" }, { status: 400 });
    }

    const cleanMobile = mobile.trim();
    const passwordHash = await bcrypt.hash(password, 10);
    const regDate = new Date().toISOString().split("T")[0];

    // Check if customer with this mobile exists
    const checkRes = await client.execute({
      sql: "SELECT * FROM customers WHERE mobile = ?",
      args: [cleanMobile],
    });

    let customerId: number;
    let customerCode: string;

    if (checkRes.rows.length > 0) {
      const existing = checkRes.rows[0];
      if (existing.password_hash) {
        return NextResponse.json({
          error: "An account with this mobile number already exists. Please log in directly with your password.",
        }, { status: 400 });
      }

      // Customer was added offline by supermarket cashier; set password now
      await client.execute({
        sql: `UPDATE customers 
              SET password_hash = ?, 
                  address = COALESCE(NULLIF(address, ''), ?), 
                  city = COALESCE(NULLIF(city, ''), ?),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [passwordHash, address || "Salem", city, existing.id],
      });
      customerId = Number(existing.id);
      customerCode = String(existing.customer_code);
    } else {
      // Create brand new customer
      const countRes = await client.execute("SELECT COUNT(*) as count FROM customers");
      const nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
      const year = new Date().getFullYear();
      customerCode = `DC-${year}-${String(nextSeq).padStart(4, "0")}`;

      const insertRes = await client.execute({
        sql: `INSERT INTO customers 
              (customer_code, full_name, father_husband_name, mobile, address, city, district, pincode, 
               registration_date, nominee_name, branch_id, status, password_hash)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', ?)`,
        args: [
          customerCode,
          fullName.trim(),
          fatherOrHusbandName ? fatherOrHusbandName.trim() : null,
          cleanMobile,
          address ? address.trim() : city,
          city.trim(),
          district,
          pincode,
          regDate,
          nomineeName ? nomineeName.trim() : null,
          passwordHash,
        ],
      });
      customerId = Number(insertRes.lastInsertRowid);
    }

    const sessionUser = {
      id: customerId,
      customerId,
      username: cleanMobile,
      fullName: fullName.trim(),
      mobile: cleanMobile,
      role: "customer",
      branchId: 1,
    };

    const token = signToken(sessionUser);

    await logAudit({
      userId: customerId,
      action: "CUSTOMER_REGISTER",
      entityType: "customer",
      entityId: customerId,
      details: { customerCode, fullName, mobile: cleanMobile },
    });

    const response = NextResponse.json({
      success: true,
      message: "Customer account created successfully",
      customer: sessionUser,
      customerCode,
    });

    response.cookies.set("diwali_chit_customer_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Customer registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
  }
}
