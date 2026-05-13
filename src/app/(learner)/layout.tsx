import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/auth/guards";
import { ROLE_LANDING } from "@/config/nav";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Educators/staff have their own shells. Bounce them home.
  if (user.role !== "learner") {
    redirect(ROLE_LANDING[user.role]);
  }

  return <AppShell user={user}>{children}</AppShell>;
}
