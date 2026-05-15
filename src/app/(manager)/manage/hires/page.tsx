import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { HiresPage } from "@/features/hires/components/HiresPage";
import { getHireApplications } from "@/features/hires/server/queries";

export const metadata: Metadata = { title: "Hires" };

export default async function ManageHiresPage() {
  const applications = await getHireApplications();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform"
        title="Hires"
        description="Intern and specialist applications submitted through the platform."
      />
      <HiresPage applications={applications} />
    </div>
  );
}
