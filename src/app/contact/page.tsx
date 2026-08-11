"use client";

import { useState, type FormEvent } from "react";
import { toast } from "@/components/admin/toast";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const CATEGORIES = ["Order Status", "Hardware RMA", "Partnership", "General"];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60 dark:border-slate-800 dark:bg-[#0d1117] dark:text-slate-100 dark:focus:border-cyan-400";
const labelClass =
  "block font-heading text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5";

export default function ContactPage() {
  const [category, setCategory] = useState("Order Status");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setName("");
      setEmail("");
      setMessage("");
      toast("Transmission received! Our hardware specialists will respond within 4 hours.", "success");
    }, 600);
  }

  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-60 dark:opacity-40" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            {"// COMMS TERMINAL // CONTACT"}
          </span>
          <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900 dark:text-white">
            Initiate Contact Transmission
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400">
            Have questions about an equipment drop, warranty claim, or order status? Our support operatives are online 24/7.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0d1117]/80">
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                Dispatch A Transmission
              </h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* Category Pills */}
                <div>
                  <label className={labelClass}>Sector / Topic</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition ${
                          category === cat
                            ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25"
                            : "border border-slate-300 bg-white text-slate-700 hover:border-cyan-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Agent Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Terminal
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="alex@nexus.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Transmission Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Describe your inquiry, order number, or hardware telemetry…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-cyan-500 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 hover:shadow-cyan-400/40 disabled:opacity-50"
                >
                  {submitting ? "Transmitting Protocol…" : "Send Transmission →"}
                </button>
              </form>
            </div>
          </div>

          {/* Coordinates & Info */}
          <div className="space-y-4 lg:col-span-5">
            <SpotlightCard>
              <span className="text-2xl">🤖</span>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
                Neural AI Diagnostics
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Instant smart diagnostics available 24/7/365 with live human handover.
              </p>
              <span className="mt-3 inline-block font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                AVG RESPONSE: &lt; 2 MINS
              </span>
            </SpotlightCard>

            <SpotlightCard>
              <span className="text-2xl">📧</span>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
                Direct Email Terminal
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                For order adjustments, warranty verification, and invoice queries.
              </p>
              <span className="mt-3 inline-block font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                support@gadgetshop.dev
              </span>
            </SpotlightCard>

            <SpotlightCard>
              <span className="text-2xl">🌐</span>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
                Armory Headquarters
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Sector 7 Cyber Tech District, Neo Silicon Bay, CA 94016.
              </p>
              <span className="mt-3 inline-block font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                DISPATCH HUB // ONLINE
              </span>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}
