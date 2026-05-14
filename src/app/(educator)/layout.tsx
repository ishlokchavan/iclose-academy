import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/auth/guards";

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "learner") redirect("/topics");
  return <AppShell user={user}>{children}</AppShell>;
}
