"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatDateTimeSeconds as fmtDateTime } from "@/lib/utils/date";
import type { AuditLogRow } from "../server/queries";

export function AuditDetailDrawer({
  row, onClose,
}: {
  row: AuditLogRow | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={row !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent title="Audit event" description="Full event payload">
        {row ? <Body row={row} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function Body({ row }: { row: AuditLogRow }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-hairline px-6 pb-6 pt-8">
        <p className="eyebrow">Audit event</p>
        <h2 className="mt-1.5 break-all text-[20px] font-bold tracking-tight text-ink">
          {row.action}
        </h2>
        <p className="mt-1 text-[12px] text-ink-muted tabular-nums">
          {fmtDateTime(row.created_at)}
        </p>
      </div>

      <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 border-b border-hairline px-6 py-5 text-[12px]">
        <Row label="Source"      value={row.source} mono />
        <Row label="Entity type" value={row.entity_type ?? "—"} />
        <Row label="Entity id"   value={row.entity_id ?? "—"} mono break />
        <Row label="Actor email" value={row.actor_email ?? "system"} />
        <Row label="Actor id"    value={row.actor_id ?? "—"} mono break />
        <Row label="Actor role"  value={row.actor_role ?? "—"} />
        <Row label="IP hash"     value={row.ip_hash ?? "—"} mono break />
        <Row label="User agent"  value={row.user_agent ?? "—"} break />
        <Row label="Request id"  value={row.request_id ?? "—"} mono break />
      </dl>

      <div className="px-6 py-5">
        <p className="eyebrow mb-2">Diff</p>
        {row.diff ? (
          <pre className="max-h-[60vh] overflow-auto rounded-lg border border-hairline bg-surface-subtle/50 p-3 font-mono text-[11px] leading-relaxed text-ink whitespace-pre-wrap break-all">
            {JSON.stringify(row.diff, null, 2)}
          </pre>
        ) : (
          <p className="text-[13px] text-ink-muted">No diff recorded.</p>
        )}
      </div>
    </div>
  );
}

function Row({
  label, value, mono, break: breakAll,
}: {
  label: string;
  value: string;
  mono?: boolean;
  break?: boolean;
}) {
  return (
    <>
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={[
          "text-ink",
          mono ? "font-mono text-[11px]" : "",
          breakAll ? "break-all" : "",
        ].join(" ")}
      >
        {value}
      </dd>
    </>
  );
}
