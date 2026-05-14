import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, MapPin } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { InquiryStatusBadge } from "@/features/inquiries/components/InquiryStatusBadge";
import { getAllInquiriesForStaff, getInquiryStats } from "@/features/inquiries/server/queries";
import { getStaffTopics } from "@/features/topics/server/queries";
import type { TopicStatus } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Overview" };

const TILE_TONES: Record<string, string> = {
  amber:   "bg-amber-50 border-amber-200/60",
  emerald: "bg-emerald-50 border-emerald-200/60",
  zinc:    "bg-surface-raised border-hairline",
  rose:    "bg-rose-50 border-rose-200/60",
  blue:    "bg-blue-50 border-blue-200/60",
};

export default async function ManagerOverviewPage() {
  const [topics, inquiryStats, openInquiries] = await Promise.all([
    getStaffTopics(),
    getInquiryStats(),
    getAllInquiriesForStaff("open"),
  ]);

  const topicCounts: Record<TopicStatus, number> = {
    draft: 0, in_review: 0, published: 0, archived: 0,
  };
  for (const t of topics) topicCounts[t.status] += 1;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content Manager"
        title="Overview"
        description="Topics, inquiries, and platform content at a glance."
      />

      <section className="space-y-3">
        <h2 className="eyebrow">Topics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Tile label="Published" value={topicCounts.published} href="/manage/topics?status=published" tone="emerald" />
          <Tile label="Drafts"    value={topicCounts.draft}     href="/manage/topics?status=draft"     tone="zinc" />
          <Tile label="Archived"  value={topicCounts.archived}  href="/manage/topics?status=archived"  tone="rose" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow">Inquiries</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Tile label="Open"   value={inquiryStats.open}   href="/manage/inquiries?status=open"   tone="amber" />
          <Tile label="Closed" value={inquiryStats.closed} href="/manage/inquiries?status=closed" tone="emerald" />
        </div>
      </section>

      {openInquiries.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="eyebrow">Open inquiries</h2>
            <Link href="/manage/inquiries?status=open" className="text-[13px] font-medium text-ink-muted hover:text-ink transition-colors">
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {openInquiries.slice(0, 5).map((i) => (
              <li key={i.id} className="rounded-xl border border-hairline bg-surface-raised p-4 shadow-card">
                <div className="mb-1.5 flex items-center gap-2">
                  <InquiryStatusBadge status={i.status} />
                  <span className="ml-auto text-[11px] text-ink-muted">
                    {new Date(i.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="line-clamp-2 text-[14px] text-ink">{i.description}</p>
                {(i.area || i.subarea) && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <MapPin className="size-3" />
                    {[i.subarea, i.area?.name].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {openInquiries.length === 0 && (
        <EmptyState icon={Inbox} title="No open inquiries" description="All inquiries have been handled." />
      )}
    </div>
  );
}

function Tile({ label, value, href, tone }: { label: string; value: number; href: string; tone: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border p-5 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover",
        TILE_TONES[tone],
      )}
    >
      <span className="eyebrow">{label}</span>
      <span className="text-[2rem] font-bold tracking-tight text-ink">{value}</span>
    </Link>
  );
}
