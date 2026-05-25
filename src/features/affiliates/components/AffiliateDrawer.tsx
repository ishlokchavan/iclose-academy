"use client";

import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { referralLink } from "../constants";
import type { AffiliateDetail } from "../server/queries";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function AffiliateDrawer({
  open, loading, detail, onClose,
}: {
  open: boolean;
  loading: boolean;
  detail: AffiliateDetail | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent title="Affiliate details" description="View referrals and click activity">
        <Body loading={loading} detail={detail} />
      </SheetContent>
    </Sheet>
  );
}

function Body({ loading, detail }: { loading: boolean; detail: AffiliateDetail | null }) {
  if (loading || !detail) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const { lead, referredLeads, referrer, clicks } = detail;
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = lead.referral_code ? referralLink(siteUrl, lead.referral_code) : null;

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
      <div className="grid grid-cols-3 gap-3 border-b border-hairline px-6 py-5">
        <Stat label="Clicks"   value={lead.clicks} />
        <Stat label="Unique"   value={lead.unique_visitors} />
        <Stat label="Referrals" value={lead.referral_count} accent />
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

      {/* Referrer (who brought this affiliate in) */}
      {referrer ? (
        <div className="border-b border-hairline px-6 py-5">
          <p className="eyebrow mb-2">Referred by</p>
          <div className="rounded-lg border border-hairline bg-surface-subtle/40 p-3">
            <p className="text-[14px] font-medium text-ink">{referrer.name || referrer.email}</p>
            <p className="text-[12px] text-ink-muted">{referrer.email}</p>
            {referrer.referral_code ? (
              <p className="mt-1 text-[11px] text-ink-muted">
                Code{" "}
                <code className="rounded border border-hairline bg-surface px-1 py-0.5 font-mono">
                  {referrer.referral_code}
                </code>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Referred leads */}
      <div className="border-b border-hairline px-6 py-5">
        <p className="eyebrow mb-2">Referred leads ({referredLeads.length})</p>
        {referredLeads.length === 0 ? (
          <p className="text-[13px] text-ink-muted">No one has signed up with this code yet.</p>
        ) : (
          <ul className="space-y-2">
            {referredLeads.map((r) => (
              <li key={r.id} className="rounded-lg border border-hairline bg-surface-subtle/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-ink truncate">
                      {r.name || r.email}
                    </p>
                    <p className="text-[12px] text-ink-muted truncate">{r.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-ink-muted">{fmtDate(r.created_at)}</p>
                    {r.is_verified ? (
                      <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Check className="size-2.5" /> Verified
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
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
    </div>
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
