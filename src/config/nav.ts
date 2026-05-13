import {
  BookOpen,
  CircleUserRound,
  Compass,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Library,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import type { AppRole } from "@/lib/auth/session";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Show this item in the mobile bottom nav (in addition to the sidebar). */
  mobile?: boolean;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const LEARNER_NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Gauge, mobile: true },
      { label: "Library", href: "/tracks", icon: Library, mobile: true },
      { label: "Progress", href: "/progress", icon: Sparkles, mobile: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Saved", href: "/saved", icon: BookOpen },
      { label: "Profile", href: "/profile", icon: CircleUserRound, mobile: true },
    ],
  },
];

export const EDUCATOR_NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/educator", icon: LayoutDashboard, mobile: true },
      { label: "My tracks", href: "/educator/tracks", icon: GraduationCap, mobile: true },
      { label: "Analytics", href: "/educator/analytics", icon: Sparkles, mobile: true },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", href: "/profile", icon: CircleUserRound, mobile: true }],
  },
];

export const STAFF_NAV: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/staff", icon: LayoutDashboard, mobile: true },
      { label: "Educators", href: "/staff/educators", icon: GraduationCap, mobile: true },
      { label: "Tracks", href: "/staff/tracks", icon: Library, mobile: true },
      { label: "Taxonomies", href: "/staff/taxonomies", icon: Compass },
    ],
  },
  {
    label: "Admin only",
    items: [
      { label: "Users", href: "/staff/users", icon: Users },
      { label: "Settings", href: "/staff/settings", icon: Settings },
    ],
  },
];

export function navForRole(role: AppRole): NavSection[] {
  switch (role) {
    case "learner":
      return LEARNER_NAV;
    case "educator":
      return EDUCATOR_NAV;
    case "content_manager":
    case "admin":
      return STAFF_NAV;
  }
}

export const ROLE_LANDING: Record<AppRole, string> = {
  learner: "/dashboard",
  educator: "/educator",
  content_manager: "/staff",
  admin: "/staff",
};

export const ROLE_LABEL: Record<AppRole, { label: string; icon: LucideIcon }> = {
  learner: { label: "Learner", icon: GraduationCap },
  educator: { label: "Educator", icon: Sparkles },
  content_manager: { label: "Content Manager", icon: ShieldCheck },
  admin: { label: "Admin", icon: ShieldCheck },
};
