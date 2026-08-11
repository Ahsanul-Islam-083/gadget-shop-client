"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { PageSpinner } from "@/components/ui/spinner";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badge";
import type { Order } from "@/types/api";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    fetchOrder(id)
      .then((o) => {
        if (controller.signal.aborted) return;
        setOrder(o);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Failed to load the order.");
        setLoading(false);
      })
      .finally(() => clearTimeout(timer));
    return () => controller.abort();
  }, [id]);

  if (loading) return <PageSpinner />;

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center">
        <h1 className="mb-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">Order Not Found</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {error ?? "This order does not exist or is no longer available."}
        </p>
        <Link
          href="/orders"
          className="rounded-xl bg-cyan-500 px-6 py-3 font-heading text-sm font-bold text-black shadow-md shadow-cyan-500/25 hover:bg-cyan-400"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const history = order.statusHistory ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <p className="mb-4 text-xs font-bold text-cyan-600 dark:text-cyan-400">
        <Link href="/orders" className="hover:underline">
          ← Back to Order History
        </Link>
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <p className="mb-6 font-mono text-xs text-slate-500 dark:text-slate-400">
        Placed on {formatDateTime(order.createdAt)}
      </p>

      {order.paymentStatus === "UNPAID" && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 font-mono text-xs text-amber-700 dark:text-amber-300">
          ℹ Payment status: UNPAID. Dispatches are verified upon arrangement by the shop.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Items list */}
        <section className="lg:col-span-7">
          <h2 className="mb-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
            Purchased Hardware Units
          </h2>
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur dark:divide-slate-800 dark:border-slate-800/80 dark:bg-[#0d1117]/70">
            {order.orderItems.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 p-4">
                <Link
                  href={`/products/${item.productId}`}
                  className="flex-1 font-heading font-bold text-slate-900 hover:text-cyan-500 dark:text-white dark:hover:text-cyan-400"
                >
                  {item.product.title}
                </Link>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {item.quantity} × {formatMoney(item.price)}
                </span>
                <span className="w-24 text-right font-mono font-bold text-slate-900 dark:text-cyan-400">
                  {formatMoney(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-end gap-8 border-t border-slate-200 pt-4 text-base dark:border-slate-800">
            <span className="font-heading font-bold text-slate-900 dark:text-white">Total Amount</span>
            <span className="w-28 text-right font-mono text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
              {formatMoney(order.totalAmount)}
            </span>
          </p>
        </section>

        {/* Timeline history */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-[#0d1117]/80">
            <h2 className="mb-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Telemetry Status Timeline
            </h2>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500">No status changes recorded yet.</p>
            ) : (
              <ol className="relative border-l border-slate-200 pl-6 dark:border-slate-800 space-y-6">
                {history.map((entry, index) => (
                  <li key={entry.id} className="relative">
                    <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-cyan-500 bg-black shadow-sm shadow-cyan-500/50" />
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={entry.status} />
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(entry.changedAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {index === 0
                        ? "Requisition initiated"
                        : `Status modified by ${entry.user?.name ?? "Admin"}`}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}