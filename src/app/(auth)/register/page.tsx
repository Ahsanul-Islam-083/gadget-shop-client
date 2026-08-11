"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useGuestOnly } from "@/components/auth/use-guest-only";
import { ApiError } from "@/lib/api/client";
import { PageSpinner } from "@/components/ui/spinner";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleSignInLink } from "@/components/auth/google-sign-in";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-800 dark:bg-[#0d1117] dark:text-slate-100 dark:focus:border-cyan-400";
const labelClass = "block font-heading text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20 pt-12">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0d1117]/90 dark:shadow-cyan-950/20">
        <div className="mb-6 text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// NEW AGENT INITIALIZATION"}
          </span>
          <h1 className="mt-1 font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Join the Gadget Shop network for exclusive drops and orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-300"
            >
              {error}
            </p>
          )}
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Agent Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>
              Email Terminal
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>
              Access Key (Password)
            </label>
            <PasswordInput
              id="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400 hover:shadow-cyan-400/40 disabled:opacity-60"
          >
            {pending ? "Creating Terminal Access…" : "Initialize Account"}
          </button>
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <GoogleSignInLink />
        </form>
        <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-cyan-600 hover:underline dark:text-cyan-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const status = useGuestOnly();
  if (status !== "anon") return <PageSpinner />;
  return (
    <Suspense fallback={<PageSpinner />}>
      <RegisterForm />
    </Suspense>
  );
}