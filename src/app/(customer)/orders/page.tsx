"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatDate, formatMoney } from "@/lib/format";
import { Pagination } from "@/components/ui/pagination";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badge";
import { OrderListSkeleton } from "@/components/ui/skeleton";
import type { Order, Pagination as PaginationType } from "@/types/api";

const PAGE_SIZE = 10;

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    listOrders({ page, pageSize: PAGE_SIZE }, controller.signal)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setOrders([]);
        setPagination(null);
        setError(err instanceof ApiError ? err.message : "Failed to load your orders.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// REQUISITION LOGS"}
          </span>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
            Order History
          </h1>
        </div>
        <OrderListSkeleton count={5} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-3xl shadow-md">
          📦
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          {"// LOGS: NO RECORDS"}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold text-slate-900 dark:text-white">
          No Orders Placed Yet
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          Your requisition orders and dispatch telemetry will appear here once placed.
        </p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            <span>Browse Armory Products</span>
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
          {"// REQUISITION LOGS"}
        </span>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
          Order History ({pagination?.total ?? orders.length})
        </h1>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-300"
        >
          {error}
        </p>
      )}

      <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm backdrop-blur dark:divide-slate-800 dark:border-slate-800/80 dark:bg-[#0d1117]/70">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/60"
            >
              <div className="min-w-36">
                <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  #{shortId(order.id)}
                </p>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {order.orderItems.length} {order.orderItems.length === 1 ? "unit" : "units"}
              </span>

              <div className="ml-auto flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
                <span className="ml-3 font-mono text-base font-bold text-slate-900 dark:text-cyan-400">
                  {formatMoney(order.totalAmount)}
                </span>
                <span className="text-slate-400">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}