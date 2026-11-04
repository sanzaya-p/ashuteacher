"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  INDIAN_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
  findBrowserVoicesForLanguage,
} from "@/lib/constants";

interface LanguageSelectorProps {
  value: string;
  onChange: (langCode: string) => void;
  selectClassName?: string;
  showBrowserFilter?: boolean;
}

const CUSTOM_SENTINEL = "__custom_language__";

export function LanguageSelector({
  value,
  onChange,
  selectClassName = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none",
  showBrowserFilter = true,
}: LanguageSelectorProps) {
  const isCustom = value.startsWith("custom:");
  const [customDraft, setCustomDraft] = useState<string>(
    isCustom ? value.slice("custom:".length) : ""
  );
  const [customOpen, setCustomOpen] = useState<boolean>(isCustom);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [browserOnly, setBrowserOnly] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const syncVoices = () => {
      setBrowserVoices(window.speechSynthesis.getVoices());
    };
    syncVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", syncVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", syncVoices);
    };
  }, []);

  const browserSupportedSet = useMemo(() => {
    const supported = new Set<string>();
    if (!browserVoices.length) return supported;
    for (const lang of [...INDIAN_LANGUAGES, ...INTERNATIONAL_LANGUAGES]) {
      if (findBrowserVoicesForLanguage(browserVoices, lang.code).length > 0) {
        supported.add(lang.code);
      }
    }
    return supported;
  }, [browserVoices]);

  const voicesLoaded = browserVoices.length > 0;

  const filteredIndian = useMemo(() => {
    if (!browserOnly || !voicesLoaded) return INDIAN_LANGUAGES;
    return INDIAN_LANGUAGES.filter(
      (l) => browserSupportedSet.has(l.code) || l.code === value
    );
  }, [browserOnly, voicesLoaded, browserSupportedSet, value]);

  const filteredInternational = useMemo(() => {
    if (!browserOnly || !voicesLoaded) return INTERNATIONAL_LANGUAGES;
    return INTERNATIONAL_LANGUAGES.filter(
      (l) => browserSupportedSet.has(l.code) || l.code === value
    );
  }, [browserOnly, voicesLoaded, browserSupportedSet, value]);

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

  function formatOptionLabel(flag: string, name: string, code: string) {
    if (!voicesLoaded) return `${flag} ${name}`;
    return browserSupportedSet.has(code)
      ? `${flag} ${name} 🔊`
      : `${flag} ${name} (AI Voice)`;
  }

  return (
    <div className="space-y-1.5">
      <select
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        className={selectClassName}
      >
        <optgroup
          label={
            browserOnly
              ? "🇮🇳 Indian Languages (Browser Voice Supported)"
              : "🇮🇳 Indian Languages (🔊 Browser Voice | AI Voice)"
          }
          className="bg-slate-950 text-cyan-300 font-semibold"
        >
          {filteredIndian.map((l) => (
            <option
              key={l.code}
              value={l.code}
              className="bg-slate-900 text-white font-normal"
            >
              {formatOptionLabel(l.flag, l.name, l.code)}
            </option>
          ))}
        </optgroup>

        <optgroup
          label={
            browserOnly
              ? "🌍 International Languages (Browser Voice Supported)"
              : "🌍 International Languages (🔊 Browser Voice | AI Voice)"
          }
          className="bg-slate-950 text-cyan-300 font-semibold"
        >
          {filteredInternational.map((l) => (
            <option
              key={l.code}
              value={l.code}
              className="bg-slate-900 text-white font-normal"
            >
              {formatOptionLabel(l.flag, l.name, l.code)}
            </option>
          ))}
        </optgroup>

        {!browserOnly && (
          <optgroup
            label="✨ Any Other Language or Dialect (AI Voice)"
            className="bg-slate-950 text-amber-300 font-semibold"
          >
            <option
              value={CUSTOM_SENTINEL}
              className="bg-slate-900 text-amber-200 font-normal"
            >
              🌐 Custom Language / Dialect (Type Any...)
            </option>
          </optgroup>
        )}
      </select>

      {showBrowserFilter && voicesLoaded && (
        <label className="flex items-center gap-1.5 text-[10.5px] text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={browserOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setBrowserOnly(checked);
              if (checked && !browserSupportedSet.has(value)) {
                const fallback = browserSupportedSet.has("en-IN")
                  ? "en-IN"
                  : Array.from(browserSupportedSet)[0] || "en-US";
                setCustomOpen(false);
                onChange(fallback);
              }
            }}
            className="h-3 w-3 rounded border-white/20 bg-slate-900 text-cyan-500"
          />
          <span>Only browser-voice languages ({browserSupportedSet.size})</span>
        </label>
      )}

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
