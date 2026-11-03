"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  KeyRound,
  User,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  GEMINI_MODELS,
  STUDENT_LEVELS,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import {
  getStoredApiKey,
  getStoredModel,
  setStoredApiKey,
  setStoredModel,
} from "@/lib/client-api";

export default function SettingsPage() {
  const [name, setName] = useState("Scholar");
  const [role, setRole] = useState("Student");
  const [preferredLang, setPreferredLang] = useState("en-US");
  const [preferredLevel, setPreferredLevel] = useState("Intermediate");
  const [preferredModel, setPreferredModel] = useState("gemini-3.8-flash");

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasServerKey, setHasServerKey] = useState(false);
  const [maskedServerKey, setMaskedServerKey] = useState<string | null>(null);
  const [saveKeyToEnv, setSaveKeyToEnv] = useState(true);

  const [saving, setSaving] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setApiKeyInput(getStoredApiKey());
    setPreferredModel(getStoredModel());

    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setHasServerKey(Boolean(data.hasServerKey));
        setMaskedServerKey(data.maskedServerKey || null);
        if (data.profile) {
          setName(data.profile.name || "Scholar");
          setRole(data.profile.role || "Student");
          setPreferredLang(data.profile.preferredLang || "en-US");
          setPreferredLevel(data.profile.preferredLevel || "Intermediate");
          if (data.profile.preferredModel) {
            setPreferredModel(data.profile.preferredModel);
          }
        }
      })
      .catch(() => null);
  }, []);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      setStoredModel(preferredModel);
      if (apiKeyInput.trim()) {
        setStoredApiKey(apiKeyInput.trim());
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          preferredLang,
          preferredLevel,
          preferredModel,
          ...(saveKeyToEnv && apiKeyInput.trim()
            ? { saveServerApiKey: apiKeyInput.trim() }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings");
      setHasServerKey(Boolean(data.hasServerKey));
      setMaskedServerKey(data.maskedServerKey || null);
      setFeedback({
        type: "success",
        text: "Workspace & AI preferences saved successfully!",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTestingKey(true);
    setFeedback(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKeyInput.trim()) {
        headers["x-gemini-api-key"] = apiKeyInput.trim();
      }
      const res = await fetch("/api/settings", {
        method: "POST",
        headers,
        body: JSON.stringify({
          testApiKey: true,
          preferredModel,
          saveServerApiKey: apiKeyInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection test failed");
      setFeedback({
        type: "success",
        text: `Gemini (${data.model}) responded "${data.reply}" — AI engine verified!`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "API test failed",
      });
    } finally {
      setTestingKey(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="h-7 w-7 text-cyan-400" />
          Workspace & AI Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure your scholar profile, default teaching preferences, and Google Gemini API credentials.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/15 text-rose-200"
          }`}
        >
          {feedback.type === "success" && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Gemini AI Credentials Section */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-cyan-400" />
              Google Gemini AI Configuration
            </h2>
            {hasServerKey && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                Server Key Active ({maskedServerKey})
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Gemini API Key {hasServerKey ? "(Leave blank to keep existing server key)" : ""}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={
                    hasServerKey
                      ? "Configured on server — paste new key to replace"
                      : "Paste your AIzaSy... key here"
                  }
                  className="flex-1 rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingKey}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50 transition"
                >
                  {testingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Test Connection
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveKeyToEnv}
                  onChange={(e) => setSaveKeyToEnv(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-cyan-500"
                />
                Also persist key to server `.env` file (`GEMINI_API_KEY`)
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Gemini Model
              </label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-950/70 border border-white/10 p-3.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
            <div>
              All AI calls execute through secure Next.js Server Route Handlers (`/api/teach`, `/api/courses`, `/api/quizzes`). Generate or rotate keys anytime at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 underline hover:text-cyan-200"
              >
                Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
              .
            </div>
          </div>
        </section>

        {/* Scholar Profile Section */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" />
            Scholar Profile & Learning Defaults
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="Student" className="bg-slate-900">
                  Student
                </option>
                <option value="Educator / Teacher" className="bg-slate-900">
                  Educator / Teacher
                </option>
                <option value="Professional / Self-Learner" className="bg-slate-900">
                  Professional / Self-Learner
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Language
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900">
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Academic Level
              </label>
              <select
                value={preferredLevel}
                onChange={(e) => setPreferredLevel(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {STUDENT_LEVELS.map((l) => (
                  <option key={l.id} value={l.id} className="bg-slate-900">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 disabled:opacity-50 transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save All Settings"
              )}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
