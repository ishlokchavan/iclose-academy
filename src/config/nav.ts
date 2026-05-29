import {
  Bookmark,
  Briefcase,
  CircleUserRound,
  FileClock,
  Inbox,
  LayoutGrid,
  Library,
  MessageSquarePlus,
  Share2,
  ShieldCheck,
  Tags,
  Users,
  Wallet,
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
  | "message-plus"
  | "briefcase"
  | "share"
  | "log"
  | "wallet";

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
  briefcase:      Briefcase,
  share:          Share2,
  log:            FileClock,
  wallet:         Wallet,
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
      { label: "Overview",   href: "/manage",           icon: "grid",      mobile: true },
      { label: "Topics",     href: "/manage/topics",    icon: "library",   mobile: true },
      { label: "Inquiries",  href: "/manage/inquiries", icon: "inbox",     mobile: true },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Educators",  href: "/manage/educators", icon: "users",     mobile: true },
      { label: "Categories", href: "/manage/taxonomy",  icon: "tags",      mobile: true },
      { label: "Hires",      href: "/manage/hires",     icon: "briefcase", mobile: true },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Members", href: "/manage/members", icon: "share" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Audit log", href: "/manage/audit-log", icon: "log" },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Admin — manager nav with Users + Plans added into the Platform section
// ──────────────────────────────────────────────────────────────────────────────
export const ADMIN_NAV: NavSection[] = MANAGER_NAV.map((section) => {
  if (section.label !== "Platform") return section;
  return {
    ...section,
    items: [
      { label: "Users", href: "/manage/users", icon: "users", mobile: true } as NavItem,
      { label: "Plans", href: "/manage/plans", icon: "wallet" } as NavItem,
      ...section.items,
    ],
  };
});

export function navForRole(role: AppRole): NavSection[] {
  switch (role) {
    case "learner":
      return LEARNER_NAV;
    case "admin":
      return ADMIN_NAV;
    case "manager":
    case "educator":
      return MANAGER_NAV;
    case "partner":
      return [];
  }
}

export const ROLE_LANDING: Record<AppRole, string> = {
  learner:  "/topics",
  educator: "/manage",  // legacy — redirect to manager area
  manager:  "/manage",
  admin:    "/manage",
  partner:  "/partner/dashboard",
};

export const ROLE_LABEL: Record<AppRole, { label: string; icon: LucideIcon }> = {
  learner:  { label: "Learner",  icon: Library },
  educator: { label: "Educator", icon: Users },  // legacy
  manager:  { label: "Manager",  icon: ShieldCheck },
  admin:    { label: "Admin",    icon: ShieldCheck },
  partner:  { label: "Partner",  icon: Users },
};
