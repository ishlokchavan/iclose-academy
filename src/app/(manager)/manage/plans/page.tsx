import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { PlansPage } from "@/features/plans/components/PlansPage";
import { getAllPlans } from "@/features/plans/server/queries";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Plans" };

export default async function ManagePlansPage() {
  await requireRole("admin");
  const plans = await getAllPlans();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Membership plans"
        description="Edit labels, pricing, features, and ordering. Inactive plans stay in the database but disappear from the pricing page."
      />
      <PlansPage plans={plans} />
    </div>
  );
}
