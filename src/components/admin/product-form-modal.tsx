"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createProduct, updateProduct } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/admin/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { Spinner } from "@/components/ui/spinner";
import type { Category, Product, ProductInput } from "@/types/api";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

export function ProductFormModal({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState<string>(
    product?.price != null ? String(product.price) : ""
  );
  const [stock, setStock] = useState<string>(
    product?.stock != null ? String(product.stock) : "0"
  );
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image ?? null);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCategories({ page: 1, pageSize: 100 })
      .then((res) => {
        if (!cancelled) setCategories(res.data.filter((c) => !c.isDeleted));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setCatLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a non-negative number.");
      return;
    }
    const stockNum = parseInt(stock, 10);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setError("Stock must be a non-negative integer.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const input: ProductInput = {
      title: title.trim(),
      brand: brand.trim() || undefined,
      description: description.trim() || undefined,
      price: priceNum,
      stock: stockNum,
      image: imageUrl ?? undefined,
      categoryId,
    };

    setSubmitting(true);
    try {
      let saved: Product;
      if (isEdit && product) {
        saved = await updateProduct(product.id, input);
        toast("Product updated successfully", "success");
      } else {
        saved = await createProduct(input);
        toast("Product created successfully", "success");
      }
      onSuccess(saved);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to save product.";
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
      aria-label={isEdit ? "Edit product" : "Create product"}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="relative my-8 w-full max-w-2xl rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Product" : "New Product"}
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

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <label htmlFor="pf-title" className="mb-1 block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="pf-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              className={inputClass}
            />
          </div>

          {/* Brand + Category (2-col) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-brand" className="mb-1 block text-sm font-medium">
                Brand
              </label>
              <input
                id="pf-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={submitting}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pf-category" className="mb-1 block text-sm font-medium">
                Category <span className="text-red-500">*</span>
              </label>
              {catLoading ? (
                <div className="flex h-9 items-center">
                  <Spinner />
                </div>
              ) : (
                <select
                  id="pf-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={submitting}
                  className={inputClass}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Price + Stock (2-col) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-price" className="mb-1 block text-sm font-medium">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                id="pf-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={submitting}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pf-stock" className="mb-1 block text-sm font-medium">
                Stock
              </label>
              <input
                id="pf-stock"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={submitting}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="pf-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="pf-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={2000}
              className={inputClass}
            />
          </div>

          {/* Image upload */}
          <div>
            <p className="mb-1 block text-sm font-medium">Image</p>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              disabled={submitting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
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
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
