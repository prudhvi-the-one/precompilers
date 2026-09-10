import {
  Video,
  FileEdit,
  Users,
  Building2,
  Handshake,
  Layers,
  ClipboardCheck,
  Briefcase,
  LayoutDashboard,
  GraduationCap,
  UserCog,
  ReceiptIndianRupee,
  BarChart3,
  Trophy,
} from "lucide-react";
import type { PortalNavItem } from "@/components/shell/PortalSidebarNav";

export const MENTOR_NAV: PortalNavItem[] = [
  { label: "Recordings", href: "/recordings", icon: Video },
  { label: "My Content", href: "/content", icon: FileEdit },
];

export const ADMIN_NAV: PortalNavItem[] = [
  { label: "Users", href: "/users", icon: Users },
  { label: "Institutions", href: "/institutions", icon: Building2 },
  { label: "Vendors", href: "/vendors", icon: Handshake },
  { label: "Batches", href: "/batches", icon: Layers },
  { label: "Content", href: "/content", icon: FileEdit },
  { label: "Content Review", href: "/content-review", icon: ClipboardCheck },
  { label: "Drives", href: "/drives", icon: Briefcase },
];

export const INSTITUTION_ADMIN_NAV: PortalNavItem[] = [
  { label: "Cohort", href: "/cohort", icon: LayoutDashboard },
  { label: "Faculty", href: "/faculty", icon: GraduationCap },
  { label: "Mentors", href: "/mentors", icon: UserCog },
];

export const VENDOR_ADMIN_NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: ReceiptIndianRupee },
  { label: "Statistics", href: "/statistics", icon: BarChart3 },
  { label: "Placements", href: "/placements", icon: Briefcase },
  { label: "Batches", href: "/batches", icon: Layers },
  { label: "Content", href: "/content", icon: FileEdit },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];
