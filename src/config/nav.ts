import {
  Bookmark,
  CircleUserRound,
  Inbox,
  LayoutGrid,
  Library,
  MessageSquarePlus,
  ShieldCheck,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AppRole } from "@/lib/auth/session";

export type NavIconName =
  | "library"
  | "bookmark"
  | "user"
  | "inbox"
  | "grid"
  | "tags"
  | "users"
  | "shield"
  | "message-plus";

export const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  library:        Library,
  bookmark:       Bookmark,
  user:           CircleUserRound,
  inbox:          Inbox,
  grid:           LayoutGrid,
  tags:           Tags,
  users:          Users,
  shield:         ShieldCheck,
  "message-plus": MessageSquarePlus,
};

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconName;
  mobile?: boolean;
};

export type NavSection = { label?: string; items: NavItem[] };

// ──────────────────────────────────────────────────────────────────────────────
// Learner
// ──────────────────────────────────────────────────────────────────────────────
export const LEARNER_NAV: NavSection[] = [
  {
    items: [
      { label: "Browse",       href: "/topics",        icon: "library",      mobile: true },
      { label: "Post inquiry", href: "/inquiries/new", icon: "message-plus", mobile: true },
      { label: "My inquiries", href: "/inquiries",     icon: "inbox",        mobile: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Saved",   href: "/saved",   icon: "bookmark" },
      { label: "Profile", href: "/profile", icon: "user", mobile: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Content Manager — everything except users
// ──────────────────────────────────────────────────────────────────────────────
export const MANAGER_NAV: NavSection[] = [
  {
    items: [
      { label: "Overview",   href: "/manage",           icon: "grid",    mobile: true },
      { label: "Topics",     href: "/manage/topics",    icon: "library", mobile: true },
      { label: "Inquiries",  href: "/manage/inquiries", icon: "inbox",   mobile: true },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Educators",  href: "/manage/educators", icon: "users",  mobile: true },
      { label: "Categories", href: "/manage/taxonomy",  icon: "tags",   mobile: true },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Admin — manager nav + user management
// ──────────────────────────────────────────────────────────────────────────────
export const ADMIN_NAV: NavSection[] = [
  ...MANAGER_NAV,
  {
    label: "Platform",
    items: [
      { label: "Users", href: "/manage/users", icon: "users", mobile: true },
    ],
  },
];

export function navForRole(role: AppRole): NavSection[] {
  switch (role) {
    case "learner":
      return LEARNER_NAV;
    case "admin":
      return ADMIN_NAV;
    case "manager":
    case "educator":
      return MANAGER_NAV;
  }
}

export const ROLE_LANDING: Record<AppRole, string> = {
  learner:  "/topics",
  educator: "/manage",  // legacy — redirect to manager area
  manager:  "/manage",
  admin:    "/manage",
};

export const ROLE_LABEL: Record<AppRole, { label: string; icon: LucideIcon }> = {
  learner:  { label: "Learner",  icon: Library },
  educator: { label: "Educator", icon: Users },  // legacy
  manager:  { label: "Manager",  icon: ShieldCheck },
  admin:    { label: "Admin",    icon: ShieldCheck },
};
