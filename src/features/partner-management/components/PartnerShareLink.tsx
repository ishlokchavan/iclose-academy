"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

import { partnerReferralLink, whatsappShareLink } from "@/features/partner-management/link";

export function PartnerShareLink({
  code,
  partnerName,
}: {
  code: string;
  partnerName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const link = partnerReferralLink(code);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={copy}
        className="group flex w-full items-center gap-2 rounded-lg border border-hairline bg-surface-subtle/60 px-3 py-2 text-left transition-colors hover:border-ink/30"
      >
        <span className="flex-1 truncate font-mono text-[12px] text-ink">{link}</span>
        {copied ? (
          <Check className="size-4 shrink-0 text-emerald-600" />
        ) : (
          <Copy className="size-4 shrink-0 text-ink-muted group-hover:text-ink" />
        )}
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-surface-subtle"
        >
          {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a
          href={whatsappShareLink(link, partnerName)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-surface-subtle"
        >
          <MessageCircle className="size-3.5 text-emerald-600" />
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}
