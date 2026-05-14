import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, MapPin, MessageSquarePlus } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { InquiryStatusBadge } from "@/features/inquiries/components/InquiryStatusBadge";
import { getInquiriesForLearner } from "@/features/inquiries/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "My inquiries" };

type Props = { searchParams: Promise<{ posted?: string }> };

export default async function MyInquiriesPage({ searchParams }: Props) {
  const user = await requireUser();
  const { posted } = await searchParams;
  const items = await getInquiriesForLearner(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="My inquiries"
        description="Leads you've posted. We route them to the specialist who covers the area."
        actions={
          <Link
            href="/inquiries/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
          >
            <MessageSquarePlus className="size-4" /> Post inquiry
          </Link>
        }
      />

      {posted ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700">
          Inquiry posted. We'll route it to the right specialist.
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries yet"
          description="Post one from the library or click the button above."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="rounded-lg border border-hairline bg-surface-raised p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <InquiryStatusBadge status={i.status} />
                {i.assigned_educator ? (
                  <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                    Assigned to {i.assigned_educator.full_name ?? "—"}
                  </span>
                ) : null}
                <span className="ml-auto text-[11px] text-ink-muted">
                  {new Date(i.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink whitespace-pre-line">{i.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                {(i.area || i.subarea) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3" />
                    {[i.subarea, i.area?.name].filter(Boolean).join(" · ")}
                  </span>
                )}
                {i.type ? <span>{i.type.name}</span> : null}
                {i.subtypes.length > 0 ? (
                  <span>{i.subtypes.map((s) => s.name).join(", ")}</span>
                ) : null}
                {i.source_topic ? (
                  <Link
                    href={`/topics/${i.source_topic.slug}`}
                    className="ml-auto text-accent hover:underline"
                  >
                    From topic: {i.source_topic.title}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
