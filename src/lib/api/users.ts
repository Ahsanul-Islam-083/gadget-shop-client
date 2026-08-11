import { api } from "./client";
import type { Paginated, User, UserRole } from "@/types/api";

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  includeDeleted?: boolean;
}

export function listUsers(
  params: ListUsersParams = {},
  signal?: AbortSignal
): Promise<Paginated<User>> {
  return api.list<User>(
    "/users",
    params as unknown as Record<string, unknown>,
    signal
  );
}

export function getUser(id: string, signal?: AbortSignal): Promise<User> {
  return api.get<User>(`/users/${id}`, { signal });
}

export function updateUser(
  id: string,
  data: {
    name?: string;
    role?: UserRole;
    isDeleted?: boolean;
    image?: string | null;
  }
): Promise<User> {
  return api.patch<User>(`/users/${id}`, data);
}

export function deleteUser(
  id: string,
  permanent = false
): Promise<{ id: string; message: string }> {
  const qs = permanent ? "?permanent=true" : "";
  return api.delete<{ id: string; message: string }>(`/users/${id}${qs}`);
}
