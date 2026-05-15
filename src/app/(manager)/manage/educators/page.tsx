import type { Metadata } from "next";

import { PageHeader } from "@/components/patterns/PageHeader";
import { EducatorsPage } from "@/features/educators/components/EducatorsPage";
import { getEducatorList } from "@/features/educators/server/queries";

export const metadata: Metadata = { title: "Educators" };

export default async function ManageEducatorsPage() {
  const educators = await getEducatorList();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Educators"
        description="Specialists who appear on topic cards and detail pages."
      />
      <EducatorsPage educators={educators} />
    </div>
  );
}
