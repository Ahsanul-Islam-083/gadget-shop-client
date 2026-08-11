import { api } from "./client";
import type { Category, ListParams, Paginated } from "@/types/api";

export interface CategoryInput {
  name: string;
}

export function listCategories(params: ListParams = {}, signal?: AbortSignal): Promise<Paginated<Category>> {
  return api.list<Category>("/categories", params as unknown as Record<string, unknown>, signal);
}

export function fetchCategory(id: string): Promise<Category> {
  return api.get<Category>(`/categories/${id}`);
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return api.post<Category>("/categories", input);
}

export function updateCategory(id: string, input: Partial<CategoryInput> & { isDeleted?: boolean }): Promise<Category> {
  return api.patch<Category>(`/categories/${id}`, input);
}

export function deleteCategory(id: string, permanent = false): Promise<{ id: string; message: string }> {
  return api.delete<{ id: string; message: string }>(`/categories/${id}`, { permanent });
}