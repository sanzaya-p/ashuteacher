"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Library,
  Search,
  Star,
  Trash2,
  ArrowRight,
  MessageSquare,
  Sparkles,
  BookOpen,
  FileCheck2,
  ListChecks,
} from "lucide-react";

interface LibraryLesson {
  id: string;
  title: string;
  subject: string;
  mode: string;
  level: string;
  language: string;
  isFavorite: boolean;
  excerpt: string;
  createdAt: string;
  _count?: { messages: number; quizzes: number };
}

export default function LibraryPage() {
  const [lessons, setLessons] = useState<LibraryLesson[]>([]);
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchLessons() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (modeFilter !== "all") params.set("mode", modeFilter);
      if (favoriteOnly) params.set("favorite", "true");

      const res = await fetch(`/api/lessons?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data.lessons)) {
        setLessons(data.lessons);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLessons();
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, modeFilter, favoriteOnly]);

  async function toggleFavorite(id: string, current: boolean) {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFavorite: !current } : l))
    );
    await fetch(`/api/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
  }

  async function deleteLesson(id: string) {
    if (!confirm("Delete this saved session from your library?")) return;
    setLessons((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/lessons/${id}`, { method: "DELETE" });
  }

  function getModeIcon(mode: string) {
    switch (mode) {
      case "story":
        return BookOpen;
      case "solve":
        return FileCheck2;
      case "cheatsheet":
        return ListChecks;
      default:
        return Sparkles;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Library className="h-7 w-7 text-cyan-400" />
            Saved Study Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Revisit your past blackboard lectures, stories, solved papers, and Q&A threads.
          </p>
        </div>

        <Link
          href="/classroom"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
        >
          New Session
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved lessons, formulas, subjects..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All" },
            { id: "lesson", label: "Lessons" },
            { id: "story", label: "Stories" },
            { id: "solve", label: "Solved Papers" },
            { id: "cheatsheet", label: "Cheat Sheets" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setModeFilter(m.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                modeFilter === m.id
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/30"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}

          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              favoriteOnly
                ? "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                favoriteOnly ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
            Favorites
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {!loading && lessons.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-slate-900/40 p-12 text-center">
          <Library className="mx-auto h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white">No saved sessions found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Start a lesson or solve an exam paper in the Classroom and it will appear here automatically.
          </p>
          <Link
            href="/classroom"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-200"
          >
            Launch Classroom
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((item) => {
            const Icon = getModeIcon(item.mode);
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-cyan-400/35 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold capitalize text-cyan-300">
                      <Icon className="h-3.5 w-3.5" />
                      {item.mode}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id, item.isFavorite)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            item.isFavorite
                              ? "fill-amber-400 text-amber-400"
                              : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteLesson(item.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-cyan-400/80 mt-0.5">
                    {item.subject} • {item.level}
                  </p>
                  <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {item.excerpt || "Open in Classroom to view full content."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    {item._count && item._count.messages > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {item._count.messages} Q&A
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/classroom?lessonId=${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 group-hover:text-cyan-200"
                  >
                    Open Board
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
