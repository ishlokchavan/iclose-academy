import { BottomNav } from "@/components/shell/BottomNav";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { navForRole } from "@/config/nav";
import { CommandPalette } from "@/features/search/components/CommandPalette";
import type { SessionUser } from "@/lib/auth/session";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const sections = navForRole(user.role);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar sections={sections} />
      <div className="lg:pl-60">
        <TopBar user={user} />
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
      <BottomNav sections={sections} />
      <CommandPalette />
    </div>
  );
}
