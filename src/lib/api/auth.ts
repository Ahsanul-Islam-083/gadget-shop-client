import { api } from "./client";
import type { AuthResponse, User } from "@/types/api";

export function login(email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", { email, password });
}

export function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", { name, email, password });
}

export function fetchMe(): Promise<User> {
  return api.get<User>("/auth/me");
}