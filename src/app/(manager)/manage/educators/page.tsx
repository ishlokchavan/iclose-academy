import type { Metadata } from "next";
import { Users } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EducatorRow, NewEducatorForm } from "@/features/educators/components/EducatorList";
import { getEducatorList } from "@/features/educators/server/queries";

export const metadata: Metadata = { title: "Educators" };

export default async function ManageEducatorsPage() {
  const educators = await getEducatorList();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Educators"
        description="The specialists who appear on topic cards and detail pages."
      />

      <NewEducatorForm />

      {educators.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No educators yet"
          description="Add your first educator above."
        />
      ) : (
        <ul className="space-y-3">
          {educators.map((e) => (
            <EducatorRow key={e.id} educator={e} />
          ))}
        </ul>
      )}
    </div>
  );
}
