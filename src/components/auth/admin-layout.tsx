"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PageSpinner } from "@/components/ui/spinner";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anon") {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/")}`);
    } else if (status === "authed" && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [pathname, router, status, user?.role]);

  if (status !== "authed" || user?.role !== "ADMIN") return <PageSpinner />;
  return <>{children}</>;
}