"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { NAV_ICONS, type NavSection } from "@/config/nav";

export function BottomNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const items = sections.flatMap((s) => s.items.filter((i) => i.mobile));

  if (items.length === 0) return null;

  const colClass =
    items.length <= 4
      ? (["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4"] as const)[items.length - 1]
      : items.length === 5
        ? "grid-cols-5"
        : "grid-cols-6";

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "lg:hidden",
        "fixed inset-x-0 bottom-0 z-40",
        /* Apple tab bar: frosted glass */
        "border-t border-hairline/60 bg-surface-raised/80 backdrop-blur-xl",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className={cn("grid h-[56px]", colClass)}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = NAV_ICONS[item.icon];
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 transition-all duration-150 ease-apple",
                  active ? "text-accent" : "text-ink-muted",
                )}
              >
                <Icon className="size-[22px] shrink-0" aria-hidden />
                <span className="text-[10px] font-medium truncate px-1">
                  {item.label}
                </span>
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
