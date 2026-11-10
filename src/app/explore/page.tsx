import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Volume2,
  Globe2,
  GraduationCap,
} from "lucide-react";
import { SEO_LANDING_PAGES } from "@/lib/seo-pages";
import { SHOWCASE_LECTURES } from "@/lib/showcase-lectures";

export const metadata: Metadata = {
  title: "Explore Syllabi, Competitive Exams & Regional Language Classrooms",
  description:
    "Browse free interactive AI Voice Blackboard study hubs for IGNOU MCA/MBA/BAG, UPSC CSE, IIT-JEE, NEET UG, GATE, SSC, CBSE/ICSE Boards, Odia, Hindi & 100+ world languages.",
};

const CATEGORIES: Array<SeoCategory> = [
  "World National Exams (Localized)",
  "IGNOU & Distance Learning",
  "Competitive Exams",
  "School & Boards",
  "Regional Languages",
  "Global & University",
  "Research & Exam Tools",
];

type SeoCategory = (typeof SEO_LANDING_PAGES)[number]["category"];

export default function ExploreDirectoryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10 space-y-12">
      {/* Hero */}
      <section className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-slate-900 via-[#0d192b] to-slate-950 p-6 sm:p-10 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-4">
          <Globe2 className="h-3.5 w-3.5" />
          <span>195+ Countries • KG to Doctoral • 100+ Native Languages</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Global Syllabus, Competitive Exam &amp; Language Classrooms
        </h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-300">
          Pick any instant live demo lecture below (zero login required!) or open a dedicated exam &amp; university study hub for{" "}
          <strong>IGNOU, UPSC, IIT-JEE, NEET, GATE, SSC, CBSE/ICSE, SAT/AP, Cambridge, MIT</strong>, and{" "}
          <strong>22 Indian + 80+ global languages</strong>.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:brightness-110 transition"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Open 6-Box Cascading Syllabus Explorer</span>
          </Link>
          <Link
            href="/classroom"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            <Volume2 className="h-4 w-4 text-cyan-400" />
            <span>Open AI Voice Blackboard</span>
          </Link>
        </div>
      </section>

      {/* Instant Zero-Login Live Blackboard Showcases */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span>Watch &amp; Hear Live Blackboard Demos Instantly (No Login Needed)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Tap any card to watch LaTeX equations stream onto the chalkboard with synchronized voice narration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOWCASE_LECTURES.map((demo) => {
            const href = `/classroom?topic=${encodeURIComponent(
              demo.title
            )}&subject=${encodeURIComponent(
              demo.subject
            )}&lang=${encodeURIComponent(demo.language)}&level=${encodeURIComponent(
              demo.level
            )}&autostart=1`;

            return (
              <Link
                key={demo.slug}
                href={href}
                className="group flex flex-col justify-between rounded-2xl border border-emerald-400/25 bg-slate-900/80 p-5 hover:border-emerald-400/60 hover:bg-slate-900 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    <span>{demo.badge}</span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-200">
                      {demo.languageBadge}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {demo.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{demo.subject}</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Play Free Voice Blackboard Demo</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Categorized SEO Study Hubs */}
      {CATEGORIES.map((cat) => {
        const pages = SEO_LANDING_PAGES.filter((p) => p.category === cat);
        if (pages.length === 0) return null;

        return (
          <section key={cat} className="space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              <span>{cat}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/explore/${page.slug}`}
                  className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-cyan-400/40 hover:bg-slate-900 transition"
                >
                  <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                    {page.heroBadge}
                  </span>
                  <h3 className="mt-2 text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
                    {page.h1}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-400 line-clamp-2">
                    {page.subtitle}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300">
                    <span>Open Syllabus &amp; Chapters</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
