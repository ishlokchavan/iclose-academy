import { redirect } from "next/navigation";

import { MembersTree } from "@/features/members/components/MembersTree";
import { partnerReferralLink } from "@/features/partner-management/link";
import { getPartnerReferralTree } from "@/features/partner-management/server/queries";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PartnerNav } from "../partner-nav";
import { CopyReferralLink } from "./copy-referral-link";

export default async function PartnerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/partner/login");
  if (user.role !== "partner") redirect("/partner/login");

  const supabase = await createSupabaseServerClient();

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const tree = partner ? await getPartnerReferralTree(partner.code) : null;
  const link = partner ? partnerReferralLink(partner.code) : "";

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-gray-500">Welcome back, {partner?.name ?? user.email}</p>
        </div>
        <PartnerNav />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border rounded-xl p-6 text-center">
          <p className="text-3xl font-bold">{tree?.clicks ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Clicks</p>
        </div>
        <div className="border rounded-xl p-6 text-center">
          <p className="text-3xl font-bold">{tree?.directCount ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Signups</p>
        </div>
        <div className="border rounded-xl p-6 text-center">
          <p className="text-3xl font-bold">{tree?.networkSize ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Network</p>
        </div>
      </div>

      {partner ? (
        <>
          <div className="border rounded-xl p-6 mb-10">
            <p className="text-sm text-gray-500 mb-2">Your Referral Link</p>
            <CopyReferralLink link={link} />
          </div>

          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Who signed up from you</h2>
              {tree && tree.networkSize > 0 ? (
                <p className="text-sm text-gray-500">
                  {tree.directCount} direct
                  {tree.networkSize > tree.directCount ? ` · ${tree.networkSize} total` : ""}
                </p>
              ) : null}
            </div>
            {tree && tree.nodes.length > 0 ? (
              <MembersTree members={tree.nodes} />
            ) : (
              <p className="border rounded-xl p-6 text-center text-sm text-gray-500">
                No signups yet. Share your referral link to start building your network.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className="border rounded-xl p-6 text-sm text-gray-500">
          No partner record linked to your account yet. Contact an admin to finish onboarding.
        </div>
      )}
    </main>
  );
}
