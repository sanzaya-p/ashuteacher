import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Volume2,
  GraduationCap,
  HelpCircle,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import {
  SEO_LANDING_PAGES,
  getSeoLandingPageBySlug,
} from "@/lib/seo-pages";

export function generateStaticParams() {
  return SEO_LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLandingPageBySlug(slug);
  if (!page) {
    return { title: "Study Hub | AshuTeacher" };
  }

  return {
    title: page.title,
    description: page.metaDescription,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export default async function ExploreLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoLandingPageBySlug(slug);
  if (!page) notFound();

  const relatedPages = SEO_LANDING_PAGES.filter((p) => p.slug !== page.slug).slice(
    0,
    6
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: page.h1,
    description: page.metaDescription,
    provider: {
      "@type": "Organization",
      name: "AshuTeacher",
      sameAs: "https://ashuteacher.vercel.app",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-cyan-300">
          Home
        </Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-cyan-300">
          Explore Hubs
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium truncate">{page.subjectLabel}</span>
      </nav>

      {/* Hero */}
      <header className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-[#0d192c] to-slate-950 p-6 sm:p-10 shadow-2xl space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{page.heroBadge}</span>
        </span>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
          {page.h1}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          {page.subtitle}
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {page.highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-xs sm:text-sm text-slate-200"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/classroom?subject=${encodeURIComponent(
              page.subjectLabel
            )}&lang=${encodeURIComponent(
              page.defaultLanguage
            )}&level=${encodeURIComponent(page.defaultLevel)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:brightness-110 transition"
          >
            <Volume2 className="h-4 w-4" />
            <span>Start Free AI Voice Blackboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/academy"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            <span>Browse Full Official Syllabus Tree</span>
          </Link>

          <Link
            href="/classroom?mode=solve"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 transition"
          >
            <FileCheck2 className="h-4 w-4 text-emerald-400" />
            <span>Solve Question Paper PDF/Photo</span>
          </Link>
        </div>
      </header>

      {/* Featured Interactive Chapters */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Featured {page.subjectLabel} Blackboard Lectures
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Click any chapter below to launch it directly on the AI Voice Blackboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.featuredChapters.map((ch, idx) => {
            const launchHref = `/classroom?topic=${encodeURIComponent(
              ch.title
            )}&subject=${encodeURIComponent(
              page.subjectLabel
            )}&lang=${encodeURIComponent(
              page.defaultLanguage
            )}&level=${encodeURIComponent(page.defaultLevel)}&autostart=1`;

            return (
              <Link
                key={ch.title}
                href={launchHref}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-5 hover:border-cyan-400/50 hover:bg-slate-900 transition"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Interactive Lecture #{idx + 1}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {ch.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
                    {ch.summary}
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Teach This on Voice Blackboard</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      {page.faqs.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {page.faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4"
              >
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {f.q}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internal SEO Mesh Links */}
      <section className="space-y-3 pt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          More Free AI Study Hubs on AshuTeacher
        </h2>
        <div className="flex flex-wrap gap-2">
          {relatedPages.map((rel) => (
            <Link
              key={rel.slug}
              href={`/explore/${rel.slug}`}
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200 transition"
            >
              {rel.subjectLabel}: {rel.heroBadge}
            </Link>
          ))}
          <Link
            href="/explore"
            className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            View All Study Hubs →
          </Link>
        </div>
      </section>
    </div>
  );
}
