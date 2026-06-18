"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Shell, { NavItem } from "../components/Shell";

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "patients",
    label: "Patients",
    href: "/dashboard?tab=patients",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    id: "quizzes",
    label: "Quizzes",
    href: "/dashboard?tab=quizzes",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    id: "scenarios",
    label: "Scenarios",
    href: "/dashboard?tab=scenarios",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414-1.414 3.414H12m8 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2",
  },
  {
    id: "performance",
    label: "Performance",
    href: "/dashboard?tab=performance",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
];

function isActive(item: NavItem, pathname: string, searchParams: URLSearchParams) {
  const activeTab = searchParams.get("tab") || "dashboard";
  if (item.id === "dashboard") {
    return pathname === "/dashboard" && activeTab === "dashboard";
  }
  return activeTab === item.id;
}

export default function StudentLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Shell
      role="student"
      navItems={navItems}
      isActive={(item) => isActive(item, pathname, searchParams)}
    >
      {children}
    </Shell>
  );
}
