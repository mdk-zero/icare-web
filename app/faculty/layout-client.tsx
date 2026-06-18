"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Shell, { NavItem } from "../components/Shell";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "faculty" | "admin";
}

function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("icare_user");
  return userStr ? JSON.parse(userStr) : null;
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", href: "/faculty", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "students", label: "My Students", href: "/faculty/students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { id: "scenarios", label: "Scenarios", href: "/faculty/scenarios", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414-1.414 3.414H12m8 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2" },
  { id: "patients", label: "Patients", href: "/faculty/patients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "analytics", label: "Analytics", href: "/faculty/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { id: "reports", label: "Reports", href: "/faculty/reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293 707V19a2 2 0 01-2 2z" },
  { id: "audit", label: "Audit Trail", href: "/faculty/audit", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "notifications", label: "Notifications", href: "/faculty/notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
];

function isActive(item: NavItem, pathname: string) {
  if (item.href === "/faculty") return pathname === "/faculty";
  return pathname.startsWith(item.href);
}

export default function ClientFacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else if (currentUser.role === "student") {
      router.push("/dashboard");
    } else if (currentUser.role === "admin") {
      router.push("/admin");
    } else {
      // Mark shell ready after client-side auth check.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <Shell
      role="faculty"
      navItems={navItems}
      isActive={(item) => isActive(item, pathname)}
    >
      {children}
    </Shell>
  );
}
