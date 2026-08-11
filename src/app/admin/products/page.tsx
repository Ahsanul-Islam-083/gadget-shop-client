"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  listProducts,
  deleteProduct,
  updateProduct,
} from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { toast } from "@/components/admin/toast";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { Pagination } from "@/components/ui/pagination";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import type { Pagination as PaginationType, Product } from "@/types/api";

const PAGE_SIZE = 15;

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <p className="mb-5 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

type DeleteMode = "soft" | "permanent";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{
    product: Product;
    mode: DeleteMode;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, 400);
  }

  const queryKey = `${page}:${debouncedSearch}:${includeDeleted}`;
  const [loadedKey, setLoadedKey] = useState(queryKey);
  if (loadedKey !== queryKey) {
    setLoadedKey(queryKey);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    listProducts({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load products."
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, includeDeleted]);

  function openCreate() {
    setEditProduct(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setShowForm(true);
  }

  function handleFormSuccess(saved: Product) {
    setShowForm(false);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  async function handleRestore(product: Product) {
    try {
      const updated = await updateProduct(product.id, { isDeleted: false });
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast("Product restored", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to restore.",
        "error"
      );
    }
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(
        confirmTarget.product.id,
        confirmTarget.mode === "permanent"
      );
      if (confirmTarget.mode === "permanent") {
        setProducts((prev) =>
          prev.filter((p) => p.id !== confirmTarget.product.id)
        );
        toast("Product permanently deleted", "success");
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === confirmTarget.product.id ? { ...p, isDeleted: true } : p
          )
        );
        toast("Product soft-deleted", "success");
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Delete failed.",
        "error"
      );
    } finally {
      setDeleting(false);
      setConfirmTarget(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {pagination && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {pagination.total} product{pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          + New product
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => {
              setIncludeDeleted(e.target.checked);
              setPage(1);
            }}
          />
          Show deleted
        </label>
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
        <AdminTableSkeleton rows={8} cols={7} />
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-neutral-500 dark:text-neutral-400">
          No products found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="w-12 px-3 py-3" />
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Price
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Stock
                </th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={`bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 ${p.isDeleted ? "opacity-50" : ""}`}
                >
                  <td className="px-3 py-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                          –
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">
                    <Link
                      href={`/products/${p.id}`}
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.title}
                    </Link>
                    {p.brand && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {p.brand}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatMoney(p.price)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={
                        p.stock === 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-neutral-700 dark:text-neutral-300"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.isDeleted ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                        Deleted
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        Edit
                      </button>
                      {p.isDeleted ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(p)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmTarget({ product: p, mode: "soft" })
                          }
                          className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmTarget({ product: p, mode: "permanent" })
                        }
                        className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Confirm delete dialog */}
      {confirmTarget && (
        <ConfirmDialog
          message={
            confirmTarget.mode === "permanent"
              ? `Permanently delete "${confirmTarget.product.title}"? This cannot be undone.`
              : `Archive "${confirmTarget.product.title}"? It will be hidden from the storefront.`
          }
          onConfirm={confirmDelete}
          onCancel={() => setConfirmTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
