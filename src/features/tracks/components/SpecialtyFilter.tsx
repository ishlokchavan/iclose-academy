import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type Specialty = { id: string; slug: string; name: string };

type Props = {
  specialties: Specialty[];
  activeSlug?: string;
};

export function SpecialtyFilter({ specialties, activeSlug }: Props) {
  const items = [{ slug: "", name: "All Tracks" }, ...specialties];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Filter by specialty">
      {items.map((s) => {
        const isActive = s.slug === (activeSlug ?? "");
        return (
          <Link
            key={s.slug}
            href={s.slug ? `/tracks?specialty=${s.slug}` : "/tracks"}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-ink text-white"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-ink",
            )}
          >
            {s.name}
          </Link>
        );
      })}
    </nav>
  );
}
