"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { fetchWishlist, removeWishlistItem } from "@/lib/api/wishlist";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { PageSpinner } from "@/components/ui/spinner";
import { toast } from "@/components/admin/toast";
import type { WishlistItem } from "@/types/api";

export default function WishlistPage() {
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchWishlist()
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(id: string) {
    setPendingId(id);
    try {
      await removeWishlistItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast("Removed from wishlist", "info");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to remove item.", "error");
    } finally {
      setPendingId(null);
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    setPendingId(item.id);
    try {
      await addItem(item.productId);
      setAddedIds((prev) => new Set(prev).add(item.id));
      toast("Added to cart", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add to cart.", "error");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return <PageSpinner />;

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/30 bg-pink-500/10 text-3xl shadow-md">
          ♡
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">
          {"// WISHLIST VAULT: EMPTY"}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900 dark:text-white">
          Your Saved Gear Vault is Empty
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          Save your favorite gadgets and hardware to revisit or purchase later.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            <span>Explore Armory</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">
          {"// SAVED GEAR VAULT"}
        </span>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Wishlist ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:border-pink-500/40 hover:shadow-lg dark:border-slate-800/80 dark:bg-[#0d1117]/80"
          >
            <div className="mb-4 flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-mono text-[10px] text-slate-400">
                    NO IMG
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="block truncate font-heading font-bold text-slate-900 hover:text-cyan-500 dark:text-white dark:hover:text-cyan-400"
                >
                  {item.product.title}
                </Link>
                <p className="mt-1 font-mono text-base font-bold text-cyan-600 dark:text-cyan-400">
                  {formatMoney(item.product.price)}
                </p>
                <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-slate-400">
                  {item.product.stock > 0 ? `In Stock (${item.product.stock})` : "Depleted"}
                </span>
              </div>
            </div>

            <div className="mt-auto flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                disabled={pendingId !== null || item.product.stock <= 0}
                onClick={() => handleAddToCart(item)}
                className="flex-1 rounded-xl bg-cyan-500 px-3 py-2.5 font-heading text-xs font-bold text-black shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-40"
              >
                {addedIds.has(item.id) ? "Added to Cart ✓" : "Add to Cart 🛒"}
              </button>
              <button
                type="button"
                disabled={pendingId !== null}
                onClick={() => handleRemove(item.id)}
                className="rounded-xl border border-slate-300 px-3 py-2.5 font-heading text-xs font-semibold text-slate-600 hover:border-red-500/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
