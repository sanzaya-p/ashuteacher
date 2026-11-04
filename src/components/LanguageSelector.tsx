"use client";

import React, { useState } from "react";
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from "@/lib/constants";

interface LanguageSelectorProps {
  value: string;
  onChange: (langCode: string) => void;
  selectClassName?: string;
}

const CUSTOM_SENTINEL = "__custom_language__";

export function LanguageSelector({
  value,
  onChange,
  selectClassName = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none",
}: LanguageSelectorProps) {
  const isCustom = value.startsWith("custom:");
  const [customDraft, setCustomDraft] = useState<string>(
    isCustom ? value.slice("custom:".length) : ""
  );
  const [customOpen, setCustomOpen] = useState<boolean>(isCustom);

  const selectValue = isCustom || customOpen ? CUSTOM_SENTINEL : value;

  function handleSelectChange(next: string) {
    if (next === CUSTOM_SENTINEL) {
      setCustomOpen(true);
      const initial = customDraft.trim() || "Sambalpuri Odia";
      setCustomDraft(initial);
      onChange(`custom:${initial}`);
      return;
    }
    setCustomOpen(false);
    onChange(next);
  }

  function handleCustomInput(raw: string) {
    setCustomDraft(raw);
    const cleaned = raw.trim();
    if (cleaned) {
      onChange(`custom:${cleaned}`);
    }
  }

  return (
    <div className="space-y-1.5">
      <select
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        className={selectClassName}
      >
        <optgroup
          label="🇮🇳 Indian Languages (All 22 Scheduled + Regional)"
          className="bg-slate-950 text-cyan-300 font-semibold"
        >
          {INDIAN_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-slate-900 text-white font-normal">
              {l.flag} {l.name}
            </option>
          ))}
        </optgroup>

        <optgroup
          label="🌍 International Languages (60+ Global Languages)"
          className="bg-slate-950 text-cyan-300 font-semibold"
        >
          {INTERNATIONAL_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-slate-900 text-white font-normal">
              {l.flag} {l.name}
            </option>
          ))}
        </optgroup>

        <optgroup
          label="✨ Any Other Language or Dialect"
          className="bg-slate-950 text-amber-300 font-semibold"
        >
          <option value={CUSTOM_SENTINEL} className="bg-slate-900 text-amber-200 font-normal">
            🌐 Custom Language / Dialect (Type Any...)
          </option>
        </optgroup>
      </select>

      {(customOpen || isCustom) && (
        <input
          type="text"
          value={isCustom ? value.slice("custom:".length) : customDraft}
          onChange={(e) => handleCustomInput(e.target.value)}
          placeholder="Type any language/dialect (e.g. Rajasthani, Tulu, Mizo, Tibetan...)"
          className="w-full rounded-xl border border-cyan-400/40 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      )}
    </div>
  );
}
