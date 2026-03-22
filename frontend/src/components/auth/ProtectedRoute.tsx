"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const publicPaths = ["/auth/login", "/auth/register"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/auth/login");
    }
  }, [isHydrated, isAuthenticated, pathname, router]);

  // Don't render until hydration is complete to prevent mismatch
  if (!isHydrated) {
    return null;
  }

  // If not authenticated and not on a public path, don't render children while redirecting
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
