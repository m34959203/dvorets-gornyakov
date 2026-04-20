import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearAuthCookie();
  const locale = request.nextUrl.pathname.startsWith("/kk") ? "kk" : "ru";
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url), { status: 303 });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
