import { BottomNav } from "@/components/shell/BottomNav";
import { MainTransition } from "@/components/shell/MainTransition";
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Sidebar sections={sections} />
      <div className="lg:pl-60">
        <TopBar user={user} />
        <main
          id="main"
          tabIndex={-1}
          className="px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10 focus:outline-none"
        >
          <div className="mx-auto max-w-5xl">
            <MainTransition>{children}</MainTransition>
          </div>
        </main>
      </div>
      <BottomNav sections={sections} />
      <CommandPalette />
    </div>
  );
}
