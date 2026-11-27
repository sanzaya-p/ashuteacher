"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Check,
  Gift,
  ArrowRight,
  Swords,
  Presentation,
} from "lucide-react";
import { QuizQuestion } from "@/lib/constants";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { promptAuthModal } from "@/lib/client-api";

interface QuizChallengeArenaProps {
  quizId: string;
  title: string;
  topic: string;
  level: string;
  language: string;
  questions: QuizQuestion[];
  defaultBestScore: number;
  creatorId: string;
  creatorFirstName: string;
}

export function QuizChallengeArena({
  quizId,
  title,
  topic,
  level,
  language,
  questions,
  defaultBestScore,
  creatorId,
  creatorFirstName,
}: QuizChallengeArenaProps) {
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [myName, setMyName] = useState("");
  const [copied, setCopied] = useState(false);

  const challengerName = (
    searchParams.get("from") ||
    creatorFirstName ||
    "A Classmate"
  )
    .trim()
    .slice(0, 32);

  const rawBeat = searchParams.get("beat");
  const parsedBeat =
    rawBeat !== null && rawBeat !== "" && !Number.isNaN(Number(rawBeat))
      ? Math.max(0, Math.min(questions.length, Math.round(Number(rawBeat))))
      : defaultBestScore > 0
        ? Math.min(questions.length, defaultBestScore)
        : null;

  const refCode = (searchParams.get("ref") || creatorId || "").trim();

  useEffect(() => {
    if (refCode && typeof window !== "undefined") {
      try {
        window.localStorage.setItem("ashu_ref", refCode);
        document.cookie = `ashu_ref=${encodeURIComponent(
          refCode
        )}; path=/; max-age=2592000; samesite=lax`;
      } catch {
        // Ignore storage restrictions
      }
    }
  }, [refCode]);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const myScore = questions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0),
    0
  );
  const myPercent = Math.round((myScore / Math.max(1, total)) * 100);

  function buildRechallengeUrl() {
    const params = new URLSearchParams();
    const sender = myName.trim().split(/\s+/)[0];
    if (sender) params.set("from", sender.slice(0, 24));
    if (submitted) params.set("beat", String(myScore));
    if (refCode) params.set("ref", refCode);
    const qs = params.toString();
    return `${window.location.origin}/challenge/${quizId}${qs ? `?${qs}` : ""}`;
  }

  function handleShareWhatsApp() {
    const url = buildRechallengeUrl();
    const sender = myName.trim().split(/\s+/)[0] || "I";
    const msg = submitted
      ? `🏆 ${sender} just scored ${myScore}/${total} (${myPercent}%) on "${title}"! Think you can beat my score? Play free (no login needed): ${url}`
      : `⚔️ Challenge: Test yourself on "${title}" (${total} MCQs with step-by-step explanations)! Play free with zero login: ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleCopyLink() {
    const url = buildRechallengeUrl();
    await navigator.clipboard.writeText(url).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const outcome =
    parsedBeat === null
      ? "completed"
      : myScore > parsedBeat
        ? "won"
        : myScore === parsedBeat
          ? "tied"
          : "lost";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Top Challenge Header */}
      <div className="rounded-3xl border border-amber-400/35 bg-gradient-to-br from-amber-500/15 via-slate-900 to-cyan-950/40 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-extrabold text-amber-200">
            <Swords className="h-3.5 w-3.5" />
            <span>Classmate Quiz Challenge • Play Free (No Login)</span>
          </div>
          <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold text-cyan-300">
            {level} • {total} Questions
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {parsedBeat !== null ? (
                <>
                  <strong className="text-amber-300">{challengerName}</strong>{" "}
                  scored{" "}
                  <strong className="text-white">
                    {parsedBeat}/{total}
                  </strong>{" "}
                  on this quiz. Can you beat their score?
                </>
              ) : (
                <>
                  <strong className="text-amber-300">{challengerName}</strong>{" "}
                  challenged you to take this interactive quiz and compare
                  scores!
                </>
              )}
            </p>
          </div>

          {parsedBeat !== null && (
            <div className="shrink-0 rounded-2xl border border-amber-400/40 bg-slate-950/80 px-4 py-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Score To Beat
              </div>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {parsedBeat}
                <span className="text-sm font-medium text-slate-400">
                  /{total}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                by {challengerName}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/10">
          <span>
            Progress: <strong className="text-white">{answeredCount}</strong> /{" "}
            {total} answered
          </span>
          <div className="h-2 w-36 sm:w-52 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
              style={{
                width: `${Math.round((answeredCount / Math.max(1, total)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Post-Submission Result & Viral Re-Challenge Card */}
      {submitted && (
        <div
          className={`rounded-3xl border p-6 space-y-5 shadow-2xl ${
            outcome === "won"
              ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-cyan-950/40"
              : outcome === "tied"
                ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-blue-950/40"
                : "border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {outcome === "won"
                    ? `You Beat ${challengerName}! 🎉`
                    : outcome === "tied"
                      ? `Dead Heat with ${challengerName}! 🤝`
                      : outcome === "lost"
                        ? `${challengerName} Still Leads — Ready for a Rematch? 🔥`
                        : `Quiz Complete! 🎯`}
                </h2>
                <p className="text-sm text-slate-200 mt-0.5">
                  Your Score:{" "}
                  <strong className="text-emerald-300">
                    {myScore}/{total} ({myPercent}%)
                  </strong>
                  {parsedBeat !== null && (
                    <>
                      {" "}
                      vs {challengerName}&apos;s{" "}
                      <strong className="text-amber-300">
                        {parsedBeat}/{total}
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>

          {/* Challenge the Next Friend */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Your first name (optional)"
              maxLength={24}
              className="sm:w-48 rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2 flex-1 sm:justify-end">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Challenge Next Friend on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <span>Copy My Challenge Link</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const picked = answers[qIdx];
          const hasPicked = picked !== undefined;

          return (
            <div
              key={q.id || qIdx}
              className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">
                    {qIdx + 1}
                  </span>
                  <div className="text-sm font-semibold text-white pt-0.5">
                    <MarkdownRenderer content={q.question} />
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  {q.difficulty || "Medium"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pl-0 sm:pl-10">
                {q.options.map((opt, oIdx) => {
                  const isSelected = picked === oIdx;
                  const isCorrect = q.correctIndex === oIdx;

                  let optionStyle =
                    "border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-400/50";
                  if (hasPicked) {
                    if (isCorrect) {
                      optionStyle =
                        "border-emerald-400 bg-emerald-500/20 text-emerald-100";
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        "border-rose-400 bg-rose-500/20 text-rose-100";
                    } else {
                      optionStyle =
                        "border-white/5 bg-slate-950/40 text-slate-400 opacity-75";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={hasPicked}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [qIdx]: oIdx,
                        }))
                      }
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-xs sm:text-sm transition ${optionStyle}`}
                    >
                      <div className="flex-1">
                        <MarkdownRenderer content={opt} />
                      </div>
                      {hasPicked && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                      {hasPicked && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasPicked && q.explanation && (
                <div className="ml-0 sm:ml-10 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3.5 text-xs text-cyan-100">
                  <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Step-by-Step Explanation
                  </div>
                  <MarkdownRenderer content={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Challenge Score CTA */}
      {!submitted && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/75 p-4">
          <p className="text-xs text-slate-300">
            {answeredCount === total
              ? "All questions answered — lock in your score to compare!"
              : `Answered ${answeredCount} of ${total} questions. You can finish anytime.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg hover:brightness-110 transition"
          >
            <Trophy className="h-4 w-4" />
            <span>Reveal Final Challenge Score</span>
          </button>
        </div>
      )}

      {/* Bottom Viral Acquisition Card */}
      <div className="rounded-3xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-blue-600/15 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Classmate Invite Unlocked • +5 Bonus Credits
            </p>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              Create Your Own Quiz, YouTube Blackboard Lesson, or Solved Exam PDF
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Sign up free in 10 seconds to claim{" "}
              <strong className="text-emerald-300">35 Free Study Credits</strong>{" "}
              across 95 Indian &amp; world languages.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={promptAuthModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow hover:brightness-110 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Claim 35 Free Credits</span>
          </button>
          <Link
            href={`/classroom?topic=${encodeURIComponent(
              topic || title
            )}&lang=${encodeURIComponent(language || "en-US")}&autostart=1`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-3.5 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 transition"
          >
            <Presentation className="h-3.5 w-3.5" />
            <span>Learn on Blackboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
