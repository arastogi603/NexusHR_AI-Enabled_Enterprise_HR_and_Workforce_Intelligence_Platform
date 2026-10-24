"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isCoreTeam } from "@/lib/roles";
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, fallback, redirectTo }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasAccess = (() => {
    if (!isAuthenticated || !user?.role) return false;
    if (allowedRoles.includes(user.role)) return true;
    if (allowedRoles.includes("core-team") && isCoreTeam(user.role)) return true;
    return false;
  })();

  if (!hasAccess) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// Higher-order component variant for protecting entire pages
export function withRoleGuard(Component: React.ComponentType, allowedRoles: string[]) {
  return function ProtectedPage(props: any) {
    return (
      <RoleGuard allowedRoles={allowedRoles} redirectTo="/login">
        <Component {...props} />
      </RoleGuard>
    );
  };
}
