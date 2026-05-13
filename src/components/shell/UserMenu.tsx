import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/server/actions";
import type { SessionUser } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/config/nav";
import { cn } from "@/lib/utils/cn";

export function UserMenu({ user, className }: { user: SessionUser; className?: string }) {
  const RoleIcon = ROLE_LABEL[user.role].icon;
  const initials = (user.fullName ?? user.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="hidden text-right sm:block">
        <p className="truncate text-sm font-medium text-ink">{user.fullName ?? user.email}</p>
        <p className="flex items-center justify-end gap-1 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
          <RoleIcon className="size-3" aria-hidden />
          {ROLE_LABEL[user.role].label}
        </p>
      </div>
      <div
        className="grid size-9 place-items-center rounded-full border border-hairline bg-surface-subtle text-sm font-medium text-ink"
        aria-hidden
      >
        {initials || "U"}
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
