import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/patterns/PageHeader";
import { CommunitiesTable } from "@/features/taxonomy/components/CommunitiesTable";
import { TypesEditor } from "@/features/taxonomy/components/TypesEditor";
import { getTaxonomy } from "@/features/topics/server/queries";
import { cn } from "@/lib/utils/cn";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Categories" };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function ManageCategoriesPage({ searchParams }: Props) {
  const { tab = "communities" } = await searchParams;
  const activeTab = tab === "types" ? "types" : "communities";

  const supabase = await createSupabaseServerClient();

  const [taxonomy, educatorsRes] = await Promise.all([
    getTaxonomy(),
    supabase
      .from("profiles")
      .select("id, full_name")
      .not("full_name", "is", null)
      .in("role", ["educator", "content_manager", "manager"])
      .order("full_name"),
  ]);

  const educators = (educatorsRes.data ?? []) as { id: string; full_name: string | null }[];

  const tabs = [
    { id: "communities", label: "Communities", count: taxonomy.areas.length },
    { id: "types",       label: "Property Types", count: taxonomy.types.length },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Categories"
        description="Manage how topics and inquiries are classified."
      />

      {/* ── Tab bar ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-hairline">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors",
              activeTab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t.label}
            <span className={cn(
              "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
              activeTab === t.id
                ? "bg-accent/15 text-accent"
                : "bg-surface-subtle text-ink-tertiary",
            )}>
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────────── */}
      {activeTab === "communities" ? (
        <CommunitiesTable areas={taxonomy.areas} educators={educators} />
      ) : (
        <TypesEditor types={taxonomy.types} subtypes={taxonomy.subtypes} />
      )}
    </div>
  );
}
