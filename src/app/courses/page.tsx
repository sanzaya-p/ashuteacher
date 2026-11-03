"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Trash2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  CourseModule,
  STUDENT_LEVELS,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import { apiFetch, getStoredModel } from "@/lib/client-api";

interface CourseRecord {
  id: string;
  title: string;
  subject: string;
  description: string;
  level: string;
  language: string;
  coverGradient: string;
  modulesJson: string;
  completedChaptersJson: string;
  progressPercent: number;
  createdAt: string;
}

function CoursesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // Builder form
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [language, setLanguage] = useState("en-US");
  const [moduleCount, setModuleCount] = useState(4);
  const [error, setError] = useState("");

  async function loadCourses(preferId?: string | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (Array.isArray(data.courses)) {
        setCourses(data.courses);
        const queryId = preferId || searchParams.get("id");
        if (queryId && data.courses.some((c: CourseRecord) => c.id === queryId)) {
          setSelectedId(queryId);
        } else if (data.courses.length > 0 && !selectedId) {
          setSelectedId(data.courses[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          subject: subject.trim(),
          level,
          language,
          moduleCount,
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create course");
      setGoal("");
      setSubject("");
      setShowBuilder(false);
      await loadCourses(data.course.id);
      setSelectedId(data.course.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Course generation failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleChapter(courseId: string, chapterId: string) {
    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleChapterId: chapterId }),
    });
    if (res.ok) {
      const data = await res.json();
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? data.course : c))
      );
    }
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm("Delete this course syllabus?")) return;
    await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    const remaining = courses.filter((c) => c.id !== courseId);
    setCourses(remaining);
    if (selectedId === courseId) {
      setSelectedId(remaining[0]?.id || null);
    }
  }

  const activeCourse = courses.find((c) => c.id === selectedId) || null;
  const activeModules: CourseModule[] = activeCourse
    ? JSON.parse(activeCourse.modulesJson || "[]")
    : [];
  const completedChapters: string[] = activeCourse
    ? JSON.parse(activeCourse.completedChaptersJson || "[]")
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-cyan-400" />
            Course & Syllabus Architect
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build structured multi-module learning paths and launch any chapter directly on the Blackboard.
          </p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
        >
          <Plus className="h-4 w-4" />
          New AI Course
        </button>
      </div>

      {/* Course Generator Form */}
      {(showBuilder || (!loading && courses.length === 0)) && (
        <form
          onSubmit={handleCreateCourse}
          className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Design a Custom Curriculum</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                What do you want to master?
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Complete Linear Algebra for Machine Learning, AP Chemistry, System Design..."
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject Category
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, CS"
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {STUDENT_LEVELS.map((l) => (
                  <option key={l.id} value={l.id} className="bg-slate-900">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
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
                Course Depth
              </label>
              <select
                value={moduleCount}
                onChange={(e) => setModuleCount(Number(e.target.value))}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value={3} className="bg-slate-900">
                  Crash Course (3 Modules)
                </option>
                <option value={4} className="bg-slate-900">
                  Standard Syllabus (4 Modules)
                </option>
                <option value={6} className="bg-slate-900">
                  Comprehensive Track (6 Modules)
                </option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-2.5 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {courses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Architecting Syllabus...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Course
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Courses List + Selected Syllabus View */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Course Cards Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            {courses.map((course) => {
              const selected = course.id === selectedId;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedId(course.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selected
                      ? "border-cyan-400 bg-slate-900 shadow-lg shadow-cyan-950/30"
                      : "border-white/10 bg-slate-900/50 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-cyan-400">
                        {course.subject} • {course.level}
                      </span>
                      <h3 className="font-bold text-white text-base mt-0.5">
                        {course.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/15 hover:text-rose-400 transition"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-bold text-cyan-300">
                      {course.progressPercent}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${course.coverGradient} transition-all`}
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Course Syllabus */}
          <div className="lg:col-span-8">
            {activeCourse && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8 space-y-6">
                <div className="border-b border-white/10 pb-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-semibold mb-1">
                    <span>{activeCourse.subject}</span>
                    <span>•</span>
                    <span>{activeCourse.level}</span>
                    <span>•</span>
                    <span>{activeCourse.progressPercent}% Complete</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">
                    {activeCourse.title}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2">
                    {activeCourse.description}
                  </p>
                </div>

                <div className="space-y-5">
                  {activeModules.map((mod, mIdx) => (
                    <div
                      key={mod.id || mIdx}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden"
                    >
                      <div className="bg-white/[0.03] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-cyan-400" />
                          <span>
                            Module {mIdx + 1}: {mod.title}
                          </span>
                        </h3>
                        <span className="text-xs text-slate-400">
                          {mod.chapters?.length || 0} chapters
                        </span>
                      </div>

                      <div className="divide-y divide-white/10">
                        {(mod.chapters || []).map((ch) => {
                          const isDone = completedChapters.includes(ch.id);
                          return (
                            <div
                              key={ch.id}
                              className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() =>
                                    handleToggleChapter(activeCourse.id, ch.id)
                                  }
                                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                                  title="Toggle Completed"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                </button>
                                <div>
                                  <h4
                                    className={`text-sm font-semibold ${
                                      isDone
                                        ? "text-slate-400 line-through"
                                        : "text-white"
                                    }`}
                                  >
                                    {ch.title}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {ch.summary}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mr-1">
                                      <Clock className="h-3 w-3" />
                                      {ch.estimatedMinutes}m
                                    </span>
                                    {(ch.keyTopics || []).slice(0, 4).map((kt) => (
                                      <span
                                        key={kt}
                                        className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-300"
                                      >
                                        {kt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    topic: `${ch.title} (${ (ch.keyTopics || []).join(", ") })`,
                                    subject: activeCourse.title,
                                    mode: "lesson",
                                    courseId: activeCourse.id,
                                    chapterId: ch.id,
                                    autostart: "1",
                                  });
                                  router.push(`/classroom?${params.toString()}`);
                                }}
                                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Teach Chapter
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-400">Loading Course Builder...</div>
      }
    >
      <CoursesInner />
    </Suspense>
  );
}
