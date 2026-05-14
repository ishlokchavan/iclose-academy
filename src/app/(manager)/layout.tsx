import { AppShell } from "@/components/shell/AppShell";
import { requireMinRole } from "@/lib/auth/guards";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMinRole("manager");
  return <AppShell user={user}>{children}</AppShell>;
}
