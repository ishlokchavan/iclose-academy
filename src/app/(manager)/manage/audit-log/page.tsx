import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { AuditLogPage } from "@/features/audit/components/AuditLogPage";
import { getAuditFacets, getAuditLogs } from "@/features/audit/server/queries";
import { requireMinRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Audit log" };

export default async function ManageAuditLogPage() {
  await requireMinRole("manager");

  const [rows, facets] = await Promise.all([
    getAuditLogs({ limit: 500 }),
    getAuditFacets(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Audit log"
        description="Every database write and every sensitive action, recorded for traceability. Manager and admin only."
      />
      <AuditLogPage rows={rows} facets={facets} />
    </div>
  );
}
