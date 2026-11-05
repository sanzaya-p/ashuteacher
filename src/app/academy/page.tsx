"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  School,
  Trophy,
  Zap,
  Globe2,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Play,
  BookOpen,
  BrainCircuit,
  Layers,
  Upload,
  Trash2,
  ChevronDown,
  ChevronRight,
  Award,
  Clock,
  FileText,
} from "lucide-react";
import {
  ACADEMIC_GRADES,
  BOARDS_BY_COUNTRY,
  EXAMS_BY_COUNTRY,
  ExamPatternInfo,
  getStreamPresetsForGrade,
  ProgramSubject,
  WORLD_COUNTRIES,
} from "@/lib/global-catalog";
import { STUDENT_LEVELS } from "@/lib/constants";
import { apiFetch, getStoredModel } from "@/lib/client-api";
import { LanguageSelector } from "@/components/LanguageSelector";

interface LearningProgramRecord {
  id: string;
  trackType: string;
  country: string;
  boardOrBody: string;
  gradeOrExam: string;
  streamOrFocus: string;
  pedagogyStage: string;
  language: string;
  title: string;
  overview: string;
  examPatternJson: string;
  subjectsJson: string;
  completedTopicsJson: string;
  progressPercent: number;
  targetDate: string | null;
  coverGradient: string;
  createdAt: string;
}

function AcademyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [programs, setPrograms] = useState<LearningProgramRecord[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeSubjectIdx, setActiveSubjectIdx] = useState<number>(0);
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [expandingChapterId, setExpandingChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // Enrollment Wizard State
  const [trackType, setTrackType] = useState<"CURRICULUM" | "COMPETITIVE_EXAM" | "SKILL_PATH">("CURRICULUM");
  const [country, setCountry] = useState("India");
  const [customCountry, setCustomCountry] = useState("");
  const [boardOrBody, setBoardOrBody] = useState("CBSE (Central Board of Secondary Education)");
  const [customBoard, setCustomBoard] = useState("");
  const [gradeOrExam, setGradeOrExam] = useState("Class 12 / Grade 12 (Board / A-Level / Senior)");
  const [customGradeOrExam, setCustomGradeOrExam] = useState("");
  const [pedagogyStage, setPedagogyStage] = useState("Intermediate");
  const [streamOrFocus, setStreamOrFocus] = useState("Science — PCM + CS");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Physics",
    "Chemistry",
    "Mathematics",
    "Computer Science",
  ]);
  const [newSubjectInput, setNewSubjectInput] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [targetDate, setTargetDate] = useState("");
  const [customSyllabusText, setCustomSyllabusText] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [syllabusFileName, setSyllabusFileName] = useState("");

  // Dynamic AI Discovery Lists
  const [discoveredBoards, setDiscoveredBoards] = useState<string[]>([]);
  const [discoveredExams, setDiscoveredExams] = useState<string[]>([]);
  const [discoveringKind, setDiscoveringKind] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const effectiveCountry =
    country === "__custom__" ? customCountry.trim() || "Global" : country;

  const availableBoards = useMemo(() => {
    const base =
      BOARDS_BY_COUNTRY[country] ||
      BOARDS_BY_COUNTRY["Global / International"] ||
      [];
    return Array.from(new Set([...discoveredBoards, ...base]));
  }, [country, discoveredBoards]);

  const availableExams = useMemo(() => {
    const base =
      EXAMS_BY_COUNTRY[country] ||
      EXAMS_BY_COUNTRY["Global / International"] ||
      [];
    return Array.from(new Set([...discoveredExams, ...base]));
  }, [country, discoveredExams]);

  const streamPresets = useMemo(
    () => getStreamPresetsForGrade(gradeOrExam),
    [gradeOrExam]
  );

  // Sync defaults cleanly when Country or Track changes
  useEffect(() => {
    setDiscoveredBoards([]);
    setDiscoveredExams([]);
    if (trackType === "CURRICULUM") {
      const list =
        BOARDS_BY_COUNTRY[country] ||
        BOARDS_BY_COUNTRY["Global / International"] ||
        [];
      if (list.length > 0) setBoardOrBody(list[0]);
    } else if (trackType === "COMPETITIVE_EXAM") {
      const list =
        EXAMS_BY_COUNTRY[country] ||
        EXAMS_BY_COUNTRY["Global / International"] ||
        [];
      if (list.length > 0) {
        setGradeOrExam(list[0]);
        setBoardOrBody("Official Exam Conducting Body");
        setPedagogyStage("Advanced");
        setSelectedSubjects([]);
      }
    }
  }, [country, trackType]);

  async function loadPrograms(preferId?: string | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/academy");
      const data = await res.json();
      if (Array.isArray(data.programs)) {
        setPrograms(data.programs);
        const qId = preferId || searchParams.get("id");
        if (qId && data.programs.some((p: LearningProgramRecord) => p.id === qId)) {
          setSelectedProgramId(qId);
        } else if (data.programs.length > 0) {
          setSelectedProgramId((prev) => prev || data.programs[0].id);
        } else {
          setShowWizard(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDiscover(kind: "boards" | "exams" | "subjects") {
    setDiscoveringKind(kind);
    setError("");
    try {
      const res = await apiFetch("/api/academy/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: effectiveCountry,
          discoveryType: kind,
          boardOrBody:
            boardOrBody === "__custom__" ? customBoard : boardOrBody,
          gradeOrExam:
            gradeOrExam === "__custom__" ? customGradeOrExam : gradeOrExam,
          streamOrFocus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Discovery failed");
      if (Array.isArray(data.items) && data.items.length > 0) {
        if (kind === "boards") {
          setDiscoveredBoards(data.items);
          setBoardOrBody(data.items[0]);
        } else if (kind === "exams") {
          setDiscoveredExams(data.items);
          setGradeOrExam(data.items[0]);
        } else {
          setSelectedSubjects(data.items.slice(0, 6));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not discover options");
    } finally {
      setDiscoveringKind(null);
    }
  }

  async function handleSyllabusPdfUpload(file: File) {
    setUploadingPdf(true);
    setSyllabusFileName(file.name);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("startPage", "1");
      fd.append("endPage", "30");
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract PDF");
      setCustomSyllabusText(data.text || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read syllabus file");
    } finally {
      setUploadingPdf(false);
    }
  }

  function toggleSubjectSelection(subj: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  }

  function addCustomSubject() {
    const trimmed = newSubjectInput.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setNewSubjectInput("");
  }

  async function handleEnrollProgram(e: React.FormEvent) {
    e.preventDefault();
    const finalBoard =
      trackType === "SKILL_PATH"
        ? "Global Mastery Path"
        : boardOrBody === "__custom__"
        ? customBoard.trim() || "Custom Board / University"
        : boardOrBody;

    const finalGradeOrExam =
      gradeOrExam === "__custom__" ? customGradeOrExam.trim() : gradeOrExam;

    if (!finalGradeOrExam) {
      setError("Please select or enter a Class, Exam, or Skill Goal.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackType,
          country: effectiveCountry,
          boardOrBody: finalBoard,
          gradeOrExam: finalGradeOrExam,
          streamOrFocus: streamOrFocus.trim(),
          selectedSubjects,
          pedagogyStage,
          language,
          targetDate,
          customSyllabusText: customSyllabusText.trim(),
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate syllabus");

      setShowWizard(false);
      setActiveSubjectIdx(0);
      await loadPrograms(data.program.id);
      setSelectedProgramId(data.program.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleTopic(programId: string, topicId: string) {
    const res = await fetch(`/api/academy/${programId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleTopicId: topicId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPrograms((prev) =>
        prev.map((p) => (p.id === programId ? data.program : p))
      );
    }
  }

  async function handleExpandChapter(
    programId: string,
    subjectId: string,
    unitId: string,
    chapterId: string
  ) {
    setExpandingChapterId(chapterId);
    try {
      const res = await apiFetch(`/api/academy/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expandChapter: { subjectId, unitId, chapterId },
        }),
      });
      const data = await res.json();
      if (res.ok && data.program) {
        setPrograms((prev) =>
          prev.map((p) => (p.id === programId ? data.program : p))
        );
      }
    } finally {
      setExpandingChapterId(null);
    }
  }

  async function handleDeleteProgram(id: string) {
    if (!confirm("Remove this enrolled syllabus program?")) return;
    await fetch(`/api/academy/${id}`, { method: "DELETE" });
    const remaining = programs.filter((p) => p.id !== id);
    setPrograms(remaining);
    if (selectedProgramId === id) {
      setSelectedProgramId(remaining[0]?.id || null);
    }
  }

  const activeProgram = programs.find((p) => p.id === selectedProgramId) || null;
  const subjects: ProgramSubject[] = useMemo(() => {
    if (!activeProgram) return [];
    try {
      return JSON.parse(activeProgram.subjectsJson || "[]");
    } catch {
      return [];
    }
  }, [activeProgram]);

  const completedTopics: string[] = useMemo(() => {
    if (!activeProgram) return [];
    try {
      return JSON.parse(activeProgram.completedTopicsJson || "[]");
    } catch {
      return [];
    }
  }, [activeProgram]);

  const examPattern: ExamPatternInfo = useMemo(() => {
    if (!activeProgram) return {};
    try {
      return JSON.parse(activeProgram.examPatternJson || "{}");
    } catch {
      return {};
    }
  }, [activeProgram]);

  const currentSubject = subjects[activeSubjectIdx] || subjects[0] || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
            <Globe2 className="h-3.5 w-3.5" />
            <span>Universal Global Curriculum &amp; Exam Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass className="h-7 w-7 text-cyan-400" />
            <span>Structured Syllabus Academy</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Any Country • Any School/University Board (KG to Doctoral) • Any Global Competitive Exam — generated &amp; tracked chapter-by-chapter.
          </p>
        </div>

        <button
          onClick={() => setShowWizard((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{showWizard ? "Close Enrollment Wizard" : "Enroll in Board / Exam Syllabus"}</span>
        </button>
      </div>

      {/* GUIDED CASCADING ENROLLMENT WIZARD */}
      {showWizard && (
        <form
          onSubmit={handleEnrollProgram}
          className="rounded-3xl border border-cyan-400/30 bg-slate-900/90 p-5 sm:p-7 space-y-6 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Step-by-Step Global Syllabus Enrollment (4 Credits)</span>
            </div>
            <span className="text-xs text-slate-400">
              Covers 195+ Countries • KG Wonder Mode to MIT/PhD Rigor
            </span>
          </div>

          {/* STEP 1: TRACK TYPE */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. What Do You Want to Enroll In?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "CURRICULUM" as const,
                  icon: School,
                  title: "School, Board & University",
                  sub: "KG to Class 12, B.Tech, MBBS, AP, IB, GCSE, MIT...",
                },
                {
                  id: "COMPETITIVE_EXAM" as const,
                  icon: Trophy,
                  title: "Competitive & Entrance Exam",
                  sub: "JEE, NEET, UPSC, SAT, GRE, MCAT, GATE, Gaokao...",
                },
                {
                  id: "SKILL_PATH" as const,
                  icon: Zap,
                  title: "Structured Skill / Career Track",
                  sub: "AI Engineering, Full-Stack, Quant Finance, Languages...",
                },
              ].map((t) => {
                const Icon = t.icon;
                const active = trackType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTrackType(t.id);
                      if (t.id === "SKILL_PATH") {
                        setGradeOrExam("__custom__");
                        setCustomGradeOrExam("");
                        setSelectedSubjects([]);
                      } else if (t.id === "CURRICULUM") {
                        setGradeOrExam("Class 12 / Grade 12 (Board / A-Level / Senior)");
                        setPedagogyStage("Intermediate");
                      }
                    }}
                    className={`text-left rounded-2xl border p-4 transition cursor-pointer ${
                      active
                        ? "border-cyan-400 bg-cyan-500/15 shadow-md"
                        : "border-white/10 bg-slate-950/70 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                      <Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-400"}`} />
                      <span>{t.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{t.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: COUNTRY + BOARD / EXAM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                2. Select Country / Region
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {WORLD_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">➕ Other Country (Type Any Country...)</option>
              </select>
              {country === "__custom__" && (
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="Enter any country (e.g., Peru, Ethiopia, Kazakhstan...)"
                  className="mt-2 w-full rounded-xl border border-cyan-400/40 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              )}
            </div>

            {trackType === "CURRICULUM" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    3. Board / University System
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDiscover("boards")}
                    disabled={discoveringKind === "boards"}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    {discoveringKind === "boards" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    <span>Discover {effectiveCountry} Boards</span>
                  </button>
                </div>
                <select
                  value={boardOrBody}
                  onChange={(e) => setBoardOrBody(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  {availableBoards.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="__custom__">
                    ➕ Custom Board / Any University Worldwide...
                  </option>
                </select>
                {boardOrBody === "__custom__" && (
                  <input
                    type="text"
                    value={customBoard}
                    onChange={(e) => setCustomBoard(e.target.value)}
                    placeholder="e.g., Sambalpur University, ETH Zurich, Caltech, State Board..."
                    className="mt-2 w-full rounded-xl border border-cyan-400/40 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>
            )}

            {trackType === "COMPETITIVE_EXAM" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    3. Select Competitive Examination
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDiscover("exams")}
                    disabled={discoveringKind === "exams"}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    {discoveringKind === "exams" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    <span>Discover {effectiveCountry} Exams</span>
                  </button>
                </div>
                <select
                  value={gradeOrExam}
                  onChange={(e) => setGradeOrExam(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  {availableExams.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                  <option value="__custom__">
                    ➕ Other Exam (Type Any Exam Worldwide...)
                  </option>
                </select>
                {gradeOrExam === "__custom__" && (
                  <input
                    type="text"
                    value={customGradeOrExam}
                    onChange={(e) => setCustomGradeOrExam(e.target.value)}
                    placeholder="e.g., OPSC OAS, NIMCET, Putnam Competition, Bar Exam..."
                    className="mt-2 w-full rounded-xl border border-cyan-400/40 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>
            )}

            {trackType === "SKILL_PATH" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  3. Career or Skill Mastery Goal
                </label>
                <input
                  type="text"
                  value={customGradeOrExam}
                  onChange={(e) => {
                    setGradeOrExam("__custom__");
                    setCustomGradeOrExam(e.target.value);
                  }}
                  placeholder="e.g., AI/LLM Systems Engineer, Quantitative Finance, Carnatic Violin..."
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* STEP 3: GRADE / PEDAGOGY + SUBJECTS / PAPERS */}
          {trackType === "CURRICULUM" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  4. Class / Grade / Degree Level (KG to PhD)
                </label>
                <select
                  value={gradeOrExam}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGradeOrExam(val);
                    const matched = ACADEMIC_GRADES.find((g) => g.id === val);
                    if (matched) {
                      setPedagogyStage(matched.pedagogyStage);
                      const presets = getStreamPresetsForGrade(val);
                      if (presets.length > 0) {
                        setStreamOrFocus(presets[0].label);
                        setSelectedSubjects(presets[0].subjects);
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  {ACADEMIC_GRADES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                  <option value="__custom__">➕ Custom Class / Degree Semester...</option>
                </select>
                {gradeOrExam === "__custom__" && (
                  <input
                    type="text"
                    value={customGradeOrExam}
                    onChange={(e) => setCustomGradeOrExam(e.target.value)}
                    placeholder="e.g., B.Tech CSE 5th Semester, MBBS 2nd Year, MIT 6.S191..."
                    className="mt-2 w-full rounded-xl border border-cyan-400/40 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  5. Stream Presets (Quick-Select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {streamPresets.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => {
                        setStreamOrFocus(sp.label);
                        setSelectedSubjects(sp.subjects);
                      }}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                        streamOrFocus === sp.label
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                          : "border-white/10 bg-slate-950 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBJECTS / PAPERS SELECTOR */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {trackType === "COMPETITIVE_EXAM"
                  ? "Papers / Sections to Include (Optional — Leave Empty for Full Official Exam)"
                  : "Selected Subjects in Your Syllabus"}
              </label>
              <button
                type="button"
                onClick={() => handleDiscover("subjects")}
                disabled={discoveringKind === "subjects"}
                className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
              >
                {discoveringKind === "subjects" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>Auto-Fetch Official Subjects / Papers</span>
              </button>
            </div>

            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubjectSelection(subj)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-rose-500/20 hover:border-rose-400/40 transition cursor-pointer"
                    title="Click to remove"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{subj}</span>
                    <span className="text-slate-400 ml-0.5">×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSubject();
                  }
                }}
                placeholder="Add any custom subject or paper (e.g., Odia Literature, Linear Algebra, Organic Chemistry)..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomSubject}
                className="rounded-xl border border-white/15 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* PEDAGOGY STAGE + LANGUAGE + TARGET DATE + OPTIONAL SYLLABUS PDF */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Teaching Depth &amp; Rigor
              </label>
              <select
                value={pedagogyStage}
                onChange={(e) => setPedagogyStage(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                {STUDENT_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label} — {lvl.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <LanguageSelector
                value={language}
                onChange={setLanguage}
                label="Medium of Instruction & Script"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Exam / Completion Date (Optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* OPTIONAL OFFICIAL SYLLABUS UPLOAD / PASTE */}
          <details className="rounded-2xl border border-white/10 bg-slate-950/50 p-3.5">
            <summary className="cursor-pointer text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Upload className="h-3.5 w-3.5 text-cyan-400" />
              <span>
                Have an Official University / School Syllabus PDF or Text? (Optional — Upload or Paste Here)
              </span>
              {syllabusFileName && (
                <span className="text-emerald-300 ml-2">✓ {syllabusFileName}</span>
              )}
            </summary>
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 cursor-pointer">
                  {uploadingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  <span>{uploadingPdf ? "Reading PDF..." : "Upload Syllabus PDF"}</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleSyllabusPdfUpload(f);
                    }}
                  />
                </label>
                <span className="text-[11px] text-slate-400">
                  Or paste official syllabus units below — AshuTeacher will structure every chapter around it.
                </span>
              </div>
              <textarea
                rows={3}
                value={customSyllabusText}
                onChange={(e) => setCustomSyllabusText(e.target.value)}
                placeholder="Paste custom syllabus units/chapters here if desired..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </details>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            {programs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Architecting Official Multi-Subject Syllabus...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate &amp; Enroll in Structured Syllabus</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MAIN ENROLLED PROGRAMS WORKSPACE */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading your Enrolled Syllabus Programs...
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-10 text-center space-y-3">
          <Compass className="h-10 w-10 text-cyan-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">
            Enroll in Your First Complete Syllabus or Competitive Exam
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Use the guided selector above to pick your Country, School/University Board (KG to PhD) or Global Competitive Exam, and get a complete chapter-by-chapter Voice Blackboard mastery path.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Enrolled Programs Switcher */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              My Enrolled Programs ({programs.length})
            </div>
            {programs.map((prog) => {
              const isSelected = prog.id === activeProgram?.id;
              return (
                <div
                  key={prog.id}
                  onClick={() => {
                    setSelectedProgramId(prog.id);
                    setActiveSubjectIdx(0);
                  }}
                  className={`group relative rounded-2xl border p-4 transition cursor-pointer ${
                    isSelected
                      ? "border-cyan-400/50 bg-slate-900 shadow-lg"
                      : "border-white/10 bg-slate-900/50 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      {prog.country} • {prog.trackType === "COMPETITIVE_EXAM" ? "Exam" : prog.boardOrBody.split("(")[0].trim()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProgram(prog.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                      title="Delete program"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="mt-2 font-bold text-sm text-white line-clamp-2">
                    {prog.title}
                  </h3>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Syllabus Mastery</span>
                      <span className="font-bold text-cyan-300">{prog.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${prog.coverGradient}`}
                        style={{ width: `${prog.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Program Syllabus Tree */}
          {activeProgram && (
            <div className="lg:col-span-9 space-y-5">
              {/* Program Banner & Official Exam Pattern */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-semibold">
                      <span>{activeProgram.country}</span>
                      <span>•</span>
                      <span>{activeProgram.boardOrBody}</span>
                      <span>•</span>
                      <span>{activeProgram.gradeOrExam}</span>
                      {activeProgram.targetDate && (
                        <>
                          <span>•</span>
                          <span className="text-amber-300">Target: {activeProgram.targetDate}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {activeProgram.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                      {activeProgram.overview}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-center min-w-[110px]">
                    <div className="text-2xl font-extrabold text-cyan-300">
                      {activeProgram.progressPercent}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-300">
                      Completed
                    </div>
                  </div>
                </div>

                {/* Official Exam / Marking Pattern Strip */}
                {(examPattern.markingScheme || examPattern.sectionsSummary) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs">
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        Duration &amp; Total Marks
                      </div>
                      <div className="text-slate-200 font-medium mt-0.5">
                        {examPattern.duration || "Academic Year"} • {examPattern.totalMarks || "Standard Grading"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        Marking &amp; Weightage Scheme
                      </div>
                      <div className="text-slate-200 font-medium mt-0.5">
                        {examPattern.markingScheme}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] uppercase text-amber-300 font-bold flex items-center gap-1">
                        <Award className="h-3 w-3" /> Topper Strategy
                      </div>
                      <div className="text-slate-200 font-medium mt-0.5">
                        {examPattern.keyStrategy || examPattern.sectionsSummary}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Switcher Tabs */}
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subj, idx) => {
                    let subjTotal = 0;
                    let subjDone = 0;
                    for (const u of subj.units || []) {
                      for (const ch of u.chapters || []) {
                        for (const t of ch.topics || []) {
                          subjTotal += 1;
                          if (completedTopics.includes(t.id)) subjDone += 1;
                        }
                      }
                    }
                    const active = idx === activeSubjectIdx;
                    return (
                      <button
                        key={subj.id}
                        onClick={() => setActiveSubjectIdx(idx)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                          active
                            ? "border-cyan-400 bg-cyan-500 text-slate-950 shadow-md"
                            : "border-white/10 bg-slate-900 text-slate-200 hover:border-white/25"
                        }`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{subj.name}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            active
                              ? "bg-slate-950/20 text-slate-950"
                              : "bg-white/10 text-cyan-300"
                          }`}
                        >
                          {subjDone}/{subjTotal}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Units -> Chapters -> Micro-Topics Tree */}
              {currentSubject && (
                <div className="space-y-5">
                  {(currentSubject.units || []).map((unit) => (
                    <div
                      key={unit.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden"
                    >
                      <div className="border-b border-white/10 bg-slate-950/80 px-5 py-3.5 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-cyan-300">
                          {unit.title}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {(unit.chapters || []).length} Chapters
                        </span>
                      </div>

                      <div className="divide-y divide-white/10">
                        {(unit.chapters || []).map((ch) => {
                          const isCollapsed = Boolean(collapsedChapters[ch.id]);
                          const chTopics = ch.topics || [];
                          const chDone = chTopics.filter((t) =>
                            completedTopics.includes(t.id)
                          ).length;
                          const curriculumLabel = `${activeProgram.country} • ${activeProgram.boardOrBody} • ${activeProgram.gradeOrExam} (${currentSubject.name})`;

                          return (
                            <div key={ch.id} className="p-4 sm:p-5 space-y-3">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCollapsedChapters((prev) => ({
                                      ...prev,
                                      [ch.id]: !prev[ch.id],
                                    }))
                                  }
                                  className="flex items-start gap-2.5 text-left cursor-pointer"
                                >
                                  {isCollapsed ? (
                                    <ChevronRight className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-cyan-400 mt-1 shrink-0" />
                                  )}
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold text-sm text-white">
                                        Ch {ch.chapterNumber}: {ch.title}
                                      </span>
                                      {ch.weightage && (
                                        <span className="rounded-md bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                          {ch.weightage}
                                        </span>
                                      )}
                                      <span className="text-[11px] text-emerald-300 font-medium">
                                        {chDone}/{chTopics.length} done
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {ch.summary}
                                    </p>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleExpandChapter(
                                      activeProgram.id,
                                      currentSubject.id,
                                      unit.id,
                                      ch.id
                                    )
                                  }
                                  disabled={expandingChapterId === ch.id}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/25 transition cursor-pointer"
                                  title="Generate granular micro-topics, derivations & numericals for this chapter (Free)"
                                >
                                  {expandingChapterId === ch.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-3.5 w-3.5" />
                                  )}
                                  <span>
                                    {ch.expanded
                                      ? "Refresh Micro-Topics"
                                      : "Expand Full Micro-Topics (Free)"}
                                  </span>
                                </button>
                              </div>

                              {!isCollapsed && (
                                <div className="pl-2 sm:pl-6 space-y-2 pt-1">
                                  {chTopics.map((top) => {
                                    const isDone = completedTopics.includes(top.id);
                                    const fullTopicTitle = `${top.title} — ${ch.title} (${activeProgram.gradeOrExam})`;

                                    return (
                                      <div
                                        key={top.id}
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition ${
                                          isDone
                                            ? "border-emerald-500/30 bg-emerald-500/5"
                                            : "border-white/5 bg-slate-950/70 hover:border-white/15"
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleToggleTopic(activeProgram.id, top.id)
                                            }
                                            className="mt-0.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
                                            title="Toggle topic mastery"
                                          >
                                            {isDone ? (
                                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                              <Circle className="h-4 w-4" />
                                            )}
                                          </button>
                                          <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span
                                                className={`text-xs sm:text-sm font-semibold ${
                                                  isDone
                                                    ? "text-emerald-200 line-through decoration-emerald-500/50"
                                                    : "text-white"
                                                }`}
                                              >
                                                {top.title}
                                              </span>
                                              {top.tag && (
                                                <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">
                                                  {top.tag}
                                                </span>
                                              )}
                                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                {top.estimatedMinutes}m
                                              </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                              {top.summary}
                                            </p>
                                          </div>
                                        </div>

                                        {/* 4-Stage Mastery Action Bar */}
                                        <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const params = new URLSearchParams({
                                                topic: fullTopicTitle,
                                                subject: currentSubject.name,
                                                mode: "lesson",
                                                level: activeProgram.pedagogyStage,
                                                lang: activeProgram.language,
                                                programId: activeProgram.id,
                                                programTopicId: top.id,
                                                curriculum: curriculumLabel,
                                                autostart: "1",
                                              });
                                              router.push(`/classroom?${params.toString()}`);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                                          >
                                            <Play className="h-3 w-3 fill-current" />
                                            <span>Teach</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const params = new URLSearchParams({
                                                topic: fullTopicTitle,
                                                subject: currentSubject.name,
                                                mode: "story",
                                                level: activeProgram.pedagogyStage,
                                                lang: activeProgram.language,
                                                programId: activeProgram.id,
                                                programTopicId: top.id,
                                                curriculum: curriculumLabel,
                                                autostart: "1",
                                              });
                                              router.push(`/classroom?${params.toString()}`);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-1.5 text-[11px] font-semibold text-fuchsia-200 hover:bg-fuchsia-500/20 transition cursor-pointer"
                                            title="Learn via Story Mode"
                                          >
                                            <span>Story</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const params = new URLSearchParams({
                                                tab: "quizzes",
                                                topic: `${top.title} (${activeProgram.boardOrBody} ${activeProgram.gradeOrExam})`,
                                                level: activeProgram.pedagogyStage,
                                                lang: activeProgram.language,
                                              });
                                              router.push(`/practice?${params.toString()}`);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                                            title="Practice Exam-Calibrated Quiz"
                                          >
                                            <BrainCircuit className="h-3 w-3 text-cyan-400" />
                                            <span>Quiz</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const params = new URLSearchParams({
                                                tab: "flashcards",
                                                topic: `${top.title} (${currentSubject.name})`,
                                                lang: activeProgram.language,
                                              });
                                              router.push(`/practice?${params.toString()}`);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-slate-900 px-2 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                                            title="3D Revision Flashcards"
                                          >
                                            <Layers className="h-3 w-3 text-amber-400" />
                                            <span>Cards</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AcademyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          Loading Structured Academy...
        </div>
      }
    >
      <AcademyInner />
    </Suspense>
  );
}
