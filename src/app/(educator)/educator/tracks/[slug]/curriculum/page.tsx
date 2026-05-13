import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { CurriculumEditor } from "@/features/educator/components/curriculum/CurriculumEditor";
import { getEducatorTrackBySlug } from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Curriculum · ${slug}` };
}

export default async function CurriculumPage({ params }: Props) {
  const { slug } = await params;
  const user = await requireUser();
  if (user.role === "learner") redirect("/dashboard");

  const isStaff = user.role === "admin" || user.role === "content_manager";
  const track = await getEducatorTrackBySlug(slug, user.id, isStaff);
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
        title="Curriculum"
        description="Organize your track into modules and lessons. Add YouTube videos, chapter timestamps, and preview flags."
      />

      <CurriculumEditor
        trackId={track.id}
        trackSlug={track.slug}
        modules={track.modules}
      />
    </div>
  );
}
