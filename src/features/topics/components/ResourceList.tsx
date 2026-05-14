import { File, FileText, Image as ImageIcon, Link2 } from "lucide-react";

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Link2,
  doc: FileText,
  image: ImageIcon,
  file: File,
};

type Resource = {
  id: string;
  label: string;
  url: string | null;
  storage_path: string | null;
  kind: string;
};

export function ResourceList({ resources }: { resources: Resource[] }) {
  if (!resources.length) return null;
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Resources
      </h3>
      <div className="flex flex-col gap-1.5">
        {resources.map((r) => {
          const Icon = KIND_ICON[r.kind] ?? File;
          const href = r.url ?? (r.storage_path ? `/api/files/${r.storage_path}` : null);
          if (!href) return null;
          return (
            <a
              key={r.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-2.5 text-sm transition-colors hover:border-zinc-300 hover:bg-surface-subtle"
            >
              <Icon className="size-4 shrink-0 text-ink-muted" />
              <span className="text-ink">{r.label}</span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                {r.kind}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
