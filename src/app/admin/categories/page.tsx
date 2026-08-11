"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/admin/toast";
import { Pagination } from "@/components/ui/pagination";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import type { Category, Pagination as PaginationType } from "@/types/api";

const PAGE_SIZE = 20;

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

function CategoryFormModal({
  category,
  onSuccess,
  onCancel,
}: {
  category?: Category | null;
  onSuccess: (cat: Category) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSubmitting(true);
    try {
      let saved: Category;
      if (isEdit && category) {
        saved = await updateCategory(category.id, { name: name.trim() });
        toast("Category updated", "success");
      } else {
        saved = await createCategory({ name: name.trim() });
        toast("Category created", "success");
      }
      onSuccess(saved);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to save category.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-base font-semibold">
            {isEdit ? "Edit Category" : "New Category"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="text-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="cf-name"
              className="mb-1 block text-sm font-medium"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              autoFocus
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              {submitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DeleteMode = "soft" | "permanent";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{
    category: Category;
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
    listCategories({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      includeDeleted,
    })
      .then((res) => {
        if (cancelled) return;
        setCategories(res.data);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load categories."
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, includeDeleted]);

  function handleFormSuccess(saved: Category) {
    setShowForm(false);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  async function handleRestore(cat: Category) {
    try {
      const updated = await updateCategory(cat.id, { isDeleted: false });
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      toast("Category restored", "success");
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
      await deleteCategory(
        confirmTarget.category.id,
        confirmTarget.mode === "permanent"
      );
      if (confirmTarget.mode === "permanent") {
        setCategories((prev) =>
          prev.filter((c) => c.id !== confirmTarget.category.id)
        );
        toast("Category permanently deleted", "success");
      } else {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === confirmTarget.category.id
              ? { ...c, isDeleted: true }
              : c
          )
        );
        toast("Category archived", "success");
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
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          {pagination && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {pagination.total} categor{pagination.total !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditCategory(null);
            setShowForm(true);
          }}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          + New category
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search categories…"
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
          Show archived
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
        <AdminTableSkeleton rows={8} cols={4} />
      ) : categories.length === 0 ? (
        <p className="py-16 text-center text-neutral-500 dark:text-neutral-400">
          No categories found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Name
                </th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Created
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className={`bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 ${cat.isDeleted ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-center">
                    {cat.isDeleted ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                        Archived
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                    {formatDate(cat.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditCategory(cat);
                          setShowForm(true);
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        Edit
                      </button>
                      {cat.isDeleted ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(cat)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmTarget({ category: cat, mode: "soft" })
                          }
                          className="rounded-md px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmTarget({ category: cat, mode: "permanent" })
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

      {showForm && (
        <CategoryFormModal
          category={editCategory}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {confirmTarget && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <p className="mb-5 text-sm">
              {confirmTarget.mode === "permanent"
                ? `Permanently delete category "${confirmTarget.category.name}"? This will fail if products reference it.`
                : `Archive category "${confirmTarget.category.name}"?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={deleting}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
