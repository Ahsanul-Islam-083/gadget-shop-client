"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrders } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "@/components/admin/toast";
import { Pagination } from "@/components/ui/pagination";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badge";
import type { Order, Pagination as PaginationType } from "@/types/api";

const PAGE_SIZE = 15;

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryKey = `${page}:${includeDeleted}`;
  const [loadedKey, setLoadedKey] = useState(queryKey);
  if (loadedKey !== queryKey) {
    setLoadedKey(queryKey);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    listOrders({ page, pageSize: PAGE_SIZE, includeDeleted })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
        setPagination(res.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          err instanceof ApiError ? err.message : "Failed to load orders.";
        setError(msg);
        toast(msg, "error");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, includeDeleted]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Orders</h1>
          {pagination && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {pagination.total} order{pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
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
      ) : orders.length === 0 ? (
        <p className="py-16 text-center text-neutral-500 dark:text-neutral-400">
          No orders found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Items
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Total
                </th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                  Order Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                  Payment
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 ${order.isDeleted ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 font-mono font-medium">
                    #{shortId(order.id)}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {order.orderItems.length}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatMoney(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      Manage →
                    </Link>
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
    </div>
  );
}
