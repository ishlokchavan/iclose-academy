import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { ContinueLearning } from "@/features/dashboard/components/ContinueLearning";
import { getDashboardData } from "@/features/dashboard/server/queries";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function LearnerDashboardPage() {
  const user = await getSessionUser();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  const enrollments = user ? await getDashboardData(user.id) : [];

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title={`Welcome back, ${firstName}.`}
      />

      {enrollments.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={BookOpen}
            title="Start your first track"
            description="Browse the library and enroll in a specialist track to begin."
          />
          <div className="flex justify-center">
            <Link
              href="/tracks"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Browse Track Library →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <ContinueLearning enrollments={enrollments} />
        </div>
      )}
    </>
  );
}
