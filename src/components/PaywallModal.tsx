"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { subscribePaywall } from "@/lib/client-api";
import { CREDIT_PACKS } from "@/lib/credit-packs";

export function PaywallModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return subscribePaywall(() => {
      setOpen(true);
    });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-lg">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Out of Study Credits
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Top up instantly with Pay-Per-Use Credit Packs — credits never expire!
            </p>
          </div>
        </div>

        <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between ${
                pack.badge === "MOST POPULAR"
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-white/10 bg-slate-950/70"
              }`}
            >
              <div>
                {pack.badge && (
                  <span className="inline-block mb-2 rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300">
                    {pack.badge}
                  </span>
                )}
                <h3 className="text-sm font-bold text-white">{pack.name}</h3>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white">
                    ₹{pack.priceInr}
                  </span>
                  <span className="text-xs text-slate-400">
                    / ${pack.priceUsd}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-cyan-300">
                  +{pack.credits} Credits
                </div>
                <ul className="mt-3 space-y-1 text-[11px] text-slate-300">
                  {pack.features.slice(0, 2).map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
          >
            Maybe Later
          </button>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:brightness-110 transition"
          >
            Open Credit Store & Top Up
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
