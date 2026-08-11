/* Shared skeleton shimmer utilities */

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10";

function SkeletonBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-neutral-200 dark:bg-neutral-800 ${shimmer} ${className}`}
    />
  );
}

/* Product card skeleton — matches ProductCard dimensions */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800"
    >
      {/* Image area */}
      <SkeletonBox className="aspect-square w-full" />
      {/* Text area */}
      <div className="flex flex-col gap-2 p-4">
        <SkeletonBox className="h-3 w-1/3" />
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
        <div className="mt-2 flex items-center justify-between">
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/* Grid of product card skeletons */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/* Product detail skeleton — 2-col on lg */
export function ProductDetailSkeleton() {
  return (
    <div
      aria-label="Loading product…"
      className="mx-auto w-full max-w-6xl px-4 py-10"
    >
      {/* breadcrumb */}
      <SkeletonBox className="mb-4 h-4 w-24" />
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <SkeletonBox className="aspect-square w-full rounded-md" />
        {/* Info */}
        <div className="flex flex-col gap-4">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-7 w-3/4" />
          <SkeletonBox className="h-4 w-1/3" />
          <SkeletonBox className="h-6 w-28" />
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="mt-2 h-16 w-full" />
          <div className="mt-4 flex gap-3">
            <SkeletonBox className="h-10 flex-1 rounded-md" />
            <SkeletonBox className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Single order row skeleton */
function OrderRowSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4"
    >
      <div className="min-w-32 space-y-1.5">
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-3 w-16" />
      </div>
      <SkeletonBox className="h-3 w-12" />
      <div className="ml-auto flex items-center gap-2">
        <SkeletonBox className="h-5 w-20 rounded-full" />
        <SkeletonBox className="h-5 w-16 rounded-full" />
        <SkeletonBox className="ml-2 h-4 w-16" />
      </div>
    </li>
  );
}

/* Order list skeleton */
export function OrderListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="divide-y divide-neutral-200 overflow-hidden rounded-md border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {Array.from({ length: count }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </ul>
  );
}

/* Table row skeleton (admin tables) */
function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBox className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}

/* Admin table skeleton */
export function AdminTableSkeleton({
  rows = 10,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
