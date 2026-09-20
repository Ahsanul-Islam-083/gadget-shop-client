"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { listProducts } from "@/lib/api/products";
import { listCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/products/product-card";
import {
  ProductGridSkeleton,
  ProductCategoryGridSkeleton,
} from "@/components/ui/skeleton";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { toast } from "@/components/admin/toast";
import type { Category, Product } from "@/types/api";

const CATEGORY_ICONS: Record<string, string> = {
  Smartphones: "📱",
  Audio: "🎧",
  "Audio & Sound": "🎧",
  Wearables: "⌚",
  "Wearables & Smartwatches": "⌚",
  Accessories: "🔌",
  "Computing & Accessories": "💻",
  Gaming: "🎮",
  Cameras: "📷",
};

const TESTIMONIALS = [
  {
    name: "Alex Mercer",
    role: "Hardware Architect",
    avatar: "A",
    text: "The delivery was unbelievably fast. The cyber build quality of the audio gear exceeded all my expectations.",
    rating: 5,
    tag: "Verified Enthusiast",
  },
  {
    name: "Elena Rostova",
    role: "Tech Journalist",
    avatar: "E",
    text: "Gadget Shop is my go-to armory for authentic high-spec gadgets. Customer support via AI is lightning fast.",
    rating: 5,
    tag: "Verified Buyer",
  },
  {
    name: "Marcus Vance",
    role: "Cybersecurity Analyst",
    avatar: "M",
    text: "Seamless checkout and authentic hardware with serial verifications. 10/10 recommended for tech lovers.",
    rating: 5,
    tag: "Verified Buyer",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listProducts({ sortBy: "newest", pageSize: 4 }),
      listCategories({ page: 1, pageSize: 6 }),
    ])
      .then(([prodRes, catRes]) => {
        if (cancelled) return;
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCopyPromo() {
    navigator.clipboard.writeText("CYBER20");
    toast("Coupon code 'CYBER20' copied to clipboard! (20% OFF)", "success");
  }

  function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubmitting(true);
    setTimeout(() => {
      setNewsletterSubmitting(false);
      setNewsletterEmail("");
      toast("VIP clearance granted! Welcome to the Cyber Dispatch.", "success");
    }, 600);
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#06070a] dark:text-slate-100">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-60 dark:opacity-40" />

      {/* ========================================================= */}
      {/* 1. HERO SECTION: CYBER ODYSSEY                            */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[450px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Hero Content */}
            <div className="lg:col-span-7">
              {/* Futuristic Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-700 backdrop-blur-md dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                <span>{"// NEXT-GEN GEAR // V2.5"}</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              >
                Elevate Your Reality with{" "}
                <span className="text-cyber-gradient">Futuristic Gadgets</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400"
              >
                Arm yourself with cutting-edge tech, robotic gear, studio-grade
                audio, and next-gen smart devices. Built for speed, precision,
                and supreme aesthetics.
              </motion.p>

              {/* Dual Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/products"
                  className="group flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:bg-cyan-400 hover:shadow-cyan-400/40"
                >
                  <span>Explore Armory</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <a
                  href="#deals"
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-6 py-3.5 font-heading text-sm font-bold text-slate-800 shadow-sm backdrop-blur transition hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-amber-400/50 dark:hover:text-amber-400"
                >
                  <span>⚡ Flash Drops</span>
                </a>
              </motion.div>

              {/* Hero Live Telemetry Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-200/80 pt-6 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    10k+
                  </span>
                  <span>Tech Deployed</span>
                </div>
                <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-amber-500">
                    ★ 4.9
                  </span>
                  <span>Customer Trust</span>
                </div>
                <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Quantum Sync 99.9%</span>
                </div>
              </motion.div>
            </div>

            {/* Right Hero Floating Tech Preview */}
            <div className="relative lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative mx-auto max-w-sm rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-white/90 to-slate-50/80 p-6 shadow-2xl backdrop-blur-xl dark:border-cyan-500/20 dark:from-[#0d1117]/90 dark:to-[#06070a]/90 dark:shadow-cyan-950/30"
              >
                {/* Top Hologram Strip */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                    {"// HUD SPEC_01"}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    SYSTEM ACTIVE
                  </span>
                </div>

                {/* Cyber Cube Graphic */}
                <div className="relative mb-6 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-amber-500/10 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="relative flex flex-col items-center justify-center text-center">
                    <span className="text-5xl animate-bounce">🤖</span>
                    <p className="mt-2 font-heading text-sm font-bold text-slate-800 dark:text-slate-200">
                      Neural Hardware Engine
                    </p>
                    <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
                      {"LATENCY: 0.4ms // AUTHENTICATED"}
                    </span>
                  </div>
                </div>

                {/* Telemetry rows */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between rounded-lg bg-slate-100/70 p-2.5 dark:bg-slate-900/70">
                    <span className="text-slate-500 dark:text-slate-400">
                      Security Protocol
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      256-Bit Vault
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-slate-100/70 p-2.5 dark:bg-slate-900/70">
                    <span className="text-slate-500 dark:text-slate-400">
                      Global Dispatch
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      Express &lt; 24h
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CATEGORY MATRIX (BENTO GRID)                           */}
      {/* ========================================================= */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                {"// EXPLORE MATRIX"}
              </p>
              <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Browse by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              View Full Catalog →
            </Link>
          </div>

          {loading ? (
            <ProductCategoryGridSkeleton count={6} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat, idx) => {
                const icon = CATEGORY_ICONS[cat.name] ?? "⚡";
                return (
                  <Link
                    key={cat.id}
                    href={`/products?categoryId=${cat.id}`}
                    className="group"
                  >
                    <SpotlightCard className="h-full cursor-pointer transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-2xl shadow-sm transition group-hover:scale-110 group-hover:border-cyan-500/40">
                          {icon}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          CAT #{idx + 1}
                        </span>
                      </div>
                      <h3 className="mt-4 font-heading text-xl font-bold text-slate-900 group-hover:text-cyan-500 dark:text-white dark:group-hover:text-cyan-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Explore latest hardware and curated gadgets in this
                        sector.
                      </p>
                      <div className="mt-4 flex items-center gap-1 font-heading text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        <span>Access Sector</span>
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </SpotlightCard>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURED & NEWEST DROPS                                */}
      {/* ========================================================= */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                {"// LATEST RELEASES"}
              </p>
              <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Featured Tech Drops
              </h2>
            </div>
            <Link
              href="/products?sortBy=newest"
              className="text-sm font-bold text-violet-600 hover:underline dark:text-violet-400"
            >
              Browse All Releases →
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-500">No hardware drops found in armory.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 font-heading text-sm font-bold text-slate-900 shadow-sm transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-cyan-400/50 dark:hover:text-cyan-400"
            >
              <span>Explore Complete Armory</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. TECH ECOSYSTEM: WHY CHOOSE US (SPOTLIGHT BENTO)        */}
      {/* ========================================================= */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              {"// REASONS TO ARM UP"}
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for True Tech Enthusiasts
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SpotlightCard>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl text-cyan-500">
                ⚡
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                Hyper-Speed Logistics
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Dispatched under 24 hours with quantum tracking and express
                courier routing.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl text-purple-500">
                🛡️
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                100% Genuine Silicon
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Every unit is factory authenticated with certified warranty
                guarantees.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-500">
                🤖
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                24/7 Neural AI Support
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Instant smart diagnostics and 24/7 specialist assistance for all
                inquiries.
              </p>
            </SpotlightCard>

            <SpotlightCard>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl text-amber-500">
                🔄
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
                30-Day Zero Risk
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Test your gear for a full month. Return or exchange without any
                friction.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FLASH DROPS & CYBER DEALS BANNER                       */}
      {/* ========================================================= */}
      <section id="deals" className="relative py-16 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl dark:from-amber-950/40 dark:via-purple-950/40 dark:to-cyan-950/40">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-300">
                  <span>⚡ LIMITED CYBER DROP</span>
                </span>
                <h2 className="mt-3 font-heading text-3xl font-extrabold sm:text-4xl">
                  Unlock 20% Off All Smart Gear
                </h2>
                <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300">
                  Use our cyber code to claim exclusive discounts on next-gen
                  wearables, audio stations, and flagship accessories.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyPromo}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-mono text-sm font-bold text-black shadow-md shadow-amber-500/25 transition hover:bg-amber-400"
                  >
                    <span>CODE: CYBER20</span>
                    <span className="text-xs font-normal">(Click to Copy)</span>
                  </button>
                  <Link
                    href="/products"
                    className="rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-bold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Shop Flash Drop
                  </Link>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-white/60 p-6 shadow-inner backdrop-blur lg:col-span-5 dark:bg-black/40">
                <span className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-amber-500">
                  {"// DROP WINDOW CLOSES IN:"}
                </span>
                <CountdownTimer targetHours={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. COMMUNITY TRANSMISSIONS: VERIFIED REVIEWS             */}
      {/* ========================================================= */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              {"// COMMUNITY TRANSMISSIONS"}
            </p>
            <h2 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Trusted by 10,000+ Tech Pioneers
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item, i) => (
              <SpotlightCard key={i} className="flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {Array.from({ length: item.rating }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-heading font-bold text-black">
                    {item.avatar}
                  </span>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.role}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. VIP CYBER DISPATCH: NEWSLETTER & PERKS                 */}
      {/* ========================================================= */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-white/90 to-slate-100/90 p-8 sm:p-14 shadow-2xl backdrop-blur-xl dark:border-cyan-500/20 dark:from-[#0d1117]/90 dark:to-[#06070a]/90">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              {"// VIP ACCESS PROTOCOL"}
            </span>
            <h2 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">
              Subscribe to the Cyber Dispatch
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Get secret drops, firmware updates, coupon codes, and private
              hardware restocks straight to your terminal.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="Enter your cyber email…"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterSubmitting}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 hover:shadow-cyan-400/40 disabled:opacity-60"
              >
                {newsletterSubmitting ? "Syncing…" : "Join Protocol"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
