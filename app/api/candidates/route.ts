import { AUTH_COOKIE, getDashboardPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE);

  if (session?.value !== getDashboardPassword()) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ candidates });
}
