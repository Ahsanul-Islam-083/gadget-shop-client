"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOrdersAnalytics } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { PageSpinner } from "@/components/ui/spinner";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import type { OrderStatus, OrdersAnalytics } from "@/types/api";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_ICONS: Record<OrderStatus, string> = {
  PENDING: "⏳",
  PROCESSING: "🔄",
  SHIPPED: "📦",
  DELIVERED: "✅",
  CANCELLED: "❌",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:border-cyan-500/40 hover:shadow-lg dark:border-slate-800/80 dark:bg-[#0d1117] dark:hover:border-cyan-400/40">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-extrabold text-slate-900 dark:text-cyan-400">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<OrdersAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOrdersAnalytics(10)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load analytics."
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {data && (
        <>
          {/* Revenue overview */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Revenue</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Total Revenue (Paid Orders)"
                value={formatMoney(data.totalRevenue)}
              />
              <StatCard
                label="Total Orders"
                value={Object.values(data.orderCountByStatus).reduce(
                  (s, n) => s + n,
                  0
                )}
              />
              <StatCard
                label="Delivered Orders"
                value={data.orderCountByStatus["DELIVERED"] ?? 0}
              />
            </div>
          </section>

          {/* Order breakdown by status */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Orders by Status</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {ORDER_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {STATUS_ICONS[status]}
                  </span>
                  <OrderStatusBadge status={status} />
                  <p className="text-2xl font-bold">
                    {data.orderCountByStatus[status] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Top selling products */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Top Selling Products
            </h2>
            {data.topSellingProducts.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No order data yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                      <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                        Units Sold
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {data.topSellingProducts.map((p, i) => (
                      <tr
                        key={p.productId}
                        className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                      >
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          #{i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <Link
                            href={`/products/${p.productId}`}
                            className="hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                          {p.brand ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {p.totalQuantitySold}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
