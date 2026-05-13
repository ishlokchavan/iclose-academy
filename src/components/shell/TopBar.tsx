import { Brand } from "@/components/shell/Brand";
import { UserMenu } from "@/components/shell/UserMenu";
import type { SessionUser } from "@/lib/auth/session";

export function TopBar({ user }: { user: SessionUser }) {
  return (
    <header
      className={[
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 sm:px-6",
        "border-b border-hairline bg-surface-raised/90 backdrop-blur",
      ].join(" ")}
    >
      {/* Mobile: brand. Desktop: empty space (sidebar has the brand). */}
      <div className="lg:hidden">
        <Brand href="/dashboard" />
      </div>
      <div className="hidden lg:block" />

      <UserMenu user={user} />
    </header>
  );
}
