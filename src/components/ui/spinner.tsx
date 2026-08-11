export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`flex items-center justify-center ${className}`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-600 dark:border-neutral-800 dark:border-t-neutral-300" />
    </div>
  );
}

export function PageSpinner() {
  return <Spinner className="min-h-[60vh]" />;
}