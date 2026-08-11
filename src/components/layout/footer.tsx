"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  armory: [
    { label: "Hardware Catalog", href: "/products" },
    { label: "Flash Drops & Deals", href: "/#deals" },
    { label: "Requisition Cart", href: "/cart" },
    { label: "Wishlist Vault", href: "/wishlist" },
    { label: "Order Logs", href: "/orders" },
  ],
  support: [
    { label: "About Us & FAQs", href: "/about" },
    { label: "Contact Comms", href: "/contact" },
    { label: "Terms & Privacy Policy", href: "/terms" },
    { label: "Agent Profile", href: "/account" },
  ],
  socials: [
    { label: "Discord Matrix", href: "https://discord.com", icon: "💬" },
    { label: "X / Twitter", href: "https://twitter.com", icon: "🐦" },
    { label: "GitHub Source", href: "https://github.com", icon: "🐙" },
    { label: "YouTube Transmissions", href: "https://youtube.com", icon: "📺" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-xl transition-colors dark:border-slate-800/80 dark:bg-[#07090e]/90">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand & Description */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 text-xs font-extrabold text-black shadow-md shadow-cyan-500/20">
                GS
              </span>
              <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Gadget<span className="text-cyan-500 dark:text-cyan-400">Shop</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              The premier cyber armory for next-gen hardware, robotic tech, audio gear, and flagship accessories. Engineered for extreme performance and supreme aesthetics.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DISPATCH HUB ONLINE // 99.9% UPTIME</span>
            </div>
          </div>

          {/* Armory Navigation */}
          <div className="md:col-span-2 sm:col-span-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Armory
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {FOOTER_LINKS.armory.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div className="md:col-span-2 sm:col-span-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Intelligence
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Coordinates */}
          <div className="md:col-span-3 sm:col-span-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Social Coordinates
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {FOOTER_LINKS.socials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition hover:text-cyan-600 dark:hover:text-cyan-400"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 sm:flex-row dark:border-slate-800/80">
          <p className="font-mono text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Gadget Shop Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6 font-mono text-xs text-slate-500 dark:text-slate-500">
            <Link href="/terms" className="hover:underline">
              Privacy & Terms
            </Link>
            <Link href="/contact" className="hover:underline">
              Comms Hub
            </Link>
            <Link href="/about" className="hover:underline">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
