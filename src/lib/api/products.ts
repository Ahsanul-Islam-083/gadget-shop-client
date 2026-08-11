import { api } from "./client";
import type { Paginated, Product, ProductInput, ProductListParams } from "@/types/api";

export function listProducts(
  params: ProductListParams = {},
  signal?: AbortSignal,
): Promise<Paginated<Product>> {
  return api.get<Paginated<Product>>("/products", params as unknown as Record<string, unknown>, signal);
}

export function fetchProduct(id: string): Promise<Product> {
  return api.get<Product>(`/products/${id}`);
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