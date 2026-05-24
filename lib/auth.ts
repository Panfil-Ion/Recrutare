import { cookies } from "next/headers";

export const AUTH_COOKIE = "dashboard_session";

export function getDashboardPassword(): string {
  return process.env.DASHBOARD_PASSWORD ?? "architect2024";
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE);
  return session?.value === getDashboardPassword();
}
