"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { PageSpinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "@/components/products/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import type { Category, Pagination as PaginationType, Product, ProductListParams } from "@/types/api";

const PAGE_SIZE = 12;

const SORTS: { value: string; label: string; sortBy: "newest" | "price" | "rating"; order: "asc" | "desc" }[] = [
  { value: "newest:desc", label: "Newest", sortBy: "newest", order: "desc" },
  { value: "price:asc", label: "Price: Low to High", sortBy: "price", order: "asc" },
  { value: "price:desc", label: "Price: High to Low", sortBy: "price", order: "desc" },
  { value: "rating:desc", label: "Top rated", sortBy: "rating", order: "desc" },
];

function toListParams(sp: URLSearchParams): ProductListParams {
  const page = Math.max(1, parseInt(sp.get("page") ?? "", 10) || 1);
  const rawSortBy = sp.get("sortBy");
  const sortBy: "newest" | "price" | "rating" =
    rawSortBy === "price" || rawSortBy === "rating" ? rawSortBy : "newest";
  const rawOrder = sp.get("order");
  const order: "asc" | "desc" | undefined =
    rawOrder === "asc" || rawOrder === "desc" ? rawOrder : undefined;
  const parseNumber = (v: string | null): number | undefined =>
    v && /^\d+(\.\d+)?$/.test(v) ? Number(v) : undefined;
  return {
    page,
    pageSize: PAGE_SIZE,
    search: sp.get("search")?.trim() || undefined,
    categoryId: sp.get("categoryId") || undefined,
    minPrice: parseNumber(sp.get("minPrice")),
    maxPrice: parseNumber(sp.get("maxPrice")),
    sortBy,
    order,
  };
}

function activeSort(p: ProductListParams) {
  const fallbackOrder = p.sortBy === "newest" ? "desc" : "asc";
  return (
    SORTS.find((s) => s.sortBy === p.sortBy && s.order === (p.order ?? fallbackOrder)) ??
    SORTS[0]
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-800 dark:bg-[#0d1117] dark:text-slate-100 dark:focus:border-cyan-400";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spString = searchParams.toString();

  const params = useMemo(() => toListParams(new URLSearchParams(spString)), [spString]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadedKey, setLoadedKey] = useState(spString);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(params.search ?? "");
  const [minPriceInput, setMinPriceInput] = useState(params.minPrice !== undefined ? String(params.minPrice) : "");
  const [maxPriceInput, setMaxPriceInput] = useState(params.maxPrice !== undefined ? String(params.maxPrice) : "");

  // Reset loading state in render when the URL changes, so the fetch effect runs with a visible loading state.
  if (loadedKey !== spString) {
    setLoadedKey(spString);
    setProducts([]);
    setPagination(null);
    setError(null);
    setLoading(true);
  }

  useEffect(() => {
    const controller = new AbortController();
    listProducts(params, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setProducts(res.data);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setProducts([]);
        setPagination(null);
        setError(err instanceof ApiError ? err.message : "Failed to load products.");
        setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spString, loadedKey]);

  useEffect(() => {
    let cancelled = false;
    listCategories({ page: 1, pageSize: 100 })
      .then((res) => {
        if (!cancelled) setCategories(res.data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the search input in sync with the URL param (render-time adjustment,
  // so typing locally never gets clobbered until the URL actually changes).
  const syncedSearch = params.search ?? "";
  const [appliedUrlSearch, setAppliedUrlSearch] = useState(syncedSearch);
  if (appliedUrlSearch !== syncedSearch) {
    setAppliedUrlSearch(syncedSearch);
    setSearchInput(syncedSearch);
  }

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === (params.search ?? "")) return;
    const t = setTimeout(() => {
      updateParams({ search: trimmed || null, page: null });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(spString);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function applyPrice() {
    const min = minPriceInput.trim();
    const max = maxPriceInput.trim();
    if (!/^\d+(\.\d+)?$/.test(min) && min !== "") return;
    if (!/^\d+(\.\d+)?$/.test(max) && max !== "") return;
    updateParams({ minPrice: min || null, maxPrice: max || null, page: null });
  }

  function resetFilters() {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    updateParams({ search: null, categoryId: null, minPrice: null, maxPrice: null, page: null });
  }

  const filtersActive =
    Boolean(params.search) || Boolean(params.categoryId) ||
    Boolean(params.minPrice) || Boolean(params.maxPrice);

  const sort = activeSort(params);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Products</h1>

      <div className="mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-6 dark:border-neutral-800 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="search" className="mb-1 block text-sm font-medium">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or brand…"
            className={inputClass}
          />
        </div>
        <div className="w-full lg:w-44">
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={params.categoryId ?? ""}
            onChange={(e) => updateParams({ categoryId: e.target.value || null, page: null })}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="w-24">
            <label htmlFor="minPrice" className="mb-1 block text-sm font-medium">
              Min $
            </label>
            <input
              id="minPrice"
              type="number"
              min="0"
              inputMode="decimal"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice();
              }}
              className={inputClass}
            />
          </div>
          <div className="w-24">
            <label htmlFor="maxPrice" className="mb-1 block text-sm font-medium">
              Max $
            </label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              inputMode="decimal"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice();
              }}
              className={inputClass}
            />
          </div>
        </div>
        <div className="w-full lg:w-48">
          <label htmlFor="sort" className="mb-1 block text-sm font-medium">
            Sort by
          </label>
          <select
            id="sort"
            value={sort.value}
            onChange={(e) => {
              const picked = SORTS.find((s) => s.value === e.target.value) ?? SORTS[0];
              updateParams({ sortBy: picked.sortBy, order: picked.order, page: null });
            }}
            className={inputClass}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {loading ? (
        <ProductGridSkeleton count={PAGE_SIZE} />
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-neutral-600 dark:text-neutral-400">
          No products match your filters.
        </p>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateParams({ page: String(page) })}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ProductsPageContent />
    </Suspense>
  );
}