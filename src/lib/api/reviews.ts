import { api } from "./client";
import type { Paginated, Review } from "@/types/api";

export interface ReviewInput {
  productId: string;
  rating: number;
  comment?: string | null;
}

export interface ReviewListParams {
  productId?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export function listReviews(params: ReviewListParams = {}, signal?: AbortSignal): Promise<Paginated<Review>> {
  return api.get<Paginated<Review>>("/reviews", params as unknown as Record<string, unknown>, signal);
}

export function createReview(input: ReviewInput): Promise<Review> {
  return api.post<Review>("/reviews", input);
}

export function updateReview(id: string, input: Partial<ReviewInput> & { isDeleted?: boolean }): Promise<Review> {
  return api.patch<Review>(`/reviews/${id}`, input);
}

export function deleteReview(id: string, permanent = false): Promise<{ id: string; message: string }> {
  return api.delete<{ id: string; message: string }>(`/reviews/${id}`, { permanent });
}