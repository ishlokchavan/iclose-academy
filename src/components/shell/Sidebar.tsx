"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "@/components/shell/Brand";
import { cn } from "@/lib/utils/cn";
import { NAV_ICONS, type NavSection } from "@/config/nav";

export function Sidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col",
        /* Apple sidebar: no harsh right border — rely on background contrast */
        "fixed inset-y-0 left-0 w-60 bg-surface-raised/80 backdrop-blur-xl",
        "border-r border-hairline/60",
      )}
      aria-label="Primary navigation"
    >
      {/* Brand lockup */}
      <div className="flex h-[60px] items-center px-5">
        <Brand href="/dashboard" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-5 last:mb-0">
            {section.label ? (
              <p className="mb-1 px-3 eyebrow text-ink-tertiary">
                {section.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = NAV_ICONS[item.icon];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-all duration-150 ease-apple",
                        active
                          ? "bg-surface-subtle font-semibold text-ink"
                          : "text-ink-muted hover:bg-surface-subtle/70 hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          active ? "text-accent" : "text-ink-muted",
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/educator" || href === "/staff") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
