"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  FileCheck2,
  GraduationCap,
  BrainCircuit,
  Flame,
  Trophy,
  Layers,
  Clock,
  Star,
  KeyRound,
  Presentation,
  Wand2,
  Gift,
  Volume2,
  Coins,
  Compass,
  FlaskConical,
  Globe2,
  Share2,
  Check,
} from "lucide-react";
import {
  promptApiKeyModal,
  promptAuthModal,
  getStoredApiKey,
} from "@/lib/client-api";

interface DashboardData {
  authenticated?: boolean;
  canConfigureServerKey?: boolean;
  profile: {
    id?: string;
    name: string;
    role: string;
    creditsBalance?: number;
    xpPoints: number;
    streakDays: number;
    preferredLang: string;
    preferredLevel: string;
    referralBonusCount?: number;
  } | null;
  hasServerKey: boolean;
  stats: {
    totalLessons: number;
    totalCourses: number;
    quizAttemptsCount: number;
    avgQuizAccuracy: number;
    flashcardsMastered: number;
  };
  recentLessons: Array<{
    id: string;
    title: string;
    subject: string;
    mode: string;
    level: string;
    isFavorite: boolean;
    createdAt: string;
  }>;
  courses: Array<{
    id: string;
    title: string;
    subject: string;
    level: string;
    coverGradient: string;
    progressPercent: number;
  }>;
  learningPrograms?: Array<{
    id: string;
    title: string;
    trackType: string;
    country: string;
    boardOrBody: string;
    gradeOrExam: string;
    progressPercent: number;
    coverGradient: string;
  }>;
  researchProjects?: Array<{
    id: string;
    title: string;
    tier: string;
    domain: string;
    progressPercent: number;
  }>;
}

