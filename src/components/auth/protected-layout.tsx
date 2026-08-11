"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PageSpinner } from "@/components/ui/spinner";

export function ProtectedLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "anon") return;
    router.replace(`/login?next=${encodeURIComponent(pathname ?? "/")}`);
  }, [pathname, router, status]);

  if (status === "loading" || status === "anon") return <PageSpinner />;
  return <>{children}</>;
}