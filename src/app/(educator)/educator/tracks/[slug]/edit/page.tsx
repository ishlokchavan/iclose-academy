import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { UpdateTrackForm } from "@/features/educator/components/UpdateTrackForm";
import {
  getEducatorTrackBySlug,
  getTaxonomies,
} from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function EditTrackPage({ params }: Props) {
  const { slug } = await params;
  const user = await requireUser();
  if (user.role === "learner") redirect("/dashboard");

  const isStaff = user.role === "admin" || user.role === "content_manager";
  const [track, { specialties, levels }] = await Promise.all([
    getEducatorTrackBySlug(slug, user.id, isStaff),
    getTaxonomies(),
  ]);

  if (!track) notFound();

  return (
    <div className="space-y-8">
      <Link
        href={`/educator/tracks/${track.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to track
      </Link>

      <PageHeader
        eyebrow={track.title}
        title="Edit track details"
        description="Update the metadata, marketing copy, outcomes, and prerequisites for this track."
      />

      <UpdateTrackForm track={track} specialties={specialties} levels={levels} />
    </div>
  );
}
