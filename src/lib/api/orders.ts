import { api } from "./client";
import type { Order, OrderStatus, OrdersAnalytics, Paginated, PaymentStatus } from "@/types/api";

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export function createOrder(): Promise<Order> {
  return api.post<Order>("/orders");
}

export function listOrders(params: OrderListParams = {}, signal?: AbortSignal): Promise<Paginated<Order>> {
  return api.list<Order>("/orders", params as unknown as Record<string, unknown>, signal);
}

export function fetchOrder(id: string): Promise<Order> {
  return api.get<Order>(`/orders/${id}`);
}

export function fetchOrdersAnalytics(limit = 5): Promise<OrdersAnalytics> {
  return api.get<OrdersAnalytics>("/orders/analytics", { limit });
}

export interface OrderUpdateInput {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export function updateOrder(id: string, input: OrderUpdateInput): Promise<Order> {
  return api.patch<Order>(`/orders/${id}`, input);
}