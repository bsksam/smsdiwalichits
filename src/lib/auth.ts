import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "diwali_chit_secure_jwt_secret_key_supermarket_2026_chennai_salem";

export interface SessionUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  branchId?: number | null;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("diwali_chit_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
