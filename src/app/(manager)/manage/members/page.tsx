import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { MembersPage } from "@/features/members/components/MembersPage";
import { loadMemberDetailAction } from "@/features/members/server/actions";
import { getMembersOverview, getAllMembers } from "@/features/members/server/queries";
import { requireMinRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Affiliates" };

export default async function ManageAffiliatesPage() {
  await requireMinRole("manager");

  const [overview, members] = await Promise.all([
    getMembersOverview(),
    getAllMembers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Affiliates"
        description="Every lead has a unique referral code. Track who shares, who clicks, and who joins through whom."
      />
      <MembersPage
        overview={overview}
        members={members}
        loadDetail={loadMemberDetailAction}
      />
    </div>
  );
}
