"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import type { NavSection } from "@/config/nav";

export function BottomNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const items = sections.flatMap((s) => s.items.filter((i) => i.mobile)).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "lg:hidden",
        "fixed inset-x-0 bottom-0 z-40",
        "border-t border-hairline bg-surface-raised/95 backdrop-blur",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="grid h-16 grid-cols-4">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-200 ease-luxury",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                <item.icon
                  className={cn("size-5 shrink-0", active && "text-accent")}
                  aria-hidden
                />
                <span className="truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/educator" || href === "/staff") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
