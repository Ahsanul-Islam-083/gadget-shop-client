"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { createOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/admin/toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, itemCount, status, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = items.filter((item) => item.quantity > item.product.stock);
  const canPlace = items.length > 0 && outOfStock.length === 0;

  async function handlePlaceOrder() {
    if (placing || !canPlace) return;
    setError(null);
    setPlacing(true);
    try {
      const order = await createOrder();
      // Server clears the cart inside the order transaction; reconcile context.
      await clearCart().catch(() => undefined);
      toast("Order placed successfully!", "success");
      router.push(`/orders/${order.id}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      toast(msg, "error");
      setPlacing(false);
    }
  }

  if (status === "loading") {
    return <Spinner className="min-h-[60vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-3xl shadow-md">
          📦
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          {"// CHECKOUT TERMINAL"}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900 dark:text-white">
          Your Cart is Empty
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          Add some products from the armory before initiating checkout.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            <span>Browse Products</span>
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
          {"// FINAL REQUISITION"}
        </span>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Order Confirmation & Checkout
        </h1>
      </div>

      {outOfStock.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-300"
        >
          <p className="font-bold">Some items exceed available stock:</p>
          <ul className="mt-1 list-inside list-disc">
            {outOfStock.map((item) => (
              <li key={item.id}>
                {item.product.title} — requested {item.quantity}, {item.product.stock} in
                stock. Reduce the quantity in your cart.
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}

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
                <div>
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-heading font-bold text-slate-900 hover:text-cyan-500 dark:text-white dark:hover:text-cyan-400"
                  >
                    {item.product.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatMoney(item.product.price)} × {item.quantity}
                  </p>
                  {item.quantity > item.product.stock && (
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Only {item.product.stock} in stock
                    </p>
                  )}
                </div>
                <p className="font-mono text-base font-bold text-slate-900 dark:text-cyan-400">
                  {formatMoney(item.lineTotal)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-[#0d1117]/80">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// CONFIRMATION"}
          </span>
          <h2 className="mt-1 font-heading text-xl font-bold text-slate-900 dark:text-white">
            Order Breakdown
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <dt>Total Units</dt>
              <dd className="font-mono font-semibold text-slate-900 dark:text-white">{itemCount}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <dt>Total Due</dt>
              <dd className="font-mono text-cyan-600 dark:text-cyan-400">{formatMoney(totalAmount)}</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            ℹ Order will be created with status PENDING/UNPAID. Payment is arranged directly upon dispatch verification.
          </p>

          <button
            type="button"
            disabled={placing || !canPlace}
            onClick={handlePlaceOrder}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {placing ? "Placing Requisition…" : "Confirm & Place Order →"}
          </button>
        </aside>
      </div>
    </div>
  );
}