"use client";

import { ExternalLink, FileText, Instagram, Mail, Phone } from "lucide-react";
import { useState, useTransition } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  HIRE_STATUSES,
  getResumeSignedUrlAction,
  updateHireStatusAction,
  type HireStatus,
} from "@/features/hires/server/actions";
import type { HireApplication } from "@/features/hires/server/queries";

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  reviewing:   "bg-blue-50 text-blue-700 border-blue-200",
  shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
  hired:       "bg-green-50 text-green-700 border-green-200",
  rejected:    "bg-red-50 text-red-600 border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-wide ${STATUS_STYLES[status] ?? "bg-surface-subtle text-ink-muted border-hairline"}`}>
      {status}
    </span>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-x-3 py-2.5">
      <span className="text-[12px] font-medium text-ink-muted pt-px">{label}</span>
      <span className="text-[13px] text-ink break-words">{children}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">{title}</p>
      <div className="rounded-xl border border-hairline bg-surface-subtle/50 divide-y divide-hairline px-4">
        {children}
      </div>
    </div>
  );
}

function DrawerBody({ app }: { app: HireApplication }) {
  const [status, setStatus] = useState<HireStatus>(app.status as HireStatus);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const initials = `${app.first_name[0]}${app.last_name[0]}`.toUpperCase();

  function handleStatusChange(next: HireStatus) {
    const prev = status;
    setStatus(next);
    setStatusError(null);
    startTransition(async () => {
      const r = await updateHireStatusAction(app.id, next);
      if (r.error) { setStatus(prev); setStatusError(r.error); }
    });
  }

  async function openResume() {
    if (!app.resume_path) return;
    if (resumeUrl) { window.open(resumeUrl, "_blank"); return; }
    setResumeLoading(true);
    const r = await getResumeSignedUrlAction(app.resume_path);
    setResumeLoading(false);
    if (r.url) { setResumeUrl(r.url); window.open(r.url, "_blank"); }
  }

  const instagramHandle = app.instagram?.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//,"").replace(/\/$/, "");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-hairline p-6 pb-5">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[18px] font-semibold text-ink">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold text-ink leading-snug">
              {app.first_name} {app.last_name}
            </p>
            <p className="text-[13px] text-ink-muted">{app.email}</p>
            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-5 overflow-y-auto p-6">

        {/* Contact — all clickable */}
        <Section title="Contact">
          <FieldRow label="Phone">
            <a
              href={`tel:${app.phone}`}
              className="flex items-center gap-1.5 text-accent font-medium hover:underline"
            >
              <Phone className="size-3.5 shrink-0" />
              {app.phone}
            </a>
          </FieldRow>
          <FieldRow label="Email">
            <a
              href={`mailto:${app.email}`}
              className="flex items-center gap-1.5 text-accent font-medium hover:underline break-all"
            >
              <Mail className="size-3.5 shrink-0" />
              {app.email}
            </a>
          </FieldRow>
          {instagramHandle && (
            <FieldRow label="Instagram">
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-accent font-medium hover:underline"
              >
                <Instagram className="size-3.5 shrink-0" />
                @{instagramHandle}
                <ExternalLink className="size-3 opacity-50" />
              </a>
            </FieldRow>
          )}
        </Section>

        {/* Application */}
        <Section title="Application">
          {app.resume_path ? (
            <FieldRow label="Resume">
              <button
                onClick={openResume}
                disabled={resumeLoading}
                className="flex items-center gap-1.5 text-accent font-medium hover:underline disabled:opacity-50"
              >
                <FileText className="size-3.5 shrink-0" />
                {resumeLoading ? "Loading…" : "View PDF"}
                <ExternalLink className="size-3 opacity-50" />
              </button>
            </FieldRow>
          ) : (
            <FieldRow label="Resume">
              <span className="text-ink-muted">Not provided</span>
            </FieldRow>
          )}
          {app.message && (
            <div className="py-3">
              <p className="text-[12px] font-medium text-ink-muted mb-1.5">Cover note</p>
              <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{app.message}</p>
            </div>
          )}
        </Section>

        {/* Status */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Status</p>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as HireStatus)}
            disabled={isPending}
            className="h-9 w-full rounded-lg border border-hairline bg-surface-raised px-3 text-[14px] text-ink focus:outline-none focus:border-accent disabled:opacity-50 capitalize"
          >
            {HIRE_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          {statusError && (
            <p className="mt-1.5 text-[12px] text-red-600">{statusError}</p>
          )}
        </div>

        {/* Meta */}
        <Section title="Meta">
          <FieldRow label="Applied">{formatDate(app.created_at)}</FieldRow>
          {app.referer && (
            <FieldRow label="Source">
              <span className="break-all text-ink-muted">{app.referer}</span>
            </FieldRow>
          )}
        </Section>
      </div>
    </div>
  );
}

export function HireDrawer({
  app,
  onClose,
}: {
  app: HireApplication | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!app} onOpenChange={(open) => { if (!open) onClose(); }}>
      {app ? (
        <SheetContent title="Application details" description="View applicant details and update status">
          <DrawerBody app={app} />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
