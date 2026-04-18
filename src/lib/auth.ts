import { SignJWT, jwtVerify, JWTPayload } from "jose";
import * as argon2 from "argon2";
import { cookies } from "next/headers";

export interface UserPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "editor" | "instructor";
  name: string;
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
const ALG = "HS256";
const TOKEN_NAME = "auth_token";
const EXPIRES_IN = "24h";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export function requireRole(user: UserPayload | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
