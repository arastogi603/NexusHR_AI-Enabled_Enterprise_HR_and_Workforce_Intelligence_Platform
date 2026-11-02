"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import toast from "react-hot-toast";

const PUBLIC_ROUTES = ["/login", "/register", "/meetings", "/meet"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isPublic = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

    // 1. Unauthenticated redirect to /login (preserve destination in ?redirect=)
    if (!token && !isPublic) {
      const redirectQuery = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectQuery}`);
      return;
    }

    // 2. Authenticated trying to visit /login or /register
    if (token && (pathname?.startsWith("/login") || pathname?.startsWith("/register"))) {
      router.replace("/");
      return;
    }

    // 3. Forced change password guard
    if (token && user?.mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
      return;
    }

    // 4. Role-based Route Guard
    if (token) {
      const role = user?.role?.toUpperCase() || "";
      const isStaffEmployee = !role.includes("ADMIN") && !role.includes("EXECUTIVE") && !role.includes("MANAGER") && !role.includes("SYSADMIN");

      if (pathname?.startsWith("/admin")) {
        const isAdminOrExec = role.includes("ADMIN") || role.includes("EXECUTIVE") || role.includes("SYSADMIN");
        if (!isAdminOrExec) {
          toast.error("Access Restricted: Administrator privileges required.");
          router.replace("/");
          return;
        }
      }

      if (isStaffEmployee && (pathname?.startsWith("/recruitment") || pathname?.startsWith("/analytics") || pathname?.startsWith("/employees"))) {
        toast.error("Access Restricted: Employee self-service workspace active.");
        router.replace("/");
        return;
      }
    }
  }, [mounted, token, user, pathname, router]);

  // If not mounted on client, render nothing to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const isPublic = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));
  if (!token && !isPublic) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
        <span className="text-xs font-mono text-white/60">Authenticating NexusHR Session...</span>
      </div>
    );
  }

  return <>{children}</>;
}
