import { AUTH_COOKIE, getDashboardPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password !== getDashboardPassword()) {
      return NextResponse.json({ error: "Parolă incorectă" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, getDashboardPassword(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă" }, { status: 400 });
  }
}
