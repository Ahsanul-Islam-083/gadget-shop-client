"use client";

import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-60 dark:opacity-40" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// LEGAL PROTOCOL // COMPLIANCE"}
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900 dark:text-white">
            Terms of Service & Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 dark:text-slate-400">
            Last Updated: August 2026 // Operational Protocol v2.5
          </p>
        </div>

        {/* Policy Sections */}
        <div className="mt-14 space-y-6">
          <SpotlightCard>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                01
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Hardware Authenticity & Warranty Guarantee
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              All gadgets, robotic units, audio gear, and peripherals distributed through Gadget Shop are 100% authentic, factory-sealed, and backed by a minimum 1-year manufacturer warranty. Serial numbers are electronically verified before dispatch.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                02
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Order Requisition & Payment Protocol
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              When an order is submitted, it is assigned a unique tracking identifier with initial status PENDING/UNPAID. Payment confirmation and delivery scheduling are coordinated directly with our dispatch specialists prior to shipment.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                03
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                30-Day Zero-Risk Return Guarantee
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Customers may return any hardware item within 30 days of delivery for a full refund or exchange, provided the item is in its original condition with all accessories, cables, and packaging intact.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                04
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Privacy, Vault Security & Encryption
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Your personal data, credentials, and telemetry are protected with 256-bit encryption. We never sell, rent, or trade customer information to third-party advertisers. Account credentials can be edited or deleted anytime from your profile terminal.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                05
              </span>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Community Transmissions & Reviews Policy
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Product reviews must reflect genuine user experiences. Hate speech, automated spam, and malicious commentary are strictly prohibited and subject to immediate removal by our administration team.
            </p>
          </SpotlightCard>
        </div>

        {/* Back Link */}
        <div className="mt-14 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-sm font-bold text-cyan-600 hover:underline dark:text-cyan-400"
          >
            <span>← Return to Headquarters</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
