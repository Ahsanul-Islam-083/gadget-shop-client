import { api } from "./client";
import type { WishlistAddResult, WishlistItem, WishlistToggleResult } from "@/types/api";

export interface WishlistPayload {
  items: WishlistItem[];
}

export function fetchWishlist(): Promise<WishlistPayload> {
  return api.get<WishlistPayload>("/wishlist");
}

export function toggleWishlist(productId: string): Promise<WishlistToggleResult> {
  return api.post<WishlistToggleResult>("/wishlist/toggle", { productId });
}

export function addWishlistItem(productId: string): Promise<WishlistAddResult> {
  return api.post<WishlistAddResult>("/wishlist", { productId });
}

export function removeWishlistItem(id: string): Promise<{ id: string; message: string }> {
  return api.delete<{ id: string; message: string }>(`/wishlist/${id}`);
}