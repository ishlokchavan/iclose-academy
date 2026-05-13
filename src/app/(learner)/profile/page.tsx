import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/patterns/PageHeader";
import { signOutAction } from "@/features/auth/server/actions";
import { requireUser } from "@/lib/auth/guards";
import { ROLE_LABEL } from "@/config/nav";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const RoleIcon = ROLE_LABEL[user.role].icon;
  const roleLabel = ROLE_LABEL[user.role].label;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Identity, role, and session controls."
      />

      <section className="rounded-lg border border-hairline bg-surface-raised p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full border border-hairline bg-surface-subtle text-lg font-semibold text-ink">
            {(user.fullName ?? user.email ?? "U")
              .split(" ")
              .map((p) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-ink">{user.fullName ?? "—"}</p>
            <p className="text-sm text-ink-muted">{user.email}</p>
            <p className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              <RoleIcon className="size-3" /> {roleLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-hairline bg-surface-raised p-6">
        <h2 className="text-sm font-semibold text-ink">Session</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Sign out to switch accounts. Profile editing (display name, avatar) lands in Phase 5.
        </p>
        <form action={signOutAction} className="mt-4">
          <Button type="submit" variant="secondary">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </section>
    </div>
  );
}
