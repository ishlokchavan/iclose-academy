import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";

export const metadata: Metadata = { title: "Educator dashboard" };

export default function EducatorDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Educator"
        title="Educator dashboard"
        description="Manage your specialist tracks, lessons, and analytics."
      />
      <EmptyState
        icon={GraduationCap}
        title="Track authoring lands in Phase 3"
        description="You'll be able to create tracks, add modules and lessons, attach YouTube videos, and submit for review."
      />
    </>
  );
}