const SAMPLE_TOPICS = [
  { subject: "IGNOU MCA (MCS-201)", topic: "IGNOU MCS-201: Asymptotic Complexity & Dynamic Programming", lang: "en-US", badge: "IGNOU Demo" },
  { subject: "UPSC CSE GS Paper II", topic: "UPSC Indian Polity: Fundamental Rights (Articles 12–35)", lang: "en-US", badge: "UPSC Demo" },
  { subject: "भौतिक विज्ञान (Physics)", topic: "विद्युत धारा और ओम का नियम (Ohm's Law in Hindi)", lang: "hi-IN", badge: "हिन्दी Demo" },
  { subject: "ପଦାର୍ଥ ବିଜ୍ଞାନ (Physics)", topic: "ନିଉଟନ୍‌ଙ୍କ ଗତି ନିୟମ (Newton's Laws in Odia)", lang: "or-IN", badge: "ଓଡ଼ିଆ Demo" },
  { subject: "Physics", topic: "Quantum Entanglement & Bell's Theorem", lang: "en-US", badge: "Physics Demo" },
  { subject: "Computer Science", topic: "How Transformer Attention Works", lang: "en-US", badge: "AI Demo" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [quickTopic, setQuickTopic] = useState("");
  const [quickSubject, setQuickSubject] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocalKey, setHasLocalKey] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    setHasLocalKey(Boolean(getStoredApiKey()));
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (!res.error) setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleQuickStart(mode = "lesson") {
    const trimmed = quickTopic.trim();
    if (!trimmed) {
      router.push(`/classroom?mode=${mode}`);
      return;
    }
    const params = new URLSearchParams({
      topic: trimmed,
      subject: quickSubject.trim() || "General",
      mode,
      autostart: "1",
    });
    router.push(`/classroom?${params.toString()}`);
  }

  const aiConfigured = Boolean(data?.hasServerKey || hasLocalKey);
  const isNewVisitor = !loading && data?.authenticated === false;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-8">
      {/* API Setup Banner (only shown to local dev / admin if server key missing) */}
      {!loading && !aiConfigured && data?.canConfigureServerKey && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-100">
                Owner Setup: Connect Your Server Gemini API Key
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Your API key stays hidden on your server so visitors only see the student credit experience.
              </p>
            </div>
          </div>
          <button
            onClick={promptApiKeyModal}
            className="shrink-0 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300 transition"
          >
            Connect Gemini Key
          </button>
        </div>
      )}

      {/* New Visitor Welcome Offer Strip */}
      {isNewVisitor && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/15 via-blue-600/10 to-emerald-500/10 p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                New Student Offer: Get 30 Free AI Study Credits Instantly
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sign up in 10 seconds (no credit card needed) to unlock live voice-narrated blackboard lessons, exam paper solving, quizzes &amp; 3D flashcards across all 22 Indian &amp; 60+ world languages.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={promptAuthModal}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
            >
              Claim 30 Free Credits
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              <Coins className="h-3.5 w-3.5 text-amber-300" />
              Pricing
            </Link>
          </div>
        </div>
      )}

      {/* Hero Quick-Launch Studio */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-slate-900 via-[#0e192d] to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 mb-4">
            {isNewVisitor ? (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                <span>AI Voice Blackboard • English, Hindi, Odia + 11 Languages</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Welcome back, {data?.profile?.name || "Scholar"}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            What would you like to{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
              master today?
            </span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl">
            Stream live blackboard lectures with synchronized voice narration, solve scanned exam papers, build multi-chapter courses, or drill interactive quizzes.
          </p>

          {/* Instant Topic Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={quickSubject}
              onChange={(e) => setQuickSubject(e.target.value)}
              placeholder="Subject (e.g. Physics)"
              className="sm:w-44 rounded-xl border border-white/15 bg-slate-950/75 px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTopic}
                onChange={(e) => setQuickTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuickStart("lesson");
                }}
                placeholder="Enter any topic, theorem, exam chapter, or concept..."
                className="w-full rounded-xl border border-white/15 bg-slate-950/75 px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleQuickStart("lesson")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
            >
              <span>Start Lesson</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Sample Topic Pills (Zero-Login Instant Live Blackboard Demos!) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-emerald-300 mr-1">
              {isNewVisitor ? "▶ Watch Instant Free Demo (No Login):" : "Try Live:"}
            </span>
            {SAMPLE_TOPICS.map((item) => (
              <button
                key={item.topic}
                onClick={() => {
                  const params = new URLSearchParams({
                    topic: item.topic,
                    subject: item.subject,
                    lang: item.lang,
                    mode: "lesson",
                    autostart: "1",
                  });
                  router.push(`/classroom?${params.toString()}`);
                }}
                className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-slate-200 hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-cyan-200 transition"
              >
                {item.badge ? `[${item.badge}] ` : ""}
                {item.topic.length > 42 ? `${item.topic.slice(0, 42)}…` : item.topic}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Double-Sided Viral Classmate Referral Engine (Shown to Signed-In Scholars) */}
      {!loading && data?.authenticated && data?.profile?.id && (
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-blue-600/10 p-5 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Invite Classmates → Get +10 Free Study Credits Each!
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Share your invite link in your college, IGNOU, UPSC, or school WhatsApp/Telegram group. Every classmate gets{" "}
                <strong className="text-emerald-300">35 Free Credits</strong>, and you get{" "}
                <strong className="text-cyan-300">+10 Bonus Credits</strong> automatically ({data.profile.referralBonusCount ?? 0}/20 claimed)!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const url = `${window.location.origin}/?ref=${encodeURIComponent(
                  data.profile?.id || ""
                )}`;
                const text = `🎓 Stop reading boring notes! Watch a live AI Voice Blackboard teach any IGNOU, UPSC, CBSE, JEE/NEET or college chapter in English, Hindi, Odia & 100+ languages! Join via my classmate link to get 35 Free Study Credits: ${url}`;
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(text)}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow hover:bg-emerald-400 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share on WhatsApp</span>
            </button>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/?ref=${encodeURIComponent(
                  data.profile?.id || ""
                )}`;
                await navigator.clipboard.writeText(url).catch(() => null);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 2500);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              {inviteCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Invite Copied!</span>
                </>
              ) : (
                <span>Copy Invite Link</span>
              )}
            </button>
          </div>
        </section>
      )}

      {/* 4 Core Studio Launchers */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/classroom?mode=lesson"
          className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-cyan-400/40 hover:bg-slate-900 transition"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Presentation className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-cyan-300 transition">
            Blackboard Classroom
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Live voice-narrated lectures from topics, PDFs, images, or web URLs.
          </p>
        </Link>

        <Link
          href="/classroom?tab=upload&mode=solve"
          className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-amber-400/40 hover:bg-slate-900 transition"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-amber-300 transition">
            Solve Exam Paper
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Upload PDFs or paste homework screenshots for step-by-step LaTeX solutions.
          </p>
        </Link>

        <Link
          href="/courses"
          className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-violet-400/40 hover:bg-slate-900 transition"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-violet-300 transition">
            Course & Syllabus Builder
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Generate structured multi-chapter learning paths and track mastery.
          </p>
        </Link>

        <Link
          href="/practice"
          className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-emerald-400/40 hover:bg-slate-900 transition"
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-emerald-300 transition">
            Quiz & 3D Flashcards
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Practice MCQs with detailed explanations and active-recall decks.
          </p>
        </Link>
      </section>

      {/* Mastery Metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {data?.stats.totalLessons ?? 0}
            </div>
            <div className="text-xs text-slate-400">Lessons Studied</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {data?.stats.avgQuizAccuracy ?? 0}%
            </div>
            <div className="text-xs text-slate-400">Quiz Accuracy</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {data?.stats.flashcardsMastered ?? 0}
            </div>
            <div className="text-xs text-slate-400">Cards Mastered</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {data?.profile?.streakDays ?? 1} Day{(data?.profile?.streakDays ?? 1) === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-slate-400">Learning Streak</div>
          </div>
        </div>
      </section>

      {/* Structured Global Academy & Research Lab Hub (Additive) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Syllabus & Competitive Exam Academy Card */}
        <div className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <Globe2 className="h-3 w-3" />
              <span>195+ Countries • KG to Doctoral • All Exams</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-400" />
                Structured Syllabus &amp; Exam Academy
              </h2>
              <Link
                href="/academy"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 shrink-0"
              >
                Open Academy →
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Choose any Country → School/University Board (CBSE, ICSE, State Boards, IB, AP, GCSE, MIT...) or Competitive Exam (JEE, NEET, UPSC, SAT, GRE, MCAT, Gaokao...) for a complete chapter-by-chapter Voice Blackboard syllabus.
            </p>
          </div>

          {data?.learningPrograms && data.learningPrograms.length > 0 ? (
            <div className="space-y-2.5">
              {data.learningPrograms.slice(0, 2).map((prog) => (
                <Link
                  key={prog.id}
                  href={`/academy?id=${prog.id}`}
                  className="block rounded-xl border border-white/10 bg-slate-950/70 p-3.5 hover:border-cyan-400/40 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-cyan-300">
                        {prog.country} • {prog.gradeOrExam}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {prog.title}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold text-cyan-300">
                      {prog.progressPercent}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${prog.coverGradient}`}
                      style={{ width: `${prog.progressPercent}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 transition"
              >
                <Compass className="h-4 w-4" />
                <span>Enroll in Country / Board / Competitive Exam Syllabus</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Project, Thesis & MIT-Level Research Lab Card */}
        <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              <FlaskConical className="h-3 w-3" />
              <span>School Science Fair → B.Tech Capstone → PhD / MIT Lab</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-violet-400" />
                Project, Thesis &amp; Research Studio
              </h2>
              <Link
                href="/research"
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 shrink-0"
              >
                Open Research Lab →
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Guided 6-milestone mentorship from problem formulation &amp; literature prerequisites to system architecture, IEEE/LaTeX thesis drafting, and live AI Viva Committee Defense.
            </p>
          </div>

          {data?.researchProjects && data.researchProjects.length > 0 ? (
            <div className="space-y-2.5">
              {data.researchProjects.slice(0, 2).map((proj) => (
                <Link
                  key={proj.id}
                  href="/research"
                  className="block rounded-xl border border-white/10 bg-slate-950/70 p-3.5 hover:border-violet-400/40 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-violet-300">
                        {proj.tier}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {proj.title}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold text-violet-300">
                      {proj.progressPercent}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${proj.progressPercent}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition"
              >
                <FlaskConical className="h-4 w-4" />
                <span>Start a Structured Project or Research Thesis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Two-Column Recent Activity & Active Courses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Courses */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
              Active Learning Paths
            </h2>
            <Link
              href="/courses"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              View all →
            </Link>
          </div>

          {!data?.courses?.length ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-8 text-center">
              <Wand2 className="mx-auto h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-300">
                No custom courses yet
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Generate a structured multi-chapter syllabus for any exam or skill.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15 transition"
              >
                Create Your First Course
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses?id=${course.id}`}
                  className="block rounded-xl border border-white/10 bg-slate-950/60 p-4 hover:border-cyan-400/30 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-cyan-400">
                        {course.subject} • {course.level}
                      </span>
                      <h3 className="font-semibold text-white text-sm mt-0.5">
                        {course.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-cyan-300">
                      {course.progressPercent}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${course.coverGradient}`}
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Blackboard Sessions */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Blackboard Sessions
            </h2>
            <Link
              href="/library"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
            >
              Open Library →
            </Link>
          </div>

          {!data?.recentLessons?.length ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-8 text-center">
              <Presentation className="mx-auto h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm font-medium text-slate-300">
                Your blackboard history will appear here
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Every lesson, story, and solved exam paper is saved automatically.
              </p>
              <Link
                href="/classroom"
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition"
              >
                Open Classroom
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recentLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/classroom?lessonId=${lesson.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 hover:border-cyan-400/30 transition"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                        {lesson.mode}
                      </span>
                      <span className="truncate text-sm font-semibold text-white">
                        {lesson.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lesson.subject} • {lesson.level}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lesson.isFavorite && (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    )}
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer Compliance Links (Razorpay & Global Gateways) */}
      <footer className="border-t border-white/10 pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span>© 2026 AshuTeacher • Online Education &amp; AI Learning Studio</span>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/explore" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
            Explore Exam &amp; Language Hubs
          </Link>
          <Link href="/pricing" className="hover:text-slate-300 transition">
            Pricing (INR / USD)
          </Link>
          <Link href="/legal#terms" className="hover:text-slate-300 transition">
            Terms &amp; Conditions
          </Link>
          <Link href="/legal#privacy" className="hover:text-slate-300 transition">
            Privacy Policy
          </Link>
          <Link href="/legal#refunds" className="hover:text-slate-300 transition">
            Refund Policy
          </Link>
          <Link href="/legal#delivery" className="hover:text-slate-300 transition">
            Digital Delivery
          </Link>
          <Link href="/legal#contact" className="hover:text-slate-300 transition">
            Contact Us
          </Link>
        </div>
      </footer>
    </div>
  );
}
