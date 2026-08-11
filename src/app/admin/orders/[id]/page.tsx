"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchOrder, updateOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { toast } from "@/components/admin/toast";
import { PageSpinner } from "@/components/ui/spinner";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badge";
import type { Order, OrderStatus, PaymentStatus } from "@/types/api";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "REFUNDED"];

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function StatusSelect<T extends string>({
  id,
  label,
  current,
  options,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  current: T;
  options: T[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
      >
        {label}
      </label>
      <select
        id={id}
        value={current}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingStatus, setPendingStatus] = useState<OrderStatus>("PENDING");
  const [pendingPayment, setPendingPayment] = useState<PaymentStatus>("UNPAID");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchOrder(id)
      .then((o) => {
        if (cancelled) return;
        setOrder(o);
        setPendingStatus(o.status);
        setPendingPayment(o.paymentStatus);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load order."
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave() {
    if (!order) return;
    if (pendingStatus === order.status && pendingPayment === order.paymentStatus) {
      toast("No changes to save", "info");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateOrder(id, {
        status: pendingStatus !== order.status ? pendingStatus : undefined,
        paymentStatus:
          pendingPayment !== order.paymentStatus ? pendingPayment : undefined,
      });
      setOrder(updated);
      setPendingStatus(updated.status);
      setPendingPayment(updated.paymentStatus);
      toast("Order updated successfully", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to update order.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageSpinner />;

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Order not found</h1>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          {error ?? "This order does not exist."}
        </p>
        <Link
          href="/admin/orders"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          ← Back to orders
        </Link>
      </div>
    );
  }

  const history = order.statusHistory ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      {/* Breadcrumb */}
      <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/admin/orders" className="hover:underline">
          ← All Orders
        </Link>
      </p>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Order #{shortId(order.id)}</h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">{order.id}</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Status update panel */}
      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-4 text-base font-semibold">Update Status</h2>
        <div className="flex flex-wrap items-end gap-4">
          <StatusSelect<OrderStatus>
            id="order-status"
            label="Order Status"
            current={pendingStatus}
            options={ORDER_STATUSES}
            onChange={setPendingStatus}
            disabled={saving}
          />
          <StatusSelect<PaymentStatus>
            id="payment-status"
            label="Payment Status"
            current={pendingPayment}
            options={PAYMENT_STATUSES}
            onChange={setPendingPayment}
            disabled={saving}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
          Only changed values will be sent. Status changes are appended to the audit trail below.
        </p>
      </section>

      {/* Order items */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold">Items</h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Product
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Qty
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {order.orderItems.map((item) => (
                <tr
                  key={item.id}
                  className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/products/${item.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.product.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500 dark:text-neutral-400">
                    {formatMoney(item.price)}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatMoney(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 dark:border-neutral-800">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right font-semibold"
                >
                  Order Total
                </td>
                <td className="px-4 py-3 text-right text-base font-bold">
                  {formatMoney(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Status history timeline */}
      <section>
        <h2 className="mb-4 text-base font-semibold">Status History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No history yet.
          </p>
        ) : (
          <ol className="relative border-l border-neutral-200 pl-6 dark:border-neutral-800">
            {history.map((entry, i) => (
              <li key={entry.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border-2 border-neutral-900 bg-white dark:border-neutral-100 dark:bg-neutral-950" />
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={entry.status} />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatDateTime(entry.changedAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  {i === 0
                    ? "Order created by customer"
                    : `Changed by ${entry.user?.name ?? "Admin"}`}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
