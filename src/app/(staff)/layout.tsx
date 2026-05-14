import { AppShell } from "@/components/shell/AppShell";
import { requireMinRole } from "@/lib/auth/guards";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMinRole("content_manager");
  return <AppShell user={user}>{children}</AppShell>;
}
