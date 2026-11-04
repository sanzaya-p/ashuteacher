"use client";

import React, { useEffect, useState } from "react";
import {
  Coins,
  Zap,
  CheckCircle2,
  ShieldCheck,
  History,
  Loader2,
  Sparkles,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { CREDIT_PACKS, CREDIT_COSTS } from "@/lib/credit-packs";
import { notifyWalletUpdated, promptAuthModal } from "@/lib/client-api";

interface WalletResponse {
  authenticated: boolean;
  creditsBalance: number;
  planTier: string;
  transactions: Array<{
    id: string;
    amount: number;
    balanceAfter: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
  gateways: {
    razorpayEnabled: boolean;
    razorpayKeyId: string | null;
    lemonSqueezyEnabled: boolean;
    sandboxEnabled: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingPage() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [processingPack, setProcessingPack] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function refreshWallet() {
    const res = await fetch("/api/billing/wallet");
    if (res.ok) {
      const data = await res.json();
      setWallet(data);
    }
  }

  useEffect(() => {
    refreshWallet();
  }, []);

  async function handleRazorpayCheckout(packId: string) {
    if (!wallet?.authenticated) {
      promptAuthModal();
      return;
    }

    setProcessingPack(packId);
    setBanner(null);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout SDK.");
      }

      const orderRes = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize UPI/Card order");
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AshuTeacher",
        description: orderData.packName,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
        },
        theme: { color: "#06b6d4" },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            notifyWalletUpdated(verifyData.creditsBalance);
            setBanner({
              type: "success",
              text: `Payment successful! Your Study Wallet now has ${verifyData.creditsBalance} credits.`,
            });
            refreshWallet();
          } else {
            setBanner({
              type: "error",
              text: verifyData.error || "Signature verification failed",
            });
          }
        },
      });

      rzp.open();
    } catch (err) {
      setBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Checkout failed",
      });
    } finally {
      setProcessingPack(null);
    }
  }

  async function handleGlobalCheckout(packId: string) {
    if (!wallet?.authenticated) {
      promptAuthModal();
      return;
    }

    setProcessingPack(packId);
    setBanner(null);
    try {
      const res = await fetch("/api/billing/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Global checkout failed",
      });
    } finally {
      setProcessingPack(null);
    }
  }

  async function handleSandboxTopUp(packId: string) {
    if (!wallet?.authenticated) {
      promptAuthModal();
      return;
    }

    setProcessingPack(packId);
    setBanner(null);
    try {
      const res = await fetch("/api/billing/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sandbox purchase failed");

      notifyWalletUpdated(data.creditsBalance);
      setBanner({
        type: "success",
        text: `Sandbox Top-Up Complete! Added ${data.packName} — New Balance: ${data.creditsBalance} Credits.`,
      });
      refreshWallet();
    } catch (err) {
      setBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Sandbox top-up failed",
      });
    } finally {
      setProcessingPack(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-8">
      {/* Header & Current Wallet Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Coins className="h-7 w-7 text-amber-400" />
            Pay-Per-Use Study Credits
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            No subscriptions. Buy credits only when you need them — credits never expire.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="inline-flex rounded-xl border border-white/10 bg-slate-900 p-1 text-xs font-bold">
            <button
              onClick={() => setCurrency("INR")}
              className={`rounded-lg px-3 py-1.5 transition ${
                currency === "INR"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🇮🇳 INR (₹ UPI)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`rounded-lg px-3 py-1.5 transition ${
                currency === "USD"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              🌎 USD ($)
            </button>
          </div>

          {wallet?.authenticated && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/15 px-4 py-2.5">
              <Zap className="h-5 w-5 text-amber-400 fill-current" />
              <div>
                <div className="text-xs text-amber-200/80">Your Balance</div>
                <div className="text-base font-extrabold text-white">
                  {wallet.creditsBalance} Credits
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {banner && (
        <div
          className={`rounded-2xl border px-5 py-3.5 text-sm font-medium ${
            banner.type === "success"
              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
              : "border-rose-400/40 bg-rose-500/15 text-rose-100"
          }`}
        >
          {banner.text}
        </div>
      )}

      {/* 3 Credit Pack Cards */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {CREDIT_PACKS.map((pack) => {
          const isPopular = pack.badge === "MOST POPULAR";
          const loading = processingPack === pack.id;

          return (
            <div
              key={pack.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 transition ${
                isPopular
                  ? "border-cyan-400 bg-gradient-to-b from-slate-900 via-[#101d35] to-slate-950 shadow-2xl shadow-cyan-950/40"
                  : "border-white/10 bg-slate-900/75"
              }`}
            >
              {pack.badge && (
                <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 text-[10px] font-extrabold tracking-wider text-slate-950 shadow">
                  {pack.badge}
                </span>
              )}

              <div>
                <h2 className="text-xl font-bold text-white">{pack.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{pack.tagline}</p>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">
                    {currency === "INR"
                      ? `₹${pack.priceInr}`
                      : `$${pack.priceUsd}`}
                  </span>
                  <span className="text-xs text-slate-400">one-time top-up</span>
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 text-xs font-bold text-amber-300">
                  <Zap className="h-3.5 w-3.5 fill-current" />+{pack.credits}{" "}
                  Study Credits
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 space-y-2">
                {currency === "INR" && wallet?.gateways?.razorpayEnabled && (
                  <button
                    onClick={() => handleRazorpayCheckout(pack.id)}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Smartphone className="h-4 w-4" />
                    )}
                    Pay ₹{pack.priceInr} via UPI / Card
                  </button>
                )}

                {currency === "USD" && wallet?.gateways?.lemonSqueezyEnabled && (
                  <button
                    onClick={() => handleGlobalCheckout(pack.id)}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Buy for ${pack.priceUsd}
                  </button>
                )}

                {/* Local Dev Sandbox Button so founder can test full flow immediately for ₹0 */}
                {wallet?.gateways?.sandboxEnabled && (
                  <button
                    onClick={() => handleSandboxTopUp(pack.id)}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-amber-400" />
                    )}
                    Test Top-Up (+{pack.credits} Credits — Dev Sandbox)
                  </button>
                )}

                {!wallet?.gateways?.razorpayEnabled &&
                  !wallet?.gateways?.lemonSqueezyEnabled &&
                  !wallet?.gateways?.sandboxEnabled && (
                    <div className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-center text-xs text-slate-400">
                      Configure Razorpay or Lemon Squeezy keys in `.env` to enable live checkout
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Transparent Credit Cost Guide + Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 rounded-3xl border border-white/10 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            How Study Credits Work
          </h3>
          <div className="divide-y divide-white/10 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-slate-300">
                Raise Hand Doubt Q&A / Contextual Tools
              </span>
              <span className="font-bold text-cyan-300">
                {CREDIT_COSTS.DOUBT} Credit
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-300">3D Active-Recall Flashcard Deck</span>
              <span className="font-bold text-cyan-300">
                {CREDIT_COSTS.FLASHCARDS} Credit
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-300">
                Interactive Blackboard Lesson / Story / Cheat Sheet
              </span>
              <span className="font-bold text-cyan-300">
                {CREDIT_COSTS.LESSON} Credits
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-300">
                Structured Interactive MCQ Quiz
              </span>
              <span className="font-bold text-cyan-300">
                {CREDIT_COSTS.QUIZ} Credits
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-300">
                Full Exam Paper Step-by-Step Solver (PDF/Image)
              </span>
              <span className="font-bold text-cyan-300">
                {CREDIT_COSTS.SOLVE_PAPER} Credits
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-300">
                Multi-Module AI Course Curriculum
              </span>
              <span className="font-bold text-cyan-300">
                {CREDIT_COSTS.COURSE} Credits
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Voice narration, revisiting saved lessons, practicing existing quizzes, and exporting PDFs are 100% free! If an AI request ever fails, credits are refunded automatically.
          </p>
        </section>

        {/* Wallet Transaction History */}
        <section className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-400" />
            Credit Wallet Ledger
          </h3>

          {!wallet?.authenticated ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/50 p-8 text-center">
              <p className="text-sm text-slate-300 mb-3">
                Sign in to claim your 10 Free Credits and view your wallet history.
              </p>
              <button
                onClick={promptAuthModal}
                className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950"
              >
                Sign In / Create Account
              </button>
            </div>
          ) : wallet.transactions.length === 0 ? (
            <p className="text-xs text-slate-400">No credit transactions yet.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-white/10 pr-1">
              {wallet.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(tx.createdAt).toLocaleString()} • Balance:{" "}
                      {tx.balanceAfter}
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      tx.amount >= 0 ? "text-emerald-400" : "text-amber-300"
                    }`}
                  >
                    {tx.amount >= 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
