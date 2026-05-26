import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { MembersPage } from "@/features/members/components/MembersPage";
import { loadMemberDetailAction } from "@/features/members/server/actions";
import { getMembersOverview, getAllMembers } from "@/features/members/server/queries";
import { requireMinRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Members" };

export default async function ManageMembersPage() {
  await requireMinRole("manager");

  const [overview, members] = await Promise.all([
    getMembersOverview(),
    getAllMembers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Growth"
        title="Members"
        description="Everyone who registered on iclose.ae. Each gets a unique referral code automatically — see who they shared with, who clicked, and who joined through whom."
      />
      <MembersPage
        overview={overview}
        members={members}
        loadDetail={loadMemberDetailAction}
      />
    </div>
  );
}
