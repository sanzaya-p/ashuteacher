"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Gift,
  Share2,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { markdownToSpeechSegments } from "@/lib/speech";
import { findBrowserVoicesForLanguage } from "@/lib/constants";
import { promptAuthModal } from "@/lib/client-api";

interface SharedLecturePlayerProps {
  lessonId: string;
  title: string;
  subject: string;
  language: string;
  level: string;
  content: string;
  sharerId: string;
  sharerFirstName: string;
}

export function SharedLecturePlayer({
  lessonId,
  title,
  subject,
  language,
  level,
  content,
  sharerId,
  sharerFirstName,
}: SharedLecturePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const utteranceIdxRef = useRef(0);
  const stoppedRef = useRef(false);

  const segments = useMemo(() => markdownToSpeechSegments(content), [content]);

  useEffect(() => {
    if (sharerId && typeof window !== "undefined") {
      window.localStorage.setItem("ashu_ref", sharerId);
      document.cookie = `ashu_ref=${encodeURIComponent(sharerId)}; path=/; max-age=2592000; samesite=lax`;
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sharerId]);

  function speakSegmentAt(idx: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (stoppedRef.current || idx >= segments.length) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    utteranceIdxRef.current = idx;
    const u = new SpeechSynthesisUtterance(segments[idx]);
    const voices = window.speechSynthesis.getVoices();
    const matched = findBrowserVoicesForLanguage(voices, language);
    if (matched.length > 0) {
      u.voice = matched[0];
      u.lang = matched[0].lang;
    } else {
      u.lang = language.split("|")[0] || "en-US";
    }
    u.rate = 1.0;
    u.onend = () => {
      if (!stoppedRef.current) speakSegmentAt(idx + 1);
    };
    u.onerror = () => {
      if (!stoppedRef.current) speakSegmentAt(idx + 1);
    };
    window.speechSynthesis.speak(u);
  }

  function handlePlayToggle() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }
    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    stoppedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    speakSegmentAt(0);
  }

  function handleStop() {
    stoppedRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }

  async function handleShareWhatsApp() {
    const url = `${window.location.origin}/share/${lessonId}${
      sharerId ? `?ref=${encodeURIComponent(sharerId)}` : ""
    }`;
    const msg = `🎓 Watch & listen to "${title}" (${subject}) on AshuTeacher's AI Voice Blackboard! Sign up via this link to get 35 Free Study Credits: ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/share/${lessonId}${
      sharerId ? `?ref=${encodeURIComponent(sharerId)}` : ""
    }`;
    await navigator.clipboard.writeText(url).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Top Viral Referral Invite Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-blue-600/15 p-4 sm:p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Shared by {sharerFirstName} • Classmate Invite Unlocked (+5 Bonus Credits)
            </p>
            <h2 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              Want AshuTeacher to teach YOUR syllabus chapter or solve YOUR exam PDF?
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Listen to this full chalkboard lecture free below — then claim{" "}
              <strong className="text-emerald-300">35 Free Study Credits</strong> in 10 seconds (no card needed).
            </p>
          </div>
        </div>
        <button
          onClick={promptAuthModal}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg hover:brightness-110 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>Claim 35 Free Credits</span>
        </button>
      </div>

      {/* Blackboard Header & Voice Controls */}
      <div className="rounded-3xl border border-cyan-500/25 bg-slate-950 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-semibold">
              <span>{subject}</span>
              <span>•</span>
              <span>{level}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white mt-0.5">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:brightness-110 transition"
            >
              {isPlaying && !isPaused ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>{isPaused ? "Resume Voice" : "Listen to Voice Teacher"}</span>
                </>
              )}
            </button>

            {isPlaying && (
              <button
                onClick={handleStop}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Square className="h-3 w-3" />
                <span>Stop</span>
              </button>
            )}

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <span>Copy Link</span>
              )}
            </button>
          </div>
        </div>

        {/* Rendered LaTeX Chalkboard */}
        <div className="bg-[#0b1512] px-5 py-7 sm:px-10 sm:py-9 text-slate-100 leading-relaxed">
          <MarkdownRenderer content={content} />
        </div>

        {/* Bottom Conversion Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-slate-900/95 px-6 py-5">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
            <Volume2 className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              Teach any chapter across <strong>195+ countries</strong> (IGNOU, UPSC, CBSE, JEE/NEET, MIT) in{" "}
              <strong>100+ languages</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/classroom?topic=${encodeURIComponent(title)}&subject=${encodeURIComponent(subject)}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-400 transition"
            >
              <span>Open Interactive Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
