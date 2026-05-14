import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { TopicForm } from "@/features/topics/components/TopicForm";
import { getEducatorList } from "@/features/educators/server/queries";
import { getTaxonomy } from "@/features/topics/server/queries";

export const metadata: Metadata = { title: "New topic" };

export default async function NewTopicPage() {
  const [taxonomy, educators] = await Promise.all([getTaxonomy(), getEducatorList()]);

  return (
    <div className="space-y-8">
      <Link
        href="/manage/topics"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Topics
      </Link>
      <PageHeader eyebrow="Content" title="New topic" />
      <TopicForm
        mode="create"
        areas={taxonomy.areas}
        types={taxonomy.types}
        subtypes={taxonomy.subtypes}
        educators={educators}
        backHref="/manage/topics"
      />
    </div>
  );
}
