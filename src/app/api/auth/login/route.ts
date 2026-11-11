import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username.trim()));

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "Account is inactive. Contact Administrator." }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
    };

    const token = signToken(sessionUser);

    await logAudit({
      userId: user.id,
      action: "LOGIN",
      entityType: "user",
      entityId: user.id,
      details: { username: user.username, role: user.role },
    });

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    // Set HTTP-only session cookie
    response.cookies.set("diwali_chit_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
