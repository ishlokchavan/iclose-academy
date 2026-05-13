import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser, type AppRole, type SessionUser } from "@/lib/auth/session";

/**
 * Require an authenticated user. Redirects to /sign-in if missing.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

const ROLE_RANK: Record<AppRole, number> = {
  learner: 0,
  educator: 1,
  content_manager: 2,
  admin: 3,
};

/**
 * Require the user to have at least one of the allowed roles.
 * Redirects to /dashboard if authenticated with insufficient role.
 */
export async function requireRole(...allowed: AppRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect("/dashboard");
  return user;
}

/**
 * Require role of `min` or higher (admin > content_manager > educator > learner).
 */
export async function requireMinRole(min: AppRole): Promise<SessionUser> {
  const user = await requireUser();
  if (ROLE_RANK[user.role] < ROLE_RANK[min]) redirect("/dashboard");
  return user;
}

export function hasRole(user: SessionUser | null, ...allowed: AppRole[]) {
  return user != null && allowed.includes(user.role);
}

export function hasMinRole(user: SessionUser | null, min: AppRole) {
  return user != null && ROLE_RANK[user.role] >= ROLE_RANK[min];
}
