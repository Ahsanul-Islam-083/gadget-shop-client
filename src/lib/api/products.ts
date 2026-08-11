import { api } from "./client";
import type { Paginated, Product, ProductInput, ProductListParams, Review } from "@/types/api";

export function listProducts(
  params: ProductListParams = {},
  signal?: AbortSignal,
): Promise<Paginated<Product>> {
  return api.list<Product>("/products", params as unknown as Record<string, unknown>, signal);
}

export function fetchProductReviews(
  productId: string,
  params: { page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
): Promise<Paginated<Review>> {
  return api.list<Review>(
    `/products/${productId}/reviews`,
    params as unknown as Record<string, unknown>,
    signal,
  );
}

export function fetchProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return api.get<Product>(`/products/${id}`, undefined, signal);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return api.post<Product>("/products", input);
}

export function updateProduct(id: string, input: Partial<ProductInput> & { isDeleted?: boolean }): Promise<Product> {
  return api.patch<Product>(`/products/${id}`, input);
}

export function deleteProduct(id: string, permanent = false): Promise<{ id: string; message: string }> {
  return api.delete<{ id: string; message: string }>(`/products/${id}`, { permanent });
}