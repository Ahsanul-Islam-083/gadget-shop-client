"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/admin/toast";

export default function CartPage() {
  const { items, totalAmount, itemCount, status, updateQty, removeItem, clearCart } = useCart();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(action: () => Promise<void>, id: string | null = null) {
    setPendingId(id);
    try {
      await action();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
    } finally {
      setPendingId(null);
    }
  }

  if (status === "loading") {
    return <Spinner className="min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-3xl shadow-md">
          🛒
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          {"// CART STATUS: EMPTY"}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900 dark:text-white">
          Your Armory Cart is Empty
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          Looks like you haven&apos;t loaded any gear into your requisition queue yet.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            <span>Explore Armory Products</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          {"// REQUISITION QUEUE"}
        </span>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur dark:divide-slate-800 dark:border-slate-800/80 dark:bg-[#0d1117]/70">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4 first:pt-2 last:pb-2">
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

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      GEAR UNIT
                    </span>
                    <Link
                      href={`/products/${item.product.id}`}
                      className="line-clamp-1 font-heading font-bold text-slate-900 hover:text-cyan-500 dark:text-white dark:hover:text-cyan-400"
                    >
                      {item.product.title}
                    </Link>
                  </div>
                  <p className="font-mono text-base font-bold text-slate-900 dark:text-cyan-400">
                    {formatMoney(item.lineTotal)}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.product.title}`}
                      disabled={pendingId !== null || item.quantity <= 1}
                      onClick={() => run(() => updateQty(item.id, item.quantity - 1), item.id)}
                      className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center font-mono text-sm font-bold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.product.title}`}
                      disabled={pendingId !== null || item.quantity >= item.product.stock}
                      onClick={() => run(() => updateQty(item.id, item.quantity + 1), item.id)}
                      className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={pendingId !== null}
                    onClick={() => run(() => removeItem(item.id), item.id)}
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-[#0d1117]/80">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// SUMMARY"}
          </span>
          <h2 className="mt-1 font-heading text-xl font-bold text-slate-900 dark:text-white">
            Order Summary
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <dt>Total Units</dt>
              <dd className="font-mono font-semibold text-slate-900 dark:text-white">{itemCount}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <dt>Total Price</dt>
              <dd className="font-mono text-cyan-600 dark:text-cyan-400">{formatMoney(totalAmount)}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
            >
              <span>Proceed to Checkout</span>
              <span>→</span>
            </Link>

            <button
              type="button"
              disabled={pendingId !== null}
              onClick={() => run(() => clearCart())}
              className="w-full rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Clear Cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
