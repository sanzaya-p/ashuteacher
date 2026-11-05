"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  INDIAN_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
  WRITING_SCRIPT_OPTIONS,
  WritingScriptMode,
  encodeLanguageAndScript,
  findBrowserVoicesForLanguage,
  parseLanguageAndScript,
} from "@/lib/constants";

interface LanguageSelectorProps {
  value: string;
  onChange: (langCode: string) => void;
  label?: string;
  selectClassName?: string;
  showBrowserFilter?: boolean;
  showScriptPicker?: boolean;
}

const CUSTOM_SENTINEL = "__custom_language__";

export function LanguageSelector({
  value,
  onChange,
  label,
  selectClassName = "w-full rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none",
  showBrowserFilter = true,
  showScriptPicker = true,
}: LanguageSelectorProps) {
  const parsed = useMemo(() => parseLanguageAndScript(value), [value]);
  const isCustom = parsed.baseCode.startsWith("custom:");

  const [customDraft, setCustomDraft] = useState<string>(
    isCustom ? parsed.baseCode.slice("custom:".length) : ""
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
      (l) => browserSupportedSet.has(l.code) || l.code === parsed.baseCode
    );
  }, [browserOnly, voicesLoaded, browserSupportedSet, parsed.baseCode]);

  const filteredInternational = useMemo(() => {
    if (!browserOnly || !voicesLoaded) return INTERNATIONAL_LANGUAGES;
    return INTERNATIONAL_LANGUAGES.filter(
      (l) => browserSupportedSet.has(l.code) || l.code === parsed.baseCode
    );
  }, [browserOnly, voicesLoaded, browserSupportedSet, parsed.baseCode]);

  const selectValue = isCustom || customOpen ? CUSTOM_SENTINEL : parsed.baseCode;

  function handleSelectChange(next: string) {
    if (next === CUSTOM_SENTINEL) {
      setCustomOpen(true);
      const initial = customDraft.trim() || "Sambalpuri";
      setCustomDraft(initial);
      onChange(encodeLanguageAndScript(`custom:${initial}`, parsed.scriptMode));
      return;
    }
    setCustomOpen(false);
    // Reset script override to "auto" when changing language so the new language's native/derived script applies automatically
    onChange(encodeLanguageAndScript(next, "auto"));
  }

  function handleCustomInput(raw: string) {
    setCustomDraft(raw);
    const cleaned = raw.trim();
    if (cleaned) {
      onChange(encodeLanguageAndScript(`custom:${cleaned}`, parsed.scriptMode));
    }
  }

  function handleScriptChange(nextScript: WritingScriptMode) {
    onChange(encodeLanguageAndScript(parsed.baseCode, nextScript));
  }

  function formatOptionLabel(flag: string, name: string, code: string) {
    if (!voicesLoaded) return `${flag} ${name}`;
    return browserSupportedSet.has(code)
      ? `${flag} ${name} 🔊`
      : `${flag} ${name} (AI Voice)`;
  }

  const autoScriptShort = useMemo(() => {
    const autoParsed = parseLanguageAndScript(parsed.baseCode);
    const s = autoParsed.effectiveScriptLabel;
    if (s.length > 34) return "Native / Parent Script";
    return s;
  }, [parsed.baseCode]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <select
        value={selectValue}
        onChange={(e) => handleSelectChange(e.target.value)}
        className={selectClassName}
      >
        <optgroup
          label={
            browserOnly
              ? "🇮🇳 Indian Languages & Dialects (Browser Voice)"
              : "🇮🇳 Indian Languages & Regional Dialects"
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
              ? "🌍 International Languages (Browser Voice)"
              : "🌍 International Languages (60+ Global)"
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
            label="✨ Any Other Dialect or Language"
            className="bg-slate-950 text-amber-300 font-semibold"
          >
            <option
              value={CUSTOM_SENTINEL}
              className="bg-slate-900 text-amber-200 font-normal"
            >
              🌐 Type Any Dialect (Auto-Detects Parent Script...)
            </option>
          </optgroup>
        )}
      </select>

      {(customOpen || isCustom) && (
        <input
          type="text"
          value={isCustom ? parsed.baseCode.slice("custom:".length) : customDraft}
          onChange={(e) => handleCustomInput(e.target.value)}
          placeholder="Type any dialect (e.g. Kosali, Desia, Sadri, Sylheti, Kodava...)"
          className="w-full rounded-xl border border-cyan-400/40 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
      )}

      {showScriptPicker && parsed.baseCode !== "hinglish" && (
        <div className="pt-0.5">
          <select
            value={parsed.scriptMode}
            onChange={(e) =>
              handleScriptChange(e.target.value as WritingScriptMode)
            }
            title="Blackboard Writing Script (Defaults automatically to the language's native or parent derived script)"
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-[11px] text-slate-300 focus:border-cyan-400 focus:outline-none"
          >
            {WRITING_SCRIPT_OPTIONS.map((opt) => (
              <option
                key={opt.id}
                value={opt.id}
                className="bg-slate-900 text-white"
              >
                {opt.id === "auto"
                  ? `📜 Script: ${autoScriptShort} (Default)`
                  : `📜 Override: ${opt.label}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {showBrowserFilter && voicesLoaded && (
        <label className="flex items-center gap-1.5 text-[10.5px] text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={browserOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setBrowserOnly(checked);
              if (checked && !browserSupportedSet.has(parsed.baseCode)) {
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
    </div>
  );
}
