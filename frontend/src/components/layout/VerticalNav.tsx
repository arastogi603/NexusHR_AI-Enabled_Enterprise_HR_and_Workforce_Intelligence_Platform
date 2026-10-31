"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { useTheme } from "@/lib/theme/theme";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Briefcase,
  Target,
  Building2,
  Users,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Layers,
  Sparkles,
  Video,
  Award,
  UserCheck
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leaves", href: "/leaves", icon: Calendar },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Payroll", href: "/payroll", icon: Briefcase },
  { label: "Performance", href: "/performance", icon: Target },
  { label: "Meetings", href: "/meetings", icon: Video },
  { label: "Recruitment", href: "/recruitment", icon: UserCheck },
  { label: "Kudos", href: "/kudos", icon: Award },
  { label: "Intelligence", href: "/analytics", icon: Sparkles },
  { label: "Directory", href: "/employees", icon: Building2 },
  { label: "Admin", href: "/admin/dashboard", icon: ShieldCheck },
  { label: "Profile", href: "/profile", icon: Users },
];

function GroovyDockIcon({
  item,
  active,
  mouseY,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  mouseY: MotionValue<number>;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.top + bounds.height / 2);
  });

  // Smooth dock magnification curve
  const scaleSync = useTransform(distance, [-80, 0, 80], [1, 1.32, 1]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 220, damping: 14 });

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center py-0.5 group shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        type="button"
        style={{ scale }}
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors duration-200 relative ${
          active
            ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/35 ring-2 ring-orange-400/40"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.08]"
        }`}
        title={item.label}
      >
        <Icon className="w-4 h-4 transition-transform" />
        {active && (
          <span className="absolute -left-2 w-1.5 h-4 rounded-r-full bg-orange-400 shadow-[0_0_8px_#ff6b2c]" />
        )}
      </motion.button>

      {/* Groovy Tooltip */}
      <div className="hidden lg:block absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-[#121622]/90 backdrop-blur-xl border border-slate-700/50 dark:border-white/10 text-xs font-semibold text-white whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
        {item.label}
      </div>
    </div>
  );
}

export function VerticalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, token, logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mouseY = useMotionValue(Infinity);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on auth pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/change-password") {
    return null;
  }

  const roleStr = user?.role?.toUpperCase() || "";
  const isAdmin = roleStr.includes("ADMIN") || roleStr.includes("SYSADMIN");
  const isExecutive = !isAdmin && (roleStr.includes("EXECUTIVE") || roleStr.includes("CHRO"));
  const isManager = !isAdmin && !isExecutive && roleStr.includes("MANAGER");
  const isEmployee = !isAdmin && !isExecutive && !isManager;

  // Strict RBAC: normal employee only sees role-appropriate self-service navigation
  const visibleNavItems = navItems.filter((item) => {
    if (isEmployee) {
      // Normal employee only sees self-service tools (Dashboard, Leaves, Attendance, Payroll, Performance, Meetings, Kudos, Profile)
      const restrictedForEmployee = ["/admin", "/recruitment", "/analytics", "/employees"];
      return !restrictedForEmployee.some((prefix) => item.href.startsWith(prefix));
    }
    if (item.href.startsWith("/admin")) {
      return isAdmin;
    }
    return true;
  });

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isAuthed = mounted ? (isAuthenticated || !!token) : (typeof window !== "undefined" ? !!localStorage.getItem("token") : true);

  return (
    <aside
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className="fixed bottom-3 left-3 right-3 lg:static lg:w-[68px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] rounded-[24px] sm:rounded-[36px] border border-slate-300/80 dark:border-white/10 bg-white/95 dark:bg-[#10141f]/95 backdrop-blur-3xl shadow-2xl flex lg:flex-col items-center justify-between p-2 sm:p-2.5 z-50 select-none transition-all duration-300 shrink-0"
    >
      {/* Top: Brand Logo */}
      <div className="flex items-center lg:flex-col gap-3 shrink-0">
        <Link
          href="/"
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 active:scale-95"
          title="NexusHR Home"
        >
          <Layers className="w-5 h-5 text-white" />
        </Link>
      </div>

      {/* Middle: Docker Effect Groovy Nav Icons (Desktop) */}
      <div className="hidden lg:flex flex-col items-center gap-1 my-auto py-1 overflow-y-auto no-scrollbar flex-1 w-full shrink min-h-0">
        {visibleNavItems.map((item) => (
          <GroovyDockIcon
            key={item.href}
            item={item}
            active={isActive(item.href)}
            mouseY={mouseY}
            onClick={() => router.push(item.href)}
          />
        ))}
      </div>

      {/* Mobile Horizontal Fallback */}
      <nav className="flex lg:hidden items-center gap-1.5 overflow-x-auto py-1 flex-1 min-w-0 px-2 no-scrollbar">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                active
                  ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.06]"
              }`}
            >
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme Toggle & Logout */}
      <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-2.5 border-t border-slate-300/60 dark:border-white/10 w-full justify-center">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.08] transition-all cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
        </button>

        {isAuthed ? (
          <div className="relative group flex items-center justify-center">
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/30 hover:border-rose-600 shadow-md shadow-rose-500/20 transition-all duration-200 cursor-pointer"
              title="Sign Out (Logout)"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
            {/* Tooltip */}
            <div className="hidden lg:block absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#121622]/95 backdrop-blur-xl border border-rose-500/30 text-xs font-semibold text-rose-300 whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Sign Out
            </div>
          </div>
        ) : (
          <div className="relative group flex items-center justify-center">
            <Link
              href="/login"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              title="Sign In"
              aria-label="Sign In"
            >
              <LogIn className="w-4 h-4" />
            </Link>
            <div className="hidden lg:block absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#121622]/95 backdrop-blur-xl border border-white/10 text-xs font-semibold text-white whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
              Sign In
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
