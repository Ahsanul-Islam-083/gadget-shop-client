"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or telemetry
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600 dark:bg-red-950 dark:text-red-400">
        !
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Something went wrong</h1>
      <p className="mb-8 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        {error.message || "An unexpected error occurred while loading this page. Please try again."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
