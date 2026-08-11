"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api/client";
import { clearToken } from "@/lib/token-store";
import { PageSpinner } from "@/components/ui/spinner";

function CallbackHandler() {
  const { completeOAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Produced by the backend redirects: GET /api/v1/auth/google/callback
  const token = searchParams.get("token");
  const oauthError = searchParams.get("error");

  const [error, setError] = useState<string | null>(oauthError);

  useEffect(() => {
    if (!token || error) return;
    let cancelled = false;
    (async () => {
      try {
        await completeOAuth(token);
        if (cancelled) return;
        router.replace("/");
      } catch (err) {
        if (cancelled) return;
        clearToken();
        setError(err instanceof ApiError ? err.message : "Google sign-in failed. Please try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, error, completeOAuth, router]);

  if (error || !token) {
    return (
      <div className="mx-auto w-full max-w-sm px-4 pb-16 pt-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">Sign in failed</h1>
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error ?? "No sign-in response was received. Please try again."}
        </p>
        <Link href="/login" className="font-medium underline underline-offset-2">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 pb-16 pt-12 text-center">
      <PageSpinner />
      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Completing sign in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
