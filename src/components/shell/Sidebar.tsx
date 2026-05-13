"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "@/components/shell/Brand";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import { NAV_ICONS, type NavSection } from "@/config/nav";

export function Sidebar({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col",
        "fixed inset-y-0 left-0 w-60 border-r border-hairline bg-surface-raised",
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-16 items-center px-5">
        <Brand href="/dashboard" />
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6 last:mb-0">
            {section.label ? (
              <p className="mb-2 px-3 text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
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
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200 ease-luxury",
                        active
                          ? "bg-surface-subtle font-medium text-ink"
                          : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
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
