import { Brand } from "@/components/shell/Brand";
import { UserMenu } from "@/components/shell/UserMenu";
import type { SessionUser } from "@/lib/auth/session";

export function TopBar({ user }: { user: SessionUser }) {
  return (
    <header
      className={[
        "sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 px-4 sm:px-6",
        /* Apple frosted glass nav bar */
        "bg-surface-raised/75 backdrop-blur-xl",
        "border-b border-hairline/60",
      ].join(" ")}
    >
      {/* Mobile only: brand */}
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
