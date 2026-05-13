import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function LearnerDashboardPage() {
  const user = await getSessionUser();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome, ${firstName}.`}
        description="Your specialist intelligence library. Tracks and lessons land here in Phase 2."
      />
      <EmptyState
        icon={Sparkles}
        title="Your learning hub is being prepared"
        description="In Phase 2 we'll surface continue-learning, recommended tracks, and progress. For now, sign-in works and the shell is wired."
      />
    </>
  );
}
