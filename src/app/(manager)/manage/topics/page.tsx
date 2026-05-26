import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { Button } from "@/components/ui/button";
import { TopicsList } from "@/features/topics/components/TopicsList";
import { getStaffTopics } from "@/features/topics/server/queries";
import type { TopicStatus } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Topics" };

type Props = { searchParams: Promise<{ status?: string }> };

const FILTERS: Array<{ value: TopicStatus | "all"; label: string }> = [
  { value: "published", label: "Published" },
  { value: "draft",     label: "Drafts" },
  { value: "archived",  label: "Archived" },
  { value: "all",       label: "All" },
];

function parseStatus(raw?: string): TopicStatus | undefined {
  if (raw === "draft" || raw === "published" || raw === "archived" || raw === "in_review") return raw;
  return undefined;
}

export default async function ManageTopicsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = parseStatus(status);
  const topics = await getStaffTopics(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Topics"
        description="All published and draft topics. Create, edit, and manage the content library."
        actions={
          <Button asChild size="sm">
            <Link href="/manage/topics/new"><Plus className="size-3.5" /> New topic</Link>
          </Button>
        }
      />

      <nav className="flex flex-wrap items-center gap-1.5 border-b border-hairline pb-3">
        {FILTERS.map((f) => {
          const active = (filter ?? "published") === f.value || (f.value === "all" && !filter);
          const href = f.value === "all" ? "/manage/topics" : `/manage/topics?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[14px] transition-all duration-150 ease-apple",
                active ? "bg-ink text-white" : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <TopicsList topics={topics} />
    </div>
  );
}
