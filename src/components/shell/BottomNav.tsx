"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { NAV_ICONS, type NavSection } from "@/config/nav";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/educator" || href === "/staff") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── More drawer (full-screen nav sheet) ─────────────────────────────────────

function NavDrawer({
  sections,
  onClose,
}: {
  sections: NavSection[];
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet slides up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-hairline bg-surface-raised pb-[env(safe-area-inset-bottom)] shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="mx-auto h-1 w-10 rounded-full bg-ink-muted/30 absolute left-1/2 top-3 -translate-x-1/2" />
          <p className="text-[13px] font-semibold text-ink">Navigation</p>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted hover:bg-surface-subtle transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="max-h-[60vh] overflow-y-auto px-4 pb-6 space-y-4">
          {sections.map((section, i) => (
            <div key={i}>
              {section.label && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                  {section.label}
                </p>
              )}
              <div className="rounded-xl border border-hairline bg-surface-subtle/50 overflow-hidden divide-y divide-hairline">
                {section.items.map((item) => {
                  const Icon = NAV_ICONS[item.icon];
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-[14px] font-medium transition-colors",
                        active ? "text-accent bg-accent/5" : "text-ink hover:bg-surface-subtle",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Bottom nav bar ───────────────────────────────────────────────────────────

export function BottomNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allItems = sections.flatMap((s) => s.items.filter((i) => i.mobile));

  if (allItems.length === 0) return null;

  // Show first 3 items; if there are more, the 4th slot becomes "More"
  const visibleItems = allItems.slice(0, 3);
  const hasMore = allItems.length > 3;
  const slotCount = hasMore ? 4 : visibleItems.length;

  const colClass = (["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4"] as const)[slotCount - 1];

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className={cn(
          "lg:hidden",
          "fixed inset-x-0 bottom-0 z-40",
          "border-t border-hairline/60 bg-surface-raised/80 backdrop-blur-xl",
          "pb-[env(safe-area-inset-bottom)]",
        )}
      >
        <ul className={cn("grid h-[56px]", colClass)}>
          {visibleItems.map((item) => {
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
                  <span className="text-[10px] font-medium truncate px-1">{item.label}</span>
                </Link>
              </li>
            );
          })}

          {hasMore && (
            <li>
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="More navigation"
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-0.5 transition-all duration-150",
                  drawerOpen ? "text-accent" : "text-ink-muted",
                )}
              >
                <MoreHorizontal className="size-[22px] shrink-0" aria-hidden />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      {drawerOpen && (
        <NavDrawer sections={sections} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}
