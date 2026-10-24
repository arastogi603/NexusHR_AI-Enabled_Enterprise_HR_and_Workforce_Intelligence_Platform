"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Don't show footer on auth pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password") {
    return null;
  }

  return (
    <footer className="w-full mt-auto py-8 border-t border-black/5 dark:border-white/10 relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-[var(--text-primary)]">NexusHR</span>
          <span>— Enterprise Workforce Intelligence</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Dashboard
          </Link>
          <Link href="/leaves" className="hover:text-[var(--text-primary)] transition-colors">
            Leaves
          </Link>
          <Link href="/payroll" className="hover:text-[var(--text-primary)] transition-colors">
            Payroll
          </Link>
        </div>

        <p className="text-[11px] text-[var(--text-muted)]">
          © {new Date().getFullYear()} NexusHR. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
