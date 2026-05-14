import { AppShell } from "@/components/shell/AppShell";
import { requireUser } from "@/lib/auth/guards";

/**
 * Public surface layout: library, topic details, inquiries, profile, saved.
 * Open to any signed-in role — educators and staff can browse the library too.
 * Per-role nav comes from `navForRole` inside AppShell.
 */
export default async function PublicSurfaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
