"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/* ─── Nav items ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const SIDEBAR_KEY = "admin-sidebar-open";

/* ─── Chevron icon ───────────────────────────────────────────── */
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"}`}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function AdminSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(open));
  }, [open]);

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* Sidebar */}
      <aside
        aria-label="Admin navigation"
        className={`
          group relative flex flex-shrink-0 flex-col
          border-r border-neutral-200 bg-white
          dark:border-neutral-800 dark:bg-neutral-950
          transition-all duration-300 ease-in-out
          ${open ? "w-56" : "w-[60px]"}
        `}
      >
        {/* Logo / brand strip */}
        <div
          className={`flex h-14 items-center border-b border-slate-200 dark:border-slate-800 ${open ? "px-4 gap-2.5" : "justify-center"}`}
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 text-xs font-extrabold text-black shadow-sm">
            GS
          </span>
          {open && (
            <span className="overflow-hidden text-sm font-bold font-heading text-slate-900 dark:text-white whitespace-nowrap">
              Admin Armory
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!open ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={`
                  flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium
                  transition-all duration-150
                  ${active
                    ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20 dark:bg-cyan-400 dark:text-black"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
                  }
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {open && (
                  <span className="overflow-hidden whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button — pinned to bottom */}
        <div className="border-t border-neutral-200 px-2 py-3 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
            className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white ${open ? "" : "justify-center"}`}
          >
            <ChevronIcon open={open} />
            {open && <span className="whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
