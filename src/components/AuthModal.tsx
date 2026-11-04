"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, X, Loader2, Gift, Mail, Lock, User, Zap } from "lucide-react";
import { notifyWalletUpdated, subscribeAuthRequired } from "@/lib/client-api";

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        setGoogleEnabled(Boolean(d.googleOAuthEnabled));
        setIsDevMode(Boolean(d.isDevMode));
      })
      .catch(() => null);

    return subscribeAuthRequired(() => {
      setError("");
      setOpen(true);
    });
  }, []);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");

      notifyWalletUpdated(data.user?.creditsBalance);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleInstantDemoLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");
      notifyWalletUpdated(data.user?.creditsBalance);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-7 shadow-2xl">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {mode === "signup" ? "Claim 30 Free Credits" : "Welcome Back"}
            </h2>
            <p className="text-xs text-slate-400">
              Sign in to save lessons, solve papers & track mastery
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-200">
          <Gift className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>New accounts automatically get 30 Free Study Credits!</span>
        </div>

        {/* Google 1-Click OAuth */}
        {googleEnabled && (
          <a
            href="/api/auth/google"
            className="mb-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white py-3 px-4 text-sm font-bold text-slate-900 shadow hover:bg-slate-100 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            Continue with Google
          </a>
        )}

        {/* Local Dev 1-Click Login */}
        {isDevMode && (
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 py-2.5 px-4 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            1-Click Local Dev Login (Founder Account + 30 Credits)
          </button>
        )}

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 mb-4 border border-white/10">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg py-1.5 text-xs font-bold transition ${
              mode === "signup"
                ? "bg-cyan-500/25 text-cyan-200"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg py-1.5 text-xs font-bold transition ${
              mode === "login"
                ? "bg-cyan-500/25 text-cyan-200"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full rounded-xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              minLength={6}
              className="w-full rounded-xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-3.5 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signup" ? (
              "Create Account & Get 30 Free Credits"
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
