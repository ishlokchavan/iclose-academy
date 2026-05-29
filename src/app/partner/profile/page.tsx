import { redirect } from "next/navigation";

import { PartnerProfileForm } from "@/features/partner-auth/components/PartnerProfileForm";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PartnerNav } from "../partner-nav";

export default async function PartnerProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/partner/login");
  if (user.role !== "partner") redirect("/partner/login");

  const supabase = await createSupabaseServerClient();
  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    return (
      <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-10">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <PartnerNav />
        </div>
        <p className="text-sm text-gray-500">
          No partner record linked to your account yet. Contact an admin to finish onboarding.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-gray-500">Update your contact details.</p>
        </div>
        <PartnerNav />
      </div>

      <section className="border rounded-xl p-6 mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4">
          Account
        </p>
        <dl className="grid grid-cols-3 gap-y-3 text-sm">
          <dt className="text-gray-500">Email</dt>
          <dd className="col-span-2">{partner.email}</dd>
          <dt className="text-gray-500">Referral code</dt>
          <dd className="col-span-2 font-mono text-xs">{partner.code}</dd>
          <dt className="text-gray-500">Status</dt>
          <dd className="col-span-2 capitalize">{partner.status ?? "—"}</dd>
          <dt className="text-gray-500">Joined</dt>
          <dd className="col-span-2 text-gray-500">
            {partner.created_at
              ? new Date(partner.created_at).toLocaleDateString()
              : "—"}
          </dd>
        </dl>
        <p className="text-xs text-gray-400 mt-4">
          Email and referral code are managed by admin. Contact support to change them.
        </p>
      </section>

      <section className="border rounded-xl p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-4">
          Details
        </p>
        <PartnerProfileForm
          initialName={partner.name}
          initialPhone={partner.phone}
        />
      </section>
    </main>
  );
}
