"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { EmailLink, TelLink } from "@/components/patterns/ContactLink";
import { MembersTree } from "@/features/members/components/MembersTree";
import {
  deletePartnerAction,
  loadPartnerReferralsAction,
  sendPartnerInviteAction,
  setPartnerStatusAction,
  updatePartnerAction,
} from "@/features/partner-management/server/actions";
import type {
  PartnerAdminRow,
  PartnerReferralTree,
} from "@/features/partner-management/server/queries";
import { formatDateTime } from "@/lib/utils/date";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-x-3 py-2">
      <span className="text-[12px] font-medium text-ink-muted pt-px">{label}</span>
      <span className="text-[13px] text-ink break-words">
        {value ?? <span className="text-ink-muted">—</span>}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
        {title}
      </p>
      <div className="rounded-xl border border-hairline bg-surface-subtle/50 divide-y divide-hairline px-4">
        {children}
      </div>
    </div>
  );
}

type Mode = "view" | "edit";

export function PartnerAdminDrawer({
  partner,
  canDelete,
  onClose,
}: {
  partner: PartnerAdminRow | null;
  canDelete: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", code: "", status: "active" as "active" | "inactive" });
  const [tree, setTree] = useState<PartnerReferralTree | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  // Reset to view-mode whenever a new partner is opened.
  useEffect(() => {
    if (partner) {
      setMode("view");
      setError(null);
      setInviteStatus(null);
      setForm({
        name:   partner.name,
        phone:  partner.phone ?? "",
        code:   partner.code,
        status: (partner.status === "inactive" ? "inactive" : "active"),
      });
    }
  }, [partner?.id, partner]);

  // Load the partner's referral tree on demand when the drawer opens.
  useEffect(() => {
    if (!partner) {
      setTree(null);
      return;
    }
    let cancelled = false;
    setTreeLoading(true);
    setTree(null);
    loadPartnerReferralsAction(partner.code)
      .then((result) => {
        if (!cancelled) setTree(result);
      })
      .finally(() => {
        if (!cancelled) setTreeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [partner?.id, partner?.code, partner]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError(null);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!partner) return;
    setError(null);
    startTransition(async () => {
      const result = await updatePartnerAction(partner.id, form);
      if (result.error) { setError(result.error); return; }
      setMode("view");
    });
  }

  function handleToggleStatus() {
    if (!partner) return;
    const next = partner.status === "inactive" ? "active" : "inactive";
    startTransition(async () => {
      const result = await setPartnerStatusAction(partner.id, next);
      if (result.error) setError(result.error);
    });
  }

  function handleSendInvite() {
    if (!partner) return;
    setError(null);
    setInviteStatus(null);
    startTransition(async () => {
      const result = await sendPartnerInviteAction(partner.id);
      if (result.error) { setError(result.error); return; }
      setInviteStatus(`Invite sent to ${partner.email}.`);
    });
  }

  function handleDelete() {
    if (!partner) return;
    const confirmed = window.confirm(
      `Delete partner "${partner.name}"? This removes their conversions and commissions too. This cannot be undone.`,
    );
    if (!confirmed) return;
    startTransition(async () => {
      const result = await deletePartnerAction(partner.id);
      if (result.error) { setError(result.error); return; }
      onClose();
    });
  }

  return (
    <Sheet open={!!partner} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        title={partner?.name ?? "Partner"}
        description="Partner details and actions"
        className="overflow-y-auto"
      >
        {partner ? (
          <div className="space-y-6 p-6">
            <header className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                Partner
              </p>
              <h2 className="text-[20px] font-semibold tracking-tight text-ink">
                {partner.name}
              </h2>
              <p className="text-[12px] font-mono text-ink-muted">{partner.code}</p>
            </header>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-hairline px-4 py-3">
                <p className="text-[11px] font-medium text-ink-muted">Clicks</p>
                <p className="text-[20px] font-semibold text-ink">{partner.clicks}</p>
              </div>
              <div className="rounded-xl border border-hairline px-4 py-3">
                <p className="text-[11px] font-medium text-ink-muted">Signups</p>
                <p className="text-[20px] font-semibold text-ink">{partner.signups}</p>
              </div>
            </div>

            {mode === "view" ? (
              <>
                <Section title="Contact">
                  <FieldRow
                    label="Email"
                    value={<EmailLink email={partner.email} stopPropagation />}
                  />
                  <FieldRow
                    label="Phone"
                    value={partner.phone ? <TelLink phone={partner.phone} stopPropagation /> : null}
                  />
                </Section>

                <Section title="Account">
                  <FieldRow label="Status" value={<StatusPill value={partner.status} />} />
                  <FieldRow label="Has login" value={partner.user_id ? "Yes" : "No (pending invite)"} />
                  <FieldRow label="Verified" value={partner.is_verified ? formatDateTime(partner.verified_at ?? "") : "No"} />
                  <FieldRow label="Joined" value={partner.created_at ? formatDateTime(partner.created_at) : null} />
                </Section>

                {/* Referral tree — who signed up from this partner */}
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                      Referral tree
                    </p>
                    {tree ? (
                      <p className="text-[11px] text-ink-muted">
                        {tree.directCount} direct
                        {tree.networkSize > tree.directCount ? ` · ${tree.networkSize} total` : ""}
                      </p>
                    ) : null}
                  </div>
                  {treeLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : tree && tree.nodes.length > 0 ? (
                    <MembersTree members={tree.nodes} />
                  ) : (
                    <p className="rounded-xl border border-hairline bg-surface-subtle/50 px-4 py-6 text-center text-[13px] text-ink-muted">
                      No signups from this partner yet.
                    </p>
                  )}
                </div>

                {error ? (
                  <p className="text-[13px] text-destructive" role="alert">{error}</p>
                ) : null}
                {inviteStatus ? (
                  <p className="text-[13px] text-emerald-600">{inviteStatus}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setMode("edit")}>Edit</Button>
                  <Button variant="secondary" onClick={handleSendInvite} disabled={isPending}>
                    {partner.user_id && partner.is_verified ? "Resend invite" : "Send invite"}
                  </Button>
                  <Button variant="secondary" onClick={handleToggleStatus} disabled={isPending}>
                    {partner.status === "inactive" ? "Activate" : "Deactivate"}
                  </Button>
                  {canDelete ? (
                    <Button
                      variant="secondary"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="text-destructive hover:bg-destructive/5"
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code">Referral code</Label>
                  <Input id="code" name="code" value={form.code} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-9 w-full rounded-lg border border-hairline bg-background px-3 text-[14px] text-ink"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {error ? (
                  <p className="text-[13px] text-destructive" role="alert">{error}</p>
                ) : null}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setMode("view")} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function StatusPill({ value }: { value: string | null }) {
  const active = value !== "inactive";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-zinc-400",
        ].join(" ")}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
