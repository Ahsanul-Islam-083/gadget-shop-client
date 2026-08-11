import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
        404
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Page Not Found</h1>
      <p className="mb-8 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Go to Home
        </Link>
        <Link
          href="/products"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
