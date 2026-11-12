import { NextResponse } from "next/server";
import { client } from "@/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { mobile, password } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json({ error: "Mobile number and password are required" }, { status: 400 });
    }

    const cleanMobile = mobile.trim();
    const custRes = await client.execute({
      sql: "SELECT * FROM customers WHERE mobile = ?",
      args: [cleanMobile],
    });

    if (custRes.rows.length === 0) {
      return NextResponse.json({
        error: "No customer account found with this mobile number. Click 'Create Account' to register.",
      }, { status: 404 });
    }

    const customer = custRes.rows[0];

    if (customer.status === "blocked") {
      return NextResponse.json({ error: "Your account is temporarily suspended. Contact shop administration." }, { status: 403 });
    }

    if (!customer.password_hash) {
      return NextResponse.json({
        error: "Password not set for this account. Click 'Create Account & Join Scheme' to set your password and access your passbooks.",
      }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, String(customer.password_hash));
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }

    const sessionUser = {
      id: Number(customer.id),
      customerId: Number(customer.id),
      username: cleanMobile,
      fullName: String(customer.full_name),
      mobile: cleanMobile,
      role: "customer",
      branchId: customer.branch_id ? Number(customer.branch_id) : 1,
    };

    const token = signToken(sessionUser);

    await logAudit({
      userId: Number(customer.id),
      action: "CUSTOMER_LOGIN",
      entityType: "customer",
      entityId: Number(customer.id),
      details: { mobile: cleanMobile, customerCode: customer.customer_code },
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      customer: sessionUser,
    });

    response.cookies.set("diwali_chit_customer_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Customer login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
