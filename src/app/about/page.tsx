"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const FAQS = [
  {
    q: "How fast is quantum order dispatch?",
    a: "Every order placed in our armory is processed and dispatched within 24 hours via express courier logistics. You receive live telemetry tracking as soon as your shipment departs.",
  },
  {
    q: "How do you guarantee 100% genuine hardware?",
    a: "We partner exclusively with verified global manufacturers and authorized tech distributors. All serial numbers and firmware integrity are inspected prior to dispatch.",
  },
  {
    q: "What payment terms and payment methods are supported?",
    a: "Orders are initially created in a PENDING/UNPAID status so you can verify order specs. Payment arrangements (Direct Bank, Stripe, or Cash on Delivery) are finalized directly upon dispatch verification.",
  },
  {
    q: "How does the 30-day zero-risk return protocol work?",
    a: "If you are not 100% satisfied with your hardware unit, return it in original packaging within 30 days for a full refund or instant equipment swap with zero penalty.",
  },
  {
    q: "How can I track my order telemetry and status?",
    a: "Navigate to your Order Logs (/orders) or open any specific order to see real-time status changes (Pending → Processing → Shipped → Delivered) logged in the telemetry timeline.",
  },
  {
    q: "Can I update my agent credentials and avatar?",
    a: "Yes! Navigate to My Account (/account) and click 'Edit Credentials' to update your agent name, upload a new avatar directly to ImgBB, or rotate your access key password.",
  },
];

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function toggleFaq(index: number) {
    setOpenFaq(openFaq === index ? null : index);
  }

  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-60 dark:opacity-40" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// COMPANY DOSSIER // MISSION"}
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white">
            Pioneering the <span className="text-cyber-gradient">Future of Tech</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Gadget Shop was engineered to equip developers, cyber architects, gamers, and tech enthusiasts with the world&apos;s most advanced hardware, wearable tech, and robotic gear.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SpotlightCard>
            <span className="text-3xl">⚡</span>
            <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Quantum Speed
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Ultra-low latency fulfillment. Requisitions dispatched within 24h worldwide.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <span className="text-3xl">🛡️</span>
            <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Authentic Silicon
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              100% genuine manufacturer hardware with certified warranty backing.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <span className="text-3xl">🤖</span>
            <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Neural Support
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              24/7 AI-assisted diagnostics and dedicated human hardware specialists.
            </p>
          </SpotlightCard>

          <SpotlightCard>
            <span className="text-3xl">🔄</span>
            <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Zero Risk Return
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              30-day comprehensive test window with frictionless refund and swap options.
            </p>
          </SpotlightCard>
        </div>

        {/* Interactive FAQ Section */}
        <div className="mt-24">
          <div className="mb-12 text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              {"// KNOWLEDGE MATRIX"}
            </span>
            <h2 className="mt-1 font-heading text-3xl font-extrabold sm:text-4xl text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Everything you need to know about armory requisitions, warranty, and hardware delivery.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur transition-colors dark:border-slate-800/80 dark:bg-[#0d1117]/80"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <span className="font-heading text-base font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <span
                      className={`ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 font-mono text-xs font-bold text-cyan-600 transition-transform duration-200 dark:text-cyan-400 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ↓
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border-t border-slate-100 p-5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 hover:scale-105"
          >
            <span>Explore Armory Products</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
