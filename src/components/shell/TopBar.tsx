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
      {/* Mobile: brand. Desktop: empty (sidebar carries the brand). */}
      <div className="lg:hidden">
        <Brand href="/topics" />
      </div>
      <div className="hidden lg:block" />
      <div className="flex flex-1 items-center justify-end gap-3">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
