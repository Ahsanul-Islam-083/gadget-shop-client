import { api } from "./client";
import type { Cart, CartItem } from "@/types/api";

export function fetchCart(): Promise<Cart> {
  return api.get<Cart>("/cart-items");
}

export function addCartItem(productId: string, quantity = 1): Promise<CartItem> {
  return api.post<CartItem>("/cart-items", { productId, quantity });
}

export function updateCartItem(id: string, quantity: number): Promise<CartItem> {
  return api.patch<CartItem>(`/cart-items/${id}`, { quantity });
}

export function removeCartItem(id: string): Promise<{ id: string; message: string }> {
  return api.delete<{ id: string; message: string }>(`/cart-items/${id}`);
}

export function clearCart(): Promise<{ message: string; deletedCount: number }> {
  return api.delete<{ message: string; deletedCount: number }>("/cart-items/clear");
}