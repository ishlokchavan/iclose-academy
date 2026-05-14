import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, Mail, MapPin, Phone, User } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { InquiryStatusBadge } from "@/features/inquiries/components/InquiryStatusBadge";
import { InquiryStatusSelect } from "@/features/inquiries/components/InquiryStatusSelect";
import { getAllInquiriesForStaff, type InquiryStatus } from "@/features/inquiries/server/queries";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Inquiries · Staff" };

type Props = { searchParams: Promise<{ status?: string }> };

const FILTERS: Array<{ value: InquiryStatus | "all"; label: string }> = [
  { value: "open", label: "Unrouted" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

function parseStatus(raw?: string): InquiryStatus | undefined {
  if (raw === "open" || raw === "assigned" || raw === "in_progress" || raw === "closed") return raw;
  return undefined;
}

export default async function StaffInquiriesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = parseStatus(status);
  const items = await getAllInquiriesForStaff(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Inquiries"
        description="All inquiries from learners. Routing is automatic when the area has an educator owner; unrouted ones need manual review."
      />

      <nav className="flex flex-wrap items-center gap-1.5 border-b border-hairline pb-3">
        {FILTERS.map((f) => {
          const active = (filter ?? "open") === f.value;
          const href = f.value === "all" ? "/staff/inquiries" : `/staff/inquiries?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ease-luxury",
                active ? "bg-ink text-white" : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" description="No inquiries for that filter." />
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
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {i.learner.full_name ?? "Learner"}
                </span>
                <a href={`mailto:${i.email}`} className="flex items-center gap-1 text-accent hover:underline">
                  <Mail className="size-3" /> {i.email}
                </a>
                {i.phone ? (
                  <a href={`tel:${i.phone}`} className="flex items-center gap-1 text-accent hover:underline">
                    <Phone className="size-3" /> {i.phone}
                  </a>
                ) : null}
                {(i.area || i.subarea) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {[i.subarea, i.area?.name].filter(Boolean).join(" · ")}
                  </span>
                )}
                {i.type ? <span>{i.type.name}</span> : null}
                <span className="ml-auto">
                  Educator: {i.assigned_educator?.full_name ?? "— unrouted —"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
