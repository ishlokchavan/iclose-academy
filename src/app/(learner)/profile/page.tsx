import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/patterns/PageHeader";
import { signOutAction } from "@/features/auth/server/actions";
import { requireUser } from "@/lib/auth/guards";
import { ROLE_LABEL } from "@/config/nav";
import { getOwnLeadData } from "@/features/profile/server/actions";
import { ProfileEditForm } from "@/features/profile/components/ProfileEditForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const RoleIcon = ROLE_LABEL[user.role].icon;
  const roleLabel = ROLE_LABEL[user.role].label;

  const lead = user.email ? await getOwnLeadData(user.email) : null;

  const initialFirstName = lead?.first_name ?? "";
  const initialLastName = lead?.last_name ?? "";
  const initialPhone = lead?.phone ?? "";

  // Display name prefers the lead row; falls back to profile.full_name
  const displayName =
    [lead?.first_name, lead?.last_name].filter(Boolean).join(" ") ||
    user.fullName ||
    user.email ||
    "";

  const initials = (displayName || "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage your personal details and contact information."
      />

      {/* Identity card */}
      <section className="rounded-lg border border-hairline bg-surface-raised p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full border border-hairline bg-surface-subtle text-lg font-semibold text-ink">
            {initials}
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-ink">{displayName || "—"}</p>
            <p className="text-sm text-ink-muted">{user.email}</p>
            <p className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              <RoleIcon className="size-3" /> {roleLabel}
            </p>
          </div>
        </div>
      </section>

      {/* Edit personal details */}
      <section className="rounded-lg border border-hairline bg-surface-raised p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Personal details</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Update your name, email, and phone number.
          </p>
        </div>
        <ProfileEditForm
          initialFirstName={initialFirstName}
          initialLastName={initialLastName}
          initialEmail={user.email ?? ""}
          initialPhone={initialPhone}
        />
      </section>

      {/* Session */}
      <section className="rounded-lg border border-hairline bg-surface-raised p-6">
        <h2 className="text-sm font-semibold text-ink">Session</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Sign out to switch accounts.
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
