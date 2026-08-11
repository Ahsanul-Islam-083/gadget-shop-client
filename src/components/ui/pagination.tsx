export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-10">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-heading text-xs font-bold text-slate-700 shadow-sm transition hover:border-cyan-500 hover:text-cyan-600 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
      >
        ← Prev Sector
      </button>
      <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Page {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-heading text-xs font-bold text-slate-700 shadow-sm transition hover:border-cyan-500 hover:text-cyan-600 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-400"
      >
        Next Sector →
      </button>
    </nav>
  );
}