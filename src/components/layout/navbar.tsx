"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
];

export function Navbar() {
  const { status, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (href: string) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive(href)
        ? "text-neutral-900 dark:text-white"
        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link href="/" className="mr-4 text-lg font-bold tracking-tight">
          Gadget Shop
        </Link>
        <div className="flex items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {status === "authed" ? (
            <>
              {user?.role === "ADMIN" && (
                <Link href="/admin" className={linkClass("/admin")}>
                  Admin
                </Link>
              )}
              <Link href="/account" className={linkClass("/account")} title={user?.email}>
                {user?.name ?? "Account"}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={linkClass("/login")}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}