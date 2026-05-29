import { redirect } from "next/navigation";

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

  const { count: clicks } = partner
    ? await supabase
        .from("referral_clicks")
        .select("*", { count: "exact", head: true })
        .eq("code", partner.code)
    : { count: 0 };

  const { count: signups } = partner
    ? await supabase
        .from("referral_conversions")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", partner.id)
    : { count: 0 };

  const link = `https://iclose.ae/ref/${partner?.code ?? ""}`;

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
          <p className="text-3xl font-bold">{clicks ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Clicks</p>
        </div>
        <div className="border rounded-xl p-6 text-center">
          <p className="text-3xl font-bold">{signups ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Signups</p>
        </div>
        <div className="border rounded-xl p-6 text-center">
          <p className="text-3xl font-bold">—</p>
          <p className="text-gray-500 text-sm mt-1">Earnings (Soon)</p>
        </div>
      </div>

      {partner ? (
        <div className="border rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-2">Your Referral Link</p>
          <CopyReferralLink link={link} />
        </div>
      ) : (
        <div className="border rounded-xl p-6 text-sm text-gray-500">
          No partner record linked to your account yet. Contact an admin to finish onboarding.
        </div>
      )}
    </main>
  );
}
