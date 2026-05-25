import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { AffiliatesPage } from "@/features/affiliates/components/AffiliatesPage";
import { loadAffiliateDetailAction } from "@/features/affiliates/server/actions";
import { getAffiliateOverview, getAllAffiliates } from "@/features/affiliates/server/queries";
import { requireMinRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Affiliates" };

export default async function ManageAffiliatesPage() {
  await requireMinRole("manager");

  const [overview, affiliates] = await Promise.all([
    getAffiliateOverview(),
    getAllAffiliates(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Affiliates"
        description="Every lead has a unique referral code. Track who shares, who clicks, and who joins through whom."
      />
      <AffiliatesPage
        overview={overview}
        affiliates={affiliates}
        loadDetail={loadAffiliateDetailAction}
      />
    </div>
  );
}
