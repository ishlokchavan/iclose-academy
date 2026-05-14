import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Mail, MapPin, Phone } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { InquiryStatusBadge } from "@/features/inquiries/components/InquiryStatusBadge";
import { InquiryStatusSelect } from "@/features/inquiries/components/InquiryStatusSelect";
import { getInquiriesForEducator } from "@/features/inquiries/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Inquiries · Educator" };

export default async function EducatorInquiriesPage() {
  const user = await requireUser();
  const items = await getInquiriesForEducator(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Educator"
        title="Inquiries"
        description="Leads from learners interested in areas you cover. Move them through the funnel as you respond."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries yet"
          description="When a learner posts an inquiry for one of your assigned areas, it lands here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <InquiryStatusBadge status={i.status} />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                    {new Date(i.created_at).toLocaleString()}
                  </span>
                </div>
                <InquiryStatusSelect inquiryId={i.id} initial={i.status} />
              </div>
              <p className="text-sm text-ink whitespace-pre-line">{i.description}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-hairline pt-3 text-xs text-ink-muted">
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
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink">
                <span className="font-medium">{i.learner.full_name ?? "Learner"}</span>
                <a
                  href={`mailto:${i.email}`}
                  className="flex items-center gap-1.5 text-accent hover:underline"
                >
                  <Mail className="size-3" />
                  {i.email}
                </a>
                {i.phone ? (
                  <a
                    href={`tel:${i.phone}`}
                    className="flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <Phone className="size-3" />
                    {i.phone}
                  </a>
                ) : null}
                {i.source_topic ? (
                  <Link
                    href={`/topics/${i.source_topic.slug}`}
                    className="ml-auto text-[11px] text-ink-muted hover:text-ink transition-colors"
                  >
                    From: {i.source_topic.title}
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
