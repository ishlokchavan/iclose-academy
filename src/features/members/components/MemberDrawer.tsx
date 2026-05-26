"use client";

import { Check, ChevronRight, Copy, CornerDownRight, ExternalLink, Link2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { referralLink } from "../constants";
import { deleteMemberAction } from "../server/actions";
import type { MemberDetail, TreeNode } from "../server/queries";
import { formatDate as fmtDate, formatDateTime as fmtDateTime } from "@/lib/utils/date";

export function MemberDrawer({
  open, loading, detail, onClose, onDeleted,
}: {
  open: boolean;
  loading: boolean;
  detail: MemberDetail | null;
  onClose: () => void;
  onDeleted: (leadId: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent title="Affiliate details" description="View referrals and click activity">
        <Body loading={loading} detail={detail} onDeleted={onDeleted} />
      </SheetContent>
    </Sheet>
  );
}

function Body({
  loading, detail, onDeleted,
}: {
  loading: boolean;
  detail: MemberDetail | null;
  onDeleted: (leadId: string) => void;
}) {
  if (loading || !detail) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const { lead, ancestors, downstreamTree, directReferralCount, totalDownstreamCount, clicks } = detail;
  // Referral links point at the marketing site, not the academy app origin.
  // Falls back to NEXT_PUBLIC_SITE_URL if the marketing var is unset.
  const siteUrl = (
    process.env.NEXT_PUBLIC_MARKETING_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  ).replace(/\/+$/, "");
  const link = lead.referral_code && siteUrl ? referralLink(siteUrl, lead.referral_code) : null;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-hairline px-6 pb-6 pt-8">
        <p className="eyebrow">Affiliate</p>
        <h2 className="mt-1.5 text-[22px] font-bold tracking-tight text-ink">
          {lead.name || lead.email}
        </h2>
        <p className="text-[13px] text-ink-muted">{lead.email}</p>
        {lead.phone ? (
          <p className="mt-0.5 text-[13px] text-ink-muted">{lead.phone}</p>
        ) : null}
        <p className="mt-3 text-[12px] text-ink-muted">
          Joined {fmtDate(lead.created_at)}
          {lead.source ? ` · via ${lead.source}` : null}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 border-b border-hairline px-6 py-5">
        <Stat label="Clicks"   value={lead.clicks} />
        <Stat label="Unique"   value={lead.unique_visitors} />
        <Stat label="Direct"   value={directReferralCount} accent />
        <Stat label="Network"  value={totalDownstreamCount} />
      </div>

      {/* Code + link */}
      {link ? (
        <div className="border-b border-hairline px-6 py-5">
          <p className="eyebrow mb-2">Referral link</p>
          <CopyField value={link} />
          <div className="mt-2 flex items-center gap-2 text-[12px] text-ink-muted">
            <Link2 className="size-3" />
            <span>Code:</span>
            <code className="rounded border border-hairline bg-surface-subtle px-1.5 py-0.5 font-mono text-[11px] text-ink">
              {lead.referral_code}
            </code>
          </div>
        </div>
      ) : null}

      {/* Upstream chain — root → ... → direct referrer */}
      {ancestors.length > 0 ? (
        <div className="border-b border-hairline px-6 py-5">
          <p className="eyebrow mb-2">Upstream chain</p>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
            {[...ancestors].reverse().map((a, i, arr) => (
              <span key={a.id} className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-subtle px-2 py-0.5">
                  <span className="font-medium text-ink truncate max-w-[140px]">{a.name || a.email}</span>
                  {a.referral_code ? (
                    <code className="font-mono text-[10px] text-ink-muted">{a.referral_code}</code>
                  ) : null}
                </span>
                {i < arr.length - 1 || true ? (
                  <ChevronRight className="size-3 text-ink-muted shrink-0" />
                ) : null}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5">
              <span className="font-semibold text-ink truncate max-w-[160px]">
                {lead.name || lead.email}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-accent">You</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            {ancestors.length === 1
              ? "1 tier above"
              : `${ancestors.length} tiers above`}
          </p>
        </div>
      ) : null}

      {/* Downstream tree */}
      <div className="border-b border-hairline px-6 py-5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="eyebrow">Downstream tree</p>
          <p className="text-[11px] text-ink-muted">
            {directReferralCount} direct
            {totalDownstreamCount > directReferralCount
              ? ` · ${totalDownstreamCount} total`
              : null}
          </p>
        </div>
        {downstreamTree.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No one has signed up with this code yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {downstreamTree.map((node) => (
              <TreeRow key={node.id} node={node} indent={0} />
            ))}
          </ul>
        )}
      </div>

      {/* Click log */}
      <div className="px-6 py-5">
        <p className="eyebrow mb-2">Recent clicks ({clicks.length})</p>
        {clicks.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No clicks recorded yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {clicks.map((c) => (
              <li key={c.id} className="rounded-md border border-hairline bg-surface-subtle/30 px-3 py-2 text-[12px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink truncate">
                    {c.landing_path || "/"}
                  </span>
                  <span className="shrink-0 text-ink-muted">{fmtDateTime(c.created_at)}</span>
                </div>
                {c.referer ? (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted truncate">
                    <ExternalLink className="size-2.5 shrink-0" />
                    <span className="truncate">{c.referer}</span>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <DangerZone leadId={lead.id} email={lead.email} referredCount={lead.referral_count} onDeleted={onDeleted} />
    </div>
  );
}

function DangerZone({
  leadId, email, referredCount, onDeleted,
}: {
  leadId: string;
  email: string;
  referredCount: number;
  onDeleted: (leadId: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteMemberAction(leadId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onDeleted(leadId);
    });
  }

  return (
    <div className="border-t border-hairline bg-rose-50/30 px-6 py-5">
      <p className="eyebrow mb-2 text-rose-700">Danger zone</p>
      {!confirm ? (
        <>
          <p className="mb-3 text-[12px] text-ink-muted">
            Deletes the lead row, frees the email and phone for re-registration, and detaches any
            downstream referrals (their <code className="font-mono text-[11px]">referred_by_code</code> stays for the record).
          </p>
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-medium text-rose-700 transition-colors hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" /> Delete affiliate
          </button>
        </>
      ) : (
        <>
          <p className="mb-3 text-[13px] font-medium text-ink">
            Delete {email}?
            {referredCount > 0 ? (
              <span className="block text-[12px] font-normal text-ink-muted">
                {referredCount} downstream referral{referredCount === 1 ? "" : "s"} will be detached.
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-600 bg-rose-600 px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? <Spinner className="size-3" /> : <Trash2 className="size-3.5" />}
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => { setConfirm(false); setError(null); }}
              disabled={pending}
              className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-[12px] text-rose-700">{error}</p>
          ) : null}
        </>
      )}
    </div>
  );
}

function TreeRow({ node, indent }: { node: TreeNode; indent: number }) {
  const childCount = node.children.length;
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-subtle/40 px-3 py-2"
        style={{ marginLeft: indent * 18 }}
      >
        {indent > 0 ? (
          <CornerDownRight className="size-3 shrink-0 text-ink-muted" aria-hidden />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-medium text-ink">
              {node.name || node.email}
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full border border-hairline bg-surface px-1.5 text-[10px] font-medium text-ink-muted">
              T{node.depth}
            </span>
            {node.is_verified ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-700">
                <Check className="size-2.5" />
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-muted">
            <span className="truncate">{node.email}</span>
            {node.referral_code ? (
              <code className="shrink-0 rounded border border-hairline bg-surface px-1 font-mono text-[10px]">
                {node.referral_code}
              </code>
            ) : null}
          </div>
        </div>
        {childCount > 0 ? (
          <span className="shrink-0 rounded-full bg-ink/5 px-1.5 text-[10px] font-medium text-ink-muted">
            +{childCount}
          </span>
        ) : null}
      </div>
      {childCount > 0 ? (
        <ul className="mt-1.5 space-y-1.5">
          {node.children.map((child) => (
            <TreeRow key={child.id} node={child} indent={indent + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className={`mt-0.5 text-[22px] font-bold tabular-nums tracking-tight ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center gap-2 rounded-lg border border-hairline bg-surface-subtle/60 px-3 py-2 text-left transition-colors hover:border-ink/30"
    >
      <span className="flex-1 truncate font-mono text-[12px] text-ink">{value}</span>
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4 text-ink-muted group-hover:text-ink" />
      )}
    </button>
  );
}
