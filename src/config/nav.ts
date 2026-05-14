import {
  Bookmark,
  CircleUserRound,
  GraduationCap,
  Inbox,
  LayoutGrid,
  Library,
  MessageSquarePlus,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
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
  | "send"
  | "grid"
  | "tags"
  | "users"
  | "settings"
  | "shield"
  | "graduation"
  | "sparkles"
  | "message-plus";

export const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  library: Library,
  bookmark: Bookmark,
  user: CircleUserRound,
  inbox: Inbox,
  send: Send,
  grid: LayoutGrid,
  tags: Tags,
  users: Users,
  settings: Settings,
  shield: ShieldCheck,
  graduation: GraduationCap,
  sparkles: Sparkles,
  "message-plus": MessageSquarePlus,
};

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconName;
  /** Show this item in the mobile bottom nav. */
  mobile?: boolean;
};

export type NavSection = { label?: string; items: NavItem[] };

export const LEARNER_NAV: NavSection[] = [
  {
    items: [
      { label: "Library", href: "/topics", icon: "library", mobile: true },
      { label: "Post inquiry", href: "/inquiries/new", icon: "message-plus", mobile: true },
      { label: "My inquiries", href: "/inquiries", icon: "inbox", mobile: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Saved", href: "/saved", icon: "bookmark" },
      { label: "Profile", href: "/profile", icon: "user", mobile: true },
    ],
  },
];

export const EDUCATOR_NAV: NavSection[] = [
  {
    items: [
      { label: "My topics", href: "/educator", icon: "grid", mobile: true },
      { label: "Inquiries", href: "/educator/inquiries", icon: "inbox", mobile: true },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Profile", href: "/profile", icon: "user", mobile: true }],
  },
];

export const STAFF_NAV: NavSection[] = [
  {
    items: [
      { label: "Overview", href: "/staff", icon: "grid", mobile: true },
      { label: "Topics", href: "/staff/topics", icon: "library", mobile: true },
      { label: "Inquiries", href: "/staff/inquiries", icon: "inbox", mobile: true },
    ],
  },
  {
    label: "Configuration",
    items: [
      { label: "Taxonomy", href: "/staff/taxonomy", icon: "tags" },
      { label: "Users", href: "/staff/users", icon: "users" },
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
  learner: "/topics",
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
