import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { TrackCard } from "@/features/tracks/components/TrackCard";
import { SpecialtyFilter } from "@/features/tracks/components/SpecialtyFilter";
import { getSpecialties, getTracks } from "@/features/tracks/server/queries";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Track Library" };

type Props = {
  searchParams: Promise<{ specialty?: string }>;
};

export default async function TracksPage({ searchParams }: Props) {
  const { specialty } = await searchParams;
  const user = await getSessionUser();

  const [specialties, tracks] = await Promise.all([
    getSpecialties(),
    getTracks({ specialtySlug: specialty, userId: user?.id }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Track Library"
        description="Structured specialist intelligence for operators who close."
      />

      <div className="mt-6 mb-8">
        <SpecialtyFilter specialties={specialties} activeSlug={specialty} />
      </div>

      {tracks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No tracks found"
          description={
            specialty
              ? `No published tracks for this specialty yet.`
              : "No tracks have been published yet."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </>
  );
}
