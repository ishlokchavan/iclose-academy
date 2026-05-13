import { FileText, Link2, Image, File } from "lucide-react";

import type { LessonResourceRow } from "@/features/tracks/types";

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Link2,
  doc: FileText,
  image: Image,
  file: File,
};

type Props = {
  resources: LessonResourceRow[];
};

export function ResourceList({ resources }: Props) {
  if (!resources.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Resources
      </h3>
      <div className="flex flex-col gap-1.5">
        {resources.map((r) => {
          const Icon = KIND_ICON[r.kind] ?? File;
          const href = r.url ?? (r.storage_path ? `/api/files/${r.storage_path}` : null);

          return (
            <a
              key={r.id}
              href={href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-2.5 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="text-ink">{r.label}</span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                {r.kind}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
