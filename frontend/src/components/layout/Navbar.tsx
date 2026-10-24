"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, Layers, Calendar, Briefcase, Users, LayoutDashboard, Sun, Moon, LogIn, Clock, Target, Building2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useState, useEffect } from "react";
import GooeyNav from "@/components/GooeyNav";
import { useTheme } from "@/lib/theme/theme";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import OptionWheel from "@/components/OptionWheel";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leaves", href: "/leaves", icon: Calendar },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Payroll", href: "/payroll", icon: Briefcase },
  { label: "Performance", href: "/performance", icon: Target },
  { label: "Directory", href: "/employees", icon: Building2 },
  { label: "Profile", href: "/profile", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show navbar in auth pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null;
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.includes("#")) return pathname === href.split("#")[0];
    return pathname.startsWith(href);
  };

  const dynamicNavItems = [
    ...navItems,
    { label: "Admin Ops", href: "/admin/dashboard", icon: LayoutDashboard },
    ...(isAuthenticated
      ? [
        { label: "Sign Out", href: "#", icon: LogOut, onClick: (e: React.MouseEvent) => { e.preventDefault(); logout(); window.location.href = "/"; } }
      ]
      : [
        { label: "Sign In", href: "/login", icon: LogIn }
      ]),
  ];

  return (
    <>
      <header>
        <div className="navbar">
          <div className="navbar-inner">
            {/* Mobile Hamburger */}
            <button
              className="hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* NexusHR Brand */}
            <Link href="/" className="navbar-logo">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-sm shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="navbar-brand-name font-bold text-lg tracking-tight">
                Nexus<span className="text-indigo-400">HR</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-links">
              <GooeyNav
                items={dynamicNavItems}
                initialActiveIndex={Math.max(0, dynamicNavItems.findIndex(item => isActive(item.href)))}
              />
            </div>

            {/* Desktop Actions */}
            <div className="navbar-actions flex items-center gap-2">
              <NotificationCenter />
              <div className="desktop-only">
                <ThemeToggle />
              </div>

              {isAuthenticated && (
                <span className="desktop-only text-xs font-semibold text-[var(--nav-item-text)] ml-2">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              )}
            </div>

            {/* Mobile Spacer */}
            <div className="navbar-spacer" />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
          <div className="mobile-menu" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', padding: 0, paddingBottom: 'env(safe-area-inset-bottom, 20px)', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: '350px' }}>
              {(() => {
                const mobileWheelItems = [
                  ...dynamicNavItems,
                  {
                    label: theme === "dark" ? "Light Mode" : "Dark Mode",
                    icon: theme === "dark" ? Sun : Moon,
                    href: "#theme",
                    onClick: (e: any) => { e?.preventDefault(); toggleTheme(); }
                  }
                ];

                return (
                  <OptionWheel
                    items={mobileWheelItems.map(item => ({
                      label: item.label,
                      icon: item.icon,
                      href: item.href,
                      onClick: (item as any).onClick
                    })) as any}
                    defaultSelected={Math.max(0, dynamicNavItems.findIndex(item => isActive(item.href)))}
                    activeColor={theme === "dark" ? "#ffffff" : "#111111"}
                    textColor={theme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
                    side="left"
                    fontSize={2.2}
                    spacing={1.8}
                    inset={40}
                    loop={true}
                    onChange={(idx: number) => {
                      const item = mobileWheelItems[idx];
                      if (!item) return;

                      if ((window as any).wheelNavTimer) {
                        clearTimeout((window as any).wheelNavTimer);
                      }

                      (window as any).wheelNavTimer = setTimeout(() => {
                        if (item.href === "#theme") {
                          toggleTheme();
                          closeMobileMenu();
                          return;
                        }

                        closeMobileMenu();
                        if ((item as any).onClick) {
                          (item as any).onClick({ preventDefault: () => { } });
                        } else if (item.href) {
                          router.push(item.href);
                        }
                      }, 800);
                    }}
                  />
                );
              })()}
            </div>
          </div>
        </>
      )}
    </>
  );
}
