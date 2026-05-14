import type { Metadata } from "next";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { AssignmentManager } from "@/features/staff/components/AssignmentManager";
import { getEducatorAssignments } from "@/features/staff/server/assignment-queries";
import { getEducators } from "@/features/staff/server/user-queries";
import { getTaxonomy } from "@/features/topics/server/queries";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = { title: "Educator routing · Staff" };

export default async function StaffEducatorsPage() {
  const [educators, assignments, taxonomy] = await Promise.all([
    getEducators(),
    getEducatorAssignments(),
    getTaxonomy(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Staff"
        title="Educator routing"
        description="Map educators to (Area + Type ± Sub-area) combinations. Inquiries route to the most-specific match — the same building can have one educator for Commercial and another for Residential."
      />

      {educators.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No educators yet"
          description="Promote a learner to educator from /staff/users, then assign areas to them here."
        />
      ) : (
        <div className="space-y-6">
          {educators.map((e) => (
            <AssignmentManager
              key={e.id}
              educator={{ id: e.id, full_name: e.full_name, email: e.email }}
              assignments={assignments.filter((a) => a.educator.id === e.id)}
              areas={taxonomy.areas}
              types={taxonomy.types}
            />
          ))}
        </div>
      )}
    </div>
  );
}
