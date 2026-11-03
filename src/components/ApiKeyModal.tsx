"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, CheckCircle2, ExternalLink, X, ShieldCheck, Loader2 } from "lucide-react";
import {
  getStoredApiKey,
  setStoredApiKey,
  subscribeMissingApiKey,
} from "@/lib/client-api";

export function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [saveToServer, setSaveToServer] = useState(true);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return subscribeMissingApiKey(() => {
      setKeyInput(getStoredApiKey());
      setError("");
      setSuccess(false);
      setOpen(true);
    });
  }, []);

  if (!open) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setError("Please enter a valid Gemini API key.");
      return;
    }

    setTesting(true);
    setError("");
    try {
      const testRes = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": trimmed,
        },
        body: JSON.stringify({ testApiKey: true, saveServerApiKey: trimmed }),
      });
      const testData = await testRes.json();
      if (!testRes.ok) {
        throw new Error(testData.error || "API key verification failed");
      }

      setStoredApiKey(trimmed);

      if (saveToServer) {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saveServerApiKey: trimmed }),
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify key");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-2xl shadow-cyan-950/50">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Connect Google Gemini AI</h2>
            <p className="text-xs text-slate-400">
              Power live lessons, exam solving, courses & quizzes securely
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-white/15 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              autoFocus
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveToServer}
              onChange={(e) => setSaveToServer(e.target.checked)}
              className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
            />
            <span>Save to local server environment (`.env`) so it stays active across browsers</span>
          </label>

          <div className="flex items-start gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-200">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
            <div>
              Your key is never hardcoded in client bundles. Need a free API key?{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline hover:text-white"
              >
                Get one from Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Verified & connected! You are ready to start learning.
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
            >
              Later
            </button>
            <button
              type="submit"
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-50 transition"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Connect"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
