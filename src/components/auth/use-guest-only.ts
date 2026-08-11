"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthStatus } from "@/context/auth-context";

export function useGuestOnly(): AuthStatus {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authed") router.replace("/");
  }, [router, status]);

  return status;
}