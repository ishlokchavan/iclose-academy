import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/auth/guards";
import { ROLE_LANDING } from "@/config/nav";

export default async function EducatorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === "learner") redirect(ROLE_LANDING.learner);
  return <AppShell user={user}>{children}</AppShell>;
}
