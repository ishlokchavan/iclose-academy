import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { PartnersAdminPage } from "@/features/partner-management/components/PartnersAdminPage";
import {
  getAllPartners,
  type PartnersOverview,
} from "@/features/partner-management/server/queries";
import { requireMinRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Partners" };

export default async function ManagePartnersPage() {
  const user = await requireMinRole("manager");

  const partners = await getAllPartners();
  const overview: PartnersOverview = {
    totalPartners: partners.length,
    totalActive: partners.filter((p) => p.status !== "inactive").length,
    totalClicks: partners.reduce((sum, p) => sum + p.clicks, 0),
    totalSignups: partners.reduce((sum, p) => sum + p.signups, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Growth"
        title="Partners"
        description="Affiliate partners with referral codes. Track clicks and conversions, manage codes and status."
      />
      <PartnersAdminPage
        partners={partners}
        overview={overview}
        canDelete={user.role === "admin"}
      />
    </div>
  );
}
