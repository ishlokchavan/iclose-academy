import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/config/nav";

export const metadata: Metadata = { title: "Staff overview" };

export default async function StaffOverviewPage() {
  const user = await getSessionUser();
  const roleLabel = user ? ROLE_LABEL[user.role].label : "Staff";

  return (
    <>
      <PageHeader
        eyebrow={roleLabel}
        title="Platform operations"
        description="Educator approvals, track moderation, taxonomy editor, and user management land in Phase 4."
      />
      <EmptyState
        icon={ShieldCheck}
        title="Welcome, staff"
        description="The full CMS arrives in Phase 4. For now, the route guards, RBAC, and shell are wired and tested."
      />
    </>
  );
}
