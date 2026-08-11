"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { formatDate } from "@/lib/format";
import { PageSpinner } from "@/components/ui/spinner";
import { PasswordInput } from "@/components/ui/password-input";
import { ImageUpload } from "@/components/admin/image-upload";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toast } from "@/components/admin/toast";
import { ApiError } from "@/lib/api/client";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-800 dark:bg-[#0d1117] dark:text-slate-100 dark:focus:border-cyan-400";
const labelClass =
  "block font-heading text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5";

export default function AccountPage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(user?.image ?? null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return <PageSpinner />;

  const isAdmin = user.role === "ADMIN";

  function startEditing() {
    setName(user?.name ?? "");
    setImageUrl(user?.image ?? null);
    setCurrentPassword("");
    setNewPassword("");
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setName(user?.name ?? "");
    setImageUrl(user?.image ?? null);
    setCurrentPassword("");
    setNewPassword("");
    setError(null);
    setIsEditing(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const hasNameChange = name.trim() !== user!.name;
    const hasImageChange = (imageUrl ?? null) !== (user!.image ?? null);
    const hasPasswordChange = Boolean(newPassword);

    if (!hasNameChange && !hasImageChange && !hasPasswordChange) {
      toast("No changes detected", "info");
      setIsEditing(false);
      return;
    }

    if (hasPasswordChange && !currentPassword) {
      setError("Current access key is required to update security credentials.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: hasNameChange ? name.trim() : undefined,
        image: hasImageChange ? imageUrl : undefined,
        password: hasPasswordChange ? newPassword : undefined,
        currentPassword: hasPasswordChange ? currentPassword : undefined,
      });

      setCurrentPassword("");
      setNewPassword("");
      setIsEditing(false);
      toast("Agent credentials updated successfully!", "success");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to update profile.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      {/* Top HUD Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// AGENT CLEARANCE TERMINAL"}
          </span>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">
            Agent Profile
          </h1>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 font-heading text-xs font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400"
          >
            <span>Edit Credentials</span>
            <span>✎</span>
          </button>
        )}
      </div>

      {/* Cyber Passport Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-slate-800/80 dark:bg-[#0d1117]/80">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar with Glow Ring */}
          <div className="relative">
            <UserAvatar image={user.image} name={user.name} size="xl" />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0d1117]" />
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <span
                className={`rounded-full px-3 py-0.5 font-mono text-xs font-bold ${
                  isAdmin
                    ? "border border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "border border-cyan-500/40 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                }`}
              >
                {user.role}
              </span>
            </div>

            <p className="mt-1 font-mono text-sm text-slate-600 dark:text-slate-400">
              {user.email}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 sm:justify-start dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>🗓</span>
                <span>Enlisted {formatDate(user.createdAt)}</span>
              </span>
              <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span>🛡</span>
                <span>Security Protocol Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Nav Shortcut Bar */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-6 sm:grid-cols-3 dark:border-slate-800/80">
          <Link
            href="/orders"
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 dark:border-slate-800/80 dark:bg-[#161b22]/70"
          >
            <span className="text-xl">📦</span>
            <span className="mt-2 font-heading text-sm font-bold text-slate-900 dark:text-white">
              Order Logs
            </span>
            <span className="text-[11px] text-slate-500">Track shipments</span>
          </Link>

          <Link
            href="/wishlist"
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:border-pink-500/40 hover:bg-pink-500/10 dark:border-slate-800/80 dark:bg-[#161b22]/70"
          >
            <span className="text-xl">♡</span>
            <span className="mt-2 font-heading text-sm font-bold text-slate-900 dark:text-white">
              Wishlist Vault
            </span>
            <span className="text-[11px] text-slate-500">Saved gadgets</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="col-span-2 flex flex-col rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 transition hover:border-amber-500/50 sm:col-span-1"
            >
              <span className="text-xl">⚡</span>
              <span className="mt-2 font-heading text-sm font-bold text-amber-600 dark:text-amber-400">
                Admin Command
              </span>
              <span className="text-[11px] text-slate-500">Manage hardware</span>
            </Link>
          )}
        </div>
      </div>

      {/* Edit Form Panel */}
      {isEditing && (
        <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-cyan-500/20 dark:bg-[#0d1117]/90">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                {"// EDIT PROTOCOL"}
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Modify Agent Profile
              </h2>
            </div>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ✕ Cancel
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className={labelClass}>Agent Avatar (Upload to ImgBB)</label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                disabled={saving}
              />
            </div>

            {/* Agent Name */}
            <div>
              <label htmlFor="name" className={labelClass}>
                Agent Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className={inputClass}
              />
            </div>

            {/* Read-only Credentials */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Email Terminal (Read Only)</label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user.email}
                  className={`${inputClass} bg-slate-100 cursor-not-allowed dark:bg-slate-900`}
                />
              </div>

              <div>
                <label className={labelClass}>Security Role (Read Only)</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={user.role}
                  className={`${inputClass} bg-slate-100 cursor-not-allowed dark:bg-slate-900`}
                />
              </div>
            </div>

            {/* Password Update Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {"// SECURITY KEY ROTATION (OPTIONAL)"}
              </span>
              <div className="mt-3 space-y-4">
                <div>
                  <label htmlFor="currentPassword" className={labelClass}>
                    Current Access Key
                  </label>
                  <PasswordInput
                    id="currentPassword"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className={labelClass}>
                    New Access Key
                  </label>
                  <PasswordInput
                    id="newPassword"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-3 font-heading text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-heading text-xs font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? "Transmitting Updates…" : "Save Credentials"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}