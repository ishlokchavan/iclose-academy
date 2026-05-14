import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, MapPin } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { InquiryStatusBadge } from "@/features/inquiries/components/InquiryStatusBadge";
import {
  getAllInquiriesForStaff,
  getInquiryStats,
} from "@/features/inquiries/server/queries";
import { getStaffTopics } from "@/features/topics/server/queries";
import type { TopicStatus } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Staff overview" };

const TILE_TONES: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50/40",
  emerald: "border-emerald-200 bg-emerald-50/40",
  zinc: "border-zinc-200 bg-white",
  rose: "border-rose-200 bg-rose-50/30",
  blue: "border-blue-200 bg-blue-50/40",
};

export default async function StaffOverviewPage() {
  const [topics, inquiryStats, openInquiries] = await Promise.all([
    getStaffTopics(),
    getInquiryStats(),
    getAllInquiriesForStaff("open"),
  ]);

  const topicCounts: Record<TopicStatus, number> = {
    draft: 0,
    in_review: 0,
    published: 0,
    archived: 0,
  };
  for (const t of topics) topicCounts[t.status] += 1;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Staff"
        title="Platform operations"
        description="Topic moderation, inquiry routing, and taxonomy at a glance."
      />

      <section className="space-y-3">
        <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
          Topics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TileLink label="In Review" value={topicCounts.in_review} href="/staff/topics?status=in_review" tone="amber" />
          <TileLink label="Published" value={topicCounts.published} href="/staff/topics?status=published" tone="emerald" />
          <TileLink label="Drafts" value={topicCounts.draft} href="/staff/topics?status=draft" tone="zinc" />
          <TileLink label="Archived" value={topicCounts.archived} href="/staff/topics?status=archived" tone="rose" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
          Inquiries
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TileLink label="Unrouted" value={inquiryStats.open} href="/staff/inquiries?status=open" tone="amber" />
          <TileLink label="Assigned" value={inquiryStats.assigned} href="/staff/inquiries?status=assigned" tone="blue" />
          <TileLink label="In Progress" value={inquiryStats.in_progress} href="/staff/inquiries?status=in_progress" tone="amber" />
          <TileLink label="Closed" value={inquiryStats.closed} href="/staff/inquiries?status=closed" tone="emerald" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Unrouted inquiries
          </h2>
          <Link
            href="/staff/inquiries?status=open"
            className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            View all →
          </Link>
        </div>
        {openInquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing pending"
            description="Inquiries with no assignable educator land here. Assign someone via /staff/taxonomy by giving the area an owner."
          />
        ) : (
          <ul className="space-y-2">
            {openInquiries.slice(0, 5).map((i) => (
              <li
                key={i.id}
                className="rounded-lg border border-hairline bg-surface-raised p-4"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <InquiryStatusBadge status={i.status} />
                  <span className="ml-auto text-[11px] text-ink-muted">
                    {new Date(i.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-ink">{i.description}</p>
                {(i.area || i.subarea) && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
                    <MapPin className="size-3" />
                    {[i.subarea, i.area?.name].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TileLink({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: keyof typeof TILE_TONES;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-4 transition-all duration-200 ease-luxury hover:-translate-y-0.5 hover:shadow-card-hover",
        TILE_TONES[tone],
      )}
    >
      <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
        {label}
      </span>
      <span className="text-2xl font-semibold text-ink">{value}</span>
    </Link>
  );
}
