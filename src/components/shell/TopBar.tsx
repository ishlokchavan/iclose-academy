import { Brand } from "@/components/shell/Brand";
import { UserMenu } from "@/components/shell/UserMenu";
import { SearchTrigger, SearchBar } from "@/features/search/components/SearchTrigger";
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

      <div className="flex flex-1 items-center justify-end gap-3">
        {/* Desktop search bar */}
        <SearchBar className="hidden lg:flex items-center gap-2 rounded-lg border border-hairline bg-zinc-50 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-100 transition-colors min-w-48" />
        {/* Mobile search icon */}
        <SearchTrigger className="flex lg:hidden items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 transition-colors" />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
