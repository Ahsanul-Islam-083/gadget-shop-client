"use client";

import { useEffect, useRef, useState } from "react";
import { listUsers, updateUser, deleteUser } from "@/lib/api/users";
import { useAuth } from "@/context/auth-context";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/admin/toast";
import { Pagination } from "@/components/ui/pagination";
import { AdminTableSkeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Pagination as PaginationType, User, UserRole } from "@/types/api";

const PAGE_SIZE = 15;

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <p className="mb-5 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<{
    user: User;
    action: "delete" | "restore";
  } | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [rolePendingId, setRolePendingId] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, 400);
  }

  const queryKey = `${page}:${debouncedSearch}:${includeDeleted}`;
  const [loadedKey, setLoadedKey] = useState(queryKey);
  if (loadedKey !== queryKey) {
    setLoadedKey(queryKey);
    setLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    listUsers({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      includeDeleted,
    })
      .then((res) => {
        if (cancelled) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
        setPagination(res.pagination ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setUsers([]);
        setPagination(null);
        const msg = err instanceof ApiError ? err.message : "Failed to load users.";
        setError(msg);
        toast(msg, "error");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, includeDeleted]);

  async function handleRoleChange(user: User, newRole: UserRole) {
    if (user.role === newRole) return;
    if (user.id === currentUser?.id && newRole !== "ADMIN") {
      toast("You cannot remove your own admin role", "error");
      return;
    }

    setRolePendingId(user.id);
    try {
      const updated = await updateUser(user.id, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
      );
      toast(`Role updated to ${newRole} for ${user.name}`, "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to update role.",
        "error"
      );
    } finally {
      setRolePendingId(null);
    }
  }

  async function confirmAction() {
    if (!confirmTarget) return;
    setActionPending(true);
    const { user, action } = confirmTarget;

    try {
      if (action === "delete") {
        if (user.id === currentUser?.id) {
          toast("You cannot delete your own account", "error");
          setConfirmTarget(null);
          setActionPending(false);
          return;
        }

        await deleteUser(user.id, false);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isDeleted: true } : u))
        );
        toast(`User ${user.name} marked as deleted`, "success");
      } else {
        const updated = await updateUser(user.id, { isDeleted: false });
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, isDeleted: false } : u))
        );
        toast(`User ${user.name} restored`, "success");
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Action failed.",
        "error"
      );
    } finally {
      setActionPending(false);
      setConfirmTarget(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          {pagination && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {pagination.total} user{pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => {
              setIncludeDeleted(e.target.checked);
              setPage(1);
            }}
          />
          Show deleted
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {loading ? (
        <AdminTableSkeleton rows={8} cols={6} />
      ) : users.length === 0 ? (
        <p className="py-16 text-center text-neutral-500 dark:text-neutral-400">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="w-12 px-3 py-3" />
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  User
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Email
                </th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                  Role
                </th>
                <th className="px-4 py-3 text-center font-semibold text-neutral-600 dark:text-neutral-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-right font-semibold text-neutral-600 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr
                    key={u.id}
                    className={`bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 ${u.isDeleted ? "opacity-50" : ""}`}
                  >
                    {/* Avatar */}
                    <td className="px-3 py-2">
                      <UserAvatar image={u.image} name={u.name} size="md" />
                    </td>

                    {/* Name */}
                    <td className="px-4 py-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {isSelf && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">
                      {u.email}
                    </td>

                    {/* Role dropdown/toggle */}
                    <td className="px-4 py-2 text-center">
                      <select
                        value={u.role}
                        disabled={rolePendingId === u.id || u.isDeleted}
                        onChange={(e) =>
                          handleRoleChange(u, e.target.value as UserRole)
                        }
                        className={`rounded-md border px-2 py-1 text-xs font-medium outline-none transition disabled:opacity-50 ${
                          u.role === "ADMIN"
                            ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                            : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                        }`}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2 text-center">
                      {u.isDeleted ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                          Deleted
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-2 text-neutral-500 dark:text-neutral-400">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2 text-right">
                      {isSelf ? (
                        <span className="text-xs text-neutral-400">—</span>
                      ) : u.isDeleted ? (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmTarget({ user: u, action: "restore" })
                          }
                          className="rounded-md px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmTarget({ user: u, action: "delete" })
                          }
                          className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Confirm dialog */}
      {confirmTarget && (
        <ConfirmDialog
          message={
            confirmTarget.action === "delete"
              ? `Mark user "${confirmTarget.user.name}" as deleted?`
              : `Restore user "${confirmTarget.user.name}"?`
          }
          onConfirm={confirmAction}
          onCancel={() => setConfirmTarget(null)}
          loading={actionPending}
        />
      )}
    </div>
  );
}
