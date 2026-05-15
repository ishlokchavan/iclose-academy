"use client";

import { ExternalLink, FileText, Instagram, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { HIRE_STATUSES, type HireStatus } from "@/features/hires/constants";
import {
  addHireRemarkAction,
  getHireRemarksAction,
  getResumeSignedUrlAction,
  updateHireStatusAction,
} from "@/features/hires/server/actions";
import type { HireApplication, HireRemark } from "@/features/hires/server/queries";

const STATUS_STYLES: Record<string, string> = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  reviewing:   "bg-blue-50 text-blue-700 border-blue-200",
  shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
  hired:       "bg-green-50 text-green-700 border-green-200",
  rejected:    "bg-red-50 text-red-600 border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

// ─── Remarks feed ────────────────────────────────────────────────────────────

function RemarkItem({ remark }: { remark: HireRemark }) {
  const initials = (remark.created_by_name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3 py-3">
      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-subtle border border-hairline text-[11px] font-semibold text-ink-muted mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[12px] font-semibold text-ink">
            {remark.created_by_name ?? "Staff"}
          </span>
          <span className="text-[11px] text-ink-muted/60">
            {formatRelative(remark.created_at)}
          </span>
        </div>
        <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{remark.content}</p>
      </div>
    </div>
  );
}

// ─── Main drawer body ─────────────────────────────────────────────────────────

function DrawerBody({
  app,
  onStatusChange,
}: {
  app: HireApplication;
  onStatusChange: (updated: HireApplication) => void;
}) {
  const [status, setStatus]               = useState<HireStatus>(app.status as HireStatus);
  const [statusError, setStatusError]     = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();
  const [resumeUrl, setResumeUrl]         = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Remarks
  const [remarks, setRemarks]           = useState<HireRemark[]>([]);
  const [remarksLoading, setRemarksLoading] = useState(true);
  const [remarkText, setRemarkText]     = useState("");
  const [remarkError, setRemarkError]   = useState<string | null>(null);
  const [remarkPending, startRemarkTx]  = useTransition();
  const remarkInputRef = useRef<HTMLTextAreaElement>(null);

  // Rejection flow: pending-remark before committing status change
  const [pendingStatus, setPendingStatus] = useState<HireStatus | null>(null);
  const [rejectionRemark, setRejectionRemark] = useState("");
  const [rejectionError, setRejectionError]   = useState<string | null>(null);
  const [rejectionPending, startRejectionTx]  = useTransition();

  const initials = `${app.first_name[0]}${app.last_name[0]}`.toUpperCase();

  // Load remarks on mount
  useEffect(() => {
    let cancelled = false;
    setRemarksLoading(true);
    getHireRemarksAction(app.id).then((r) => {
      if (!cancelled) { setRemarks(r.remarks ?? []); setRemarksLoading(false); }
    }).catch(() => { if (!cancelled) setRemarksLoading(false); });
    return () => { cancelled = true; };
  }, [app.id]);

  // ── Status change ──────────────────────────────────────────────────────────
  function handleStatusSelect(next: HireStatus) {
    if (next === status) return;
    if (next === "rejected") {
      // Intercept: require remark before committing
      setPendingStatus(next);
      setRejectionRemark("");
      setRejectionError(null);
      return;
    }
    commitStatus(next);
  }

  function commitStatus(next: HireStatus) {
    const prev = status;
    setStatus(next);
    setStatusError(null);
    startTransition(async () => {
      const r = await updateHireStatusAction(app.id, next);
      if (r.error) { setStatus(prev); setStatusError(r.error); }
      else onStatusChange({ ...app, status: next });
    });
  }

  function handleRejectionConfirm() {
    if (!rejectionRemark.trim()) { setRejectionError("A reason is required when rejecting."); return; }
    startRejectionTx(async () => {
      // Save remark first, then update status
      const remarkResult = await addHireRemarkAction(app.id, rejectionRemark.trim());
      if (remarkResult.error) { setRejectionError(remarkResult.error); return; }
      const statusResult = await updateHireStatusAction(app.id, "rejected");
      if (statusResult.error) { setRejectionError(statusResult.error); return; }
      if (remarkResult.remark) setRemarks((prev) => [remarkResult.remark!, ...prev]);
      setStatus("rejected");
      onStatusChange({ ...app, status: "rejected" });
      setPendingStatus(null);
      setRejectionRemark("");
    });
  }

  // ── Resume ─────────────────────────────────────────────────────────────────
  async function openResume() {
    if (!app.resume_path) return;
    if (resumeUrl) { window.open(resumeUrl, "_blank"); return; }
    setResumeLoading(true);
    const r = await getResumeSignedUrlAction(app.resume_path);
    setResumeLoading(false);
    if (r.url) { setResumeUrl(r.url); window.open(r.url, "_blank"); }
  }

  // ── Add remark ─────────────────────────────────────────────────────────────
  function handleAddRemark(e: React.FormEvent) {
    e.preventDefault();
    if (!remarkText.trim()) return;
    setRemarkError(null);
    startRemarkTx(async () => {
      const r = await addHireRemarkAction(app.id, remarkText.trim());
      if (r.error) { setRemarkError(r.error); return; }
      if (r.remark) setRemarks((prev) => [r.remark!, ...prev]);
      setRemarkText("");
    });
  }

  const instagramHandle = app.instagram
    ?.replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/$/, "");

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

      {/* Scrollable body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-6">

        {/* Contact */}
        <Section title="Contact">
          <FieldRow label="Phone">
            <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 text-accent font-medium hover:underline">
              <Phone className="size-3.5 shrink-0" />
              {app.phone}
            </a>
          </FieldRow>
          <FieldRow label="Email">
            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-accent font-medium hover:underline break-all">
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
            <FieldRow label="Resume"><span className="text-ink-muted">Not provided</span></FieldRow>
          )}
          {app.message && (
            <div className="py-3">
              <p className="text-[12px] font-medium text-ink-muted mb-1.5">Cover note</p>
              <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">{app.message}</p>
            </div>
          )}
        </Section>

        {/* Status + rejection flow */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Status</p>
          <select
            value={pendingStatus ?? status}
            onChange={(e) => handleStatusSelect(e.target.value as HireStatus)}
            disabled={isPending || !!pendingStatus}
            className="h-9 w-full rounded-lg border border-hairline bg-surface-raised px-3 text-[14px] text-ink focus:outline-none focus:border-accent disabled:opacity-50 capitalize"
          >
            {HIRE_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          {statusError && <p className="mt-1.5 text-[12px] text-red-600">{statusError}</p>}

          {/* Rejection reason panel */}
          {pendingStatus === "rejected" && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <p className="text-[13px] font-semibold text-red-700">Rejection reason required</p>
              <p className="text-[12px] text-red-600/80">Please provide a reason before marking as rejected. This will be saved as a remark.</p>
              <textarea
                autoFocus
                value={rejectionRemark}
                onChange={(e) => setRejectionRemark(e.target.value)}
                placeholder="e.g. Not enough experience for the role at this time."
                rows={3}
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-red-400 resize-none"
              />
              {rejectionError && <p className="text-[12px] text-red-600">{rejectionError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleRejectionConfirm}
                  disabled={rejectionPending || !rejectionRemark.trim()}
                  className="h-8 rounded-lg bg-red-600 px-4 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {rejectionPending ? "Saving…" : "Confirm rejection"}
                </button>
                <button
                  onClick={() => setPendingStatus(null)}
                  disabled={rejectionPending}
                  className="h-8 rounded-lg border border-hairline bg-white px-4 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">Remarks</p>
            {remarks.length > 0 && (
              <span className="rounded-full bg-surface-subtle border border-hairline px-1.5 text-[10px] font-semibold text-ink-muted">
                {remarks.length}
              </span>
            )}
          </div>

          {/* Add remark form */}
          <form onSubmit={handleAddRemark} className="mb-4">
            <div className="relative">
              <textarea
                ref={remarkInputRef}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddRemark(e as never);
                }}
                placeholder="Add a remark…"
                rows={2}
                className="w-full rounded-xl border border-hairline bg-surface-raised px-4 py-3 pr-12 text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent resize-none"
              />
              <button
                type="submit"
                disabled={remarkPending || !remarkText.trim()}
                className="absolute right-3 bottom-3 rounded-lg p-1.5 text-ink-muted hover:text-accent disabled:opacity-40 transition-colors"
              >
                <Send className="size-4" />
              </button>
            </div>
            {remarkError && <p className="mt-1.5 text-[12px] text-red-600">{remarkError}</p>}
            <p className="mt-1 text-[11px] text-ink-muted/50">⌘ Enter to submit</p>
          </form>

          {/* Feed */}
          {remarksLoading ? (
            <p className="text-[13px] text-ink-muted py-4 text-center">Loading…</p>
          ) : remarks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-ink-muted">
              <MessageSquare className="size-5 opacity-40" />
              <p className="text-[13px]">No remarks yet</p>
            </div>
          ) : (
            <div className="divide-y divide-hairline rounded-xl border border-hairline bg-surface-subtle/40 px-4">
              {remarks.map((r) => (
                <RemarkItem key={r.id} remark={r} />
              ))}
            </div>
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

// ─── Sheet wrapper ────────────────────────────────────────────────────────────

export function HireDrawer({
  app,
  onClose,
  onStatusChange,
}: {
  app: HireApplication | null;
  onClose: () => void;
  onStatusChange: (updated: HireApplication) => void;
}) {
  return (
    <Sheet open={!!app} onOpenChange={(open) => { if (!open) onClose(); }}>
      {app ? (
        <SheetContent title="Application details" description="View applicant details and update status">
          <DrawerBody app={app} onStatusChange={onStatusChange} />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
