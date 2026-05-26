"use client";

import { Check, Copy, MousePointerClick, Share2, Users } from "lucide-react";
import { useState } from "react";

import { referralLink } from "../constants";

type Props = {
  code: string;
  referralCount: number;
  networkSize: number;
  clicks: number;
  uniqueVisitors: number;
  siteUrl: string;
};

export function ReferralCard({ code, referralCount, networkSize, clicks, uniqueVisitors, siteUrl }: Props) {
  const link = referralLink(siteUrl, code);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "iClose Academy",
          text: "Specialist intelligence for operators who close.",
          url: link,
        });
        return;
      } catch {
        /* user canceled */
      }
    }
    copy();
  }

  return (
    <section className="rounded-lg border border-hairline bg-surface-raised p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Your referral link</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Share this link. Anyone who joins through it is credited to you.
          </p>
        </div>
        <code className="shrink-0 rounded-md border border-hairline bg-surface-subtle px-2 py-1 font-mono text-[12px] font-medium text-ink">
          {code}
        </code>
      </div>

      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={copy}
          className="group flex flex-1 min-w-0 items-center gap-2 rounded-lg border border-hairline bg-surface-subtle/60 px-3 py-2 text-left transition-colors hover:border-ink/30"
        >
          <span className="flex-1 truncate font-mono text-[12px] text-ink">{link}</span>
          {copied ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Copy className="size-4 text-ink-muted group-hover:text-ink" />
          )}
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-ink px-3 py-2 text-[12px] font-medium text-surface transition-opacity hover:opacity-90"
        >
          <Share2 className="size-3.5" /> Share
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 border-t border-hairline pt-4">
        <Stat icon={MousePointerClick} label="Clicks"  value={clicks} />
        <Stat icon={Users}              label="Unique"  value={uniqueVisitors} />
        <Stat icon={Users}              label="Direct"  value={referralCount} accent />
        <Stat icon={Users}              label="Network" value={networkSize} />
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-ink-muted">
        <Icon className="size-3" />
        <span className="eyebrow text-[10px]">{label}</span>
      </div>
      <p className={`mt-1 text-[20px] font-bold tabular-nums tracking-tight ${accent ? "text-accent" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
