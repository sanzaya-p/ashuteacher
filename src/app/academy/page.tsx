"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  School,
  Trophy,
  Zap,
  GraduationCap,
  Globe2,
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
  Award,
  Clock,
  FileText,
  BookmarkPlus,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import {
  AcademyDomain,
  BOARDS_BY_COUNTRY,
  CERTIFICATIONS_BY_COUNTRY,
  EXAMS_BY_COUNTRY,
  ExamPatternInfo,
  PaperSyllabusPayload,
  ProgramSubject,
  TreeChildrenPayload,
  UNIVERSITIES_BY_COUNTRY,
  WORLD_COUNTRIES,
} from "@/lib/global-catalog";
import { STUDENT_LEVELS, TEACHING_MODES } from "@/lib/constants";
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

interface DynamicLevelState {
  stepLabel: string;
  placeholder: string;
  isPaperLevel: boolean;
  items: Array<{ id: string; code?: string; label: string; badge?: string }>;
  selected: string;
  customValue: string;
}

function getPresetInstitutions(country: string, domain: AcademyDomain): string[] {
  if (domain === "UNIVERSITY") {
    return UNIVERSITIES_BY_COUNTRY[country] || [];
  }
  if (domain === "SCHOOL_BOARD") {
    return BOARDS_BY_COUNTRY[country] || [];
  }
  if (domain === "COMPETITIVE_EXAM") {
    return EXAMS_BY_COUNTRY[country] || [];
  }
  return (
    CERTIFICATIONS_BY_COUNTRY[country] ||
    CERTIFICATIONS_BY_COUNTRY["Global / International"] ||
    []
  );
}

function AcademyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topTab, setTopTab] = useState<"explorer" | "enrolled">("explorer");

  // Saved / Enrolled Programs State
  const [programs, setPrograms] = useState<LearningProgramRecord[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [activeSubjectIdx, setActiveSubjectIdx] = useState<number>(0);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // ------------------------------------------------------------------
  // DYNAMIC MULTI-BOX CASCADING EXPLORER STATE
  // ------------------------------------------------------------------
  const [country, setCountry] = useState("India");
  const [customCountry, setCustomCountry] = useState("");
  const [domain, setDomain] = useState<AcademyDomain>("UNIVERSITY");

  const [dynamicInstitutions, setDynamicInstitutions] = useState<string[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [institution, setInstitution] = useState(
    "IGNOU (Indira Gandhi National Open University)"
  );
  const [customInstitution, setCustomInstitution] = useState("");

  // Dynamic cascading levels after Institution (Level -> Programme -> Paper Code)
  const [levels, setLevels] = useState<DynamicLevelState[]>([]);
  const [loadingLevelIdx, setLoadingLevelIdx] = useState<number | null>(null);

  // Loaded Paper Syllabus & Chapters
  const [paperSyllabus, setPaperSyllabus] =
    useState<PaperSyllabusPayload | null>(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [pinnedProgramId, setPinnedProgramId] = useState<string | null>(null);
  const [pinToast, setPinToast] = useState("");

  // Optional Custom Syllabus PDF/Text Override
  const [customSyllabusText, setCustomSyllabusText] = useState("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [syllabusFileName, setSyllabusFileName] = useState("");

  // Learner-Selected Teaching Preferences (used when clicking "Teach Entire Chapter")
  const [teachingMode, setTeachingMode] = useState<string>("lesson");
  const [language, setLanguage] = useState<string>("en-US");
  const [teachingLevel, setTeachingLevel] = useState<string>("Advanced");

  const [error, setError] = useState("");

  const effectiveCountry =
    country === "__custom__" ? customCountry.trim() || "Global" : country;

  const effectiveInstitution =
    institution === "__custom__" ? customInstitution.trim() : institution;

  const institutionOptions = useMemo(() => {
    const presets = getPresetInstitutions(country, domain);
    return Array.from(new Set([...presets, ...dynamicInstitutions]));
  }, [country, domain, dynamicInstitutions]);

  // Load user's saved/enrolled programs
  const loadPrograms = useCallback(
    async (preferId?: string | null) => {
      setLoadingPrograms(true);
      try {
        const res = await fetch("/api/academy");
        const data = await res.json();
        if (Array.isArray(data.programs)) {
          setPrograms(data.programs);
          const qId = preferId || searchParams.get("id");
          if (
            qId &&
            data.programs.some((p: LearningProgramRecord) => p.id === qId)
          ) {
            setSelectedProgramId(qId);
            if (searchParams.get("id") && !preferId) {
              setTopTab("enrolled");
            }
          } else if (data.programs.length > 0) {
            setSelectedProgramId((prev) => prev || data.programs[0].id);
          }
        }
      } finally {
        setLoadingPrograms(false);
      }
    },
    [searchParams]
  );

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  // Fetch cascading children for `path` and place at `targetDepth`
  const fetchChildrenLevel = useCallback(
    async (
      targetCountry: string,
      targetDomain: AcademyDomain,
      targetInst: string,
      pathSoFar: string[],
      targetDepth: number,
      forceRefresh = false
    ) => {
      if (!targetInst) return;
      setLoadingLevelIdx(targetDepth);
      setError("");
      setPaperSyllabus(null);
      setPinnedProgramId(null);

      try {
        const res = await fetch("/api/academy/tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "children",
            country: targetCountry,
            domain: targetDomain,
            institution: targetInst,
            path: pathSoFar,
            forceRefresh,
          }),
        });
        const data: TreeChildrenPayload & { error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load options");

        const items = Array.isArray(data.items) ? data.items : [];
        setLevels((prev) => {
          const sliced = prev.slice(0, targetDepth);
          sliced.push({
            stepLabel: data.stepLabel || "Select Option",
            placeholder: data.placeholder || "Choose an option...",
            isPaperLevel: Boolean(data.isPaperLevel),
            items,
            selected: "",
            customValue: "",
          });
          return sliced;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load curriculum options"
        );
      } finally {
        setLoadingLevelIdx(null);
      }
    },
    []
  );

  // Fetch full official syllabus + chapters when a Paper/Course is selected
  const fetchPaperSyllabus = useCallback(
    async (
      targetCountry: string,
      targetDomain: AcademyDomain,
      targetInst: string,
      parentPath: string[],
      selectedPaper: string,
      targetLang: string,
      syllabusOverride = "",
      forceRefresh = false
    ) => {
      if (!selectedPaper) return;
      setLoadingSyllabus(true);
      setError("");
      setPinnedProgramId(null);

      try {
        const res = await fetch("/api/academy/tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "syllabus",
            country: targetCountry,
            domain: targetDomain,
            institution: targetInst,
            path: parentPath,
            paper: selectedPaper,
            language: targetLang,
            customSyllabusText: syllabusOverride,
            forceRefresh,
          }),
        });
        const data: PaperSyllabusPayload & { error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load paper syllabus");

        setPaperSyllabus(data);
        if (data.pedagogyStage) {
          setTeachingLevel(data.pedagogyStage);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load paper chapters"
        );
      } finally {
        setLoadingSyllabus(false);
      }
    },
    []
  );

  // When Country or Domain changes -> set default Institution (or auto-discover for unlisted countries!)
  useEffect(() => {
    if (country === "__custom__" && !customCountry.trim()) return;

    setLevels([]);
    setPaperSyllabus(null);
    setDynamicInstitutions([]);

    const presets = getPresetInstitutions(country, domain);
    if (presets.length > 0) {
      const firstInst = presets[0];
      setInstitution(firstInst);
      fetchChildrenLevel(effectiveCountry, domain, firstInst, [], 0);
    } else {
      // Auto-discover official institutions/boards/exams for ANY of the 195+ countries!
      let cancelled = false;
      setLoadingInstitutions(true);
      fetch("/api/academy/tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "institutions",
          country: effectiveCountry,
          domain,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          const fetched: string[] = Array.isArray(data.items) ? data.items : [];
          setDynamicInstitutions(fetched);
          if (fetched.length > 0) {
            setInstitution(fetched[0]);
            fetchChildrenLevel(effectiveCountry, domain, fetched[0], [], 0);
          } else {
            setInstitution("__custom__");
          }
        })
        .catch(() => {
          if (!cancelled) setInstitution("__custom__");
        })
        .finally(() => {
          if (!cancelled) setLoadingInstitutions(false);
        });

      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, domain]);

  // Handle selecting an option inside Dynamic Box `idx`
  function handleSelectDynamicLevel(idx: number, rawValue: string) {
    setLevels((prev) => {
      const next = prev.slice(0, idx + 1);
      next[idx] = { ...next[idx], selected: rawValue };
      return next;
    });
    setPaperSyllabus(null);

    if (!rawValue || rawValue === "__custom__") return;

    const currentBox = levels[idx];
    const priorSelections = levels
      .slice(0, idx)
      .map((l) =>
        l.selected === "__custom__" ? l.customValue.trim() : l.selected
      )
      .filter(Boolean);

    if (currentBox.isPaperLevel) {
      // Selected a concrete Course/Subject/Paper (e.g. MCS-211 or UPSC GS Paper II) -> Show all Chapters!
      fetchPaperSyllabus(
        effectiveCountry,
        domain,
        effectiveInstitution,
        priorSelections,
        rawValue,
        language,
        customSyllabusText
      );
    } else {
      // Drill down to next cascading box!
      fetchChildrenLevel(
        effectiveCountry,
        domain,
        effectiveInstitution,
        [...priorSelections, rawValue],
        idx + 1
      );
    }
  }

  function handleConfirmCustomLevel(idx: number) {
    const box = levels[idx];
    const val = box?.customValue.trim();
    if (!val) return;

    const priorSelections = levels
      .slice(0, idx)
      .map((l) =>
        l.selected === "__custom__" ? l.customValue.trim() : l.selected
      )
      .filter(Boolean);

    if (box.isPaperLevel) {
      fetchPaperSyllabus(
        effectiveCountry,
        domain,
        effectiveInstitution,
        priorSelections,
        val,
        language,
        customSyllabusText
      );
    } else {
      fetchChildrenLevel(
        effectiveCountry,
        domain,
        effectiveInstitution,
        [...priorSelections, val],
        idx + 1
      );
    }
  }

  async function handlePinCurrentPaper(): Promise<string | null> {
    if (!paperSyllabus) return null;
    if (pinnedProgramId) return pinnedProgramId;
    setPinning(true);
    try {
      const parentSelections = levels
        .slice(0, Math.max(0, levels.length - 1))
        .map((l) =>
          l.selected === "__custom__" ? l.customValue.trim() : l.selected
        )
        .filter(Boolean);
      const programLabel = parentSelections.join(" • ");

      const res = await fetch("/api/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pinPaperSyllabus: {
            country: effectiveCountry,
            domain,
            institution: effectiveInstitution,
            programLabel,
            paperSyllabus,
            language,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.program) {
        setPinnedProgramId(data.program.id);
        setPinToast(
          data.appended
            ? `Added "${paperSyllabus.paperTitle}" to ${data.program.title}!`
            : `Saved "${paperSyllabus.paperTitle}" to My Enrolled Syllabi!`
        );
        await loadPrograms(data.program.id);
        setTimeout(() => setPinToast(""), 4000);
        return data.program.id as string;
      }
    } catch {
      // Guest user not logged in yet -> Classroom will prompt sign-in cleanly
    } finally {
      setPinning(false);
    }
    return null;
  }

  // Launch Full-Chapter Comprehensive Teaching on the Live Voice Blackboard!
  function launchFullChapterTeaching(params: {
    chapterNumber: number;
    chapterTitle: string;
    syllabusTopics: string[];
    paperName: string;
    curriculumLabel: string;
    modeOverride?: string;
    levelOverride?: string;
    langOverride?: string;
    programId?: string;
    programTopicId?: string;
  }) {
    const outlineLines = params.syllabusTopics
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "ashuteacher_chapter_outline",
        outlineLines
      );
    }

    const activeMode = params.modeOverride || teachingMode;
    const activeLvl = params.levelOverride || teachingLevel;
    const activeLang = params.langOverride || language;

    const query = new URLSearchParams({
      topic: `Chapter ${params.chapterNumber}: ${params.chapterTitle} (${params.paperName})`,
      subject: params.paperName,
      mode: activeMode,
      level: activeLvl,
      lang: activeLang,
      curriculum: params.curriculumLabel,
      fullChapter: "1",
      autostart: "1",
    });

    if (params.programId) query.set("programId", params.programId);
    if (params.programTopicId) query.set("programTopicId", params.programTopicId);

    router.push(`/classroom?${query.toString()}`);
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
      const extracted = data.text || "";
      setCustomSyllabusText(extracted);

      // If paper is already chosen, refresh chapters using this uploaded official PDF!
      const lastLevel = levels[levels.length - 1];
      const chosenPaper =
        lastLevel?.selected === "__custom__"
          ? lastLevel.customValue.trim()
          : lastLevel?.selected;
      if (lastLevel?.isPaperLevel && chosenPaper) {
        const parentPath = levels
          .slice(0, levels.length - 1)
          .map((l) =>
            l.selected === "__custom__" ? l.customValue.trim() : l.selected
          )
          .filter(Boolean);
        fetchPaperSyllabus(
          effectiveCountry,
          domain,
          effectiveInstitution,
          parentPath,
          chosenPaper,
          language,
          extracted,
          true
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read syllabus PDF");
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleToggleEnrolledTopic(programId: string, topicId: string) {
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

  async function handleDeleteProgram(id: string) {
    if (!confirm("Remove this saved syllabus from your enrolled list?")) return;
    await fetch(`/api/academy/${id}`, { method: "DELETE" });
    const remaining = programs.filter((p) => p.id !== id);
    setPrograms(remaining);
    if (selectedProgramId === id) {
      setSelectedProgramId(remaining[0]?.id || null);
    }
  }

  // Active Enrolled Program Derived Data
  const activeProgram =
    programs.find((p) => p.id === selectedProgramId) || null;
  const enrolledSubjects: ProgramSubject[] = useMemo(() => {
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

  const enrolledExamPattern: ExamPatternInfo = useMemo(() => {
    if (!activeProgram) return {};
    try {
      return JSON.parse(activeProgram.examPatternJson || "{}");
    } catch {
      return {};
    }
  }, [activeProgram]);

  const currentEnrolledSubject =
    enrolledSubjects[activeSubjectIdx] || enrolledSubjects[0] || null;

  const explorerBreadcrumb = useMemo(() => {
    const parts = [effectiveCountry, effectiveInstitution];
    for (const lvl of levels) {
      const v =
        lvl.selected === "__custom__" ? lvl.customValue.trim() : lvl.selected;
      if (v) parts.push(v);
    }
    return parts.filter(Boolean);
  }, [effectiveCountry, effectiveInstitution, levels]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Header & Top Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
            <Globe2 className="h-3.5 w-3.5" />
            <span>195+ Countries • Universities (IGNOU, MIT...) • Boards (KG–12) • All Exams (UPSC, JEE, USMLE...)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Compass className="h-7 w-7 text-cyan-400" />
            <span>Universal Syllabus &amp; Course Explorer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Drill down step-by-step from Country → Institution/Exam → Level → Programme → Paper Code → Complete Chapters, and teach any entire chapter at once.
          </p>
        </div>

        <div className="inline-flex rounded-2xl border border-white/15 bg-slate-900 p-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setTopTab("explorer")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              topTab === "explorer"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🌍 Browse All Syllabi (Free)
          </button>
          <button
            type="button"
            onClick={() => setTopTab("enrolled")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              topTab === "enrolled"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            📚 My Saved Syllabi ({programs.length})
          </button>
        </div>
      </div>

      {pinToast && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-200">
          ✓ {pinToast}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: DYNAMIC MULTI-BOX CASCADING EXPLORER                          */}
      {/* ==================================================================== */}
      {topTab === "explorer" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan-400/25 bg-slate-900/90 p-5 sm:p-7 space-y-6 shadow-2xl">
            {/* Breadcrumb Trail */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 border-b border-white/10 pb-3.5">
              <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] mr-1">
                Active Path:
              </span>
              {explorerBreadcrumb.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
                  <span className="rounded-lg bg-slate-950 border border-white/10 px-2.5 py-1 text-slate-200 font-medium">
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* BOX 2: EDUCATION CATEGORY CARDS */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Choose Education Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: "UNIVERSITY" as const,
                    icon: GraduationCap,
                    title: "University & Open Univ.",
                    sub: "IGNOU, DU, IIT, MIT, Oxford — Cert, Diploma, UG, PG, PhD",
                  },
                  {
                    id: "SCHOOL_BOARD" as const,
                    icon: School,
                    title: "School Board (KG – 12)",
                    sub: "CBSE, ICSE, State Boards, IB, Cambridge, Common Core",
                  },
                  {
                    id: "COMPETITIVE_EXAM" as const,
                    icon: Trophy,
                    title: "Competitive Exams",
                    sub: "UPSC, JEE, NEET, GATE, OPSC, SAT, GRE, MCAT, Gaokao",
                  },
                  {
                    id: "CERTIFICATION" as const,
                    icon: Zap,
                    title: "Certifications & Skills",
                    sub: "AWS, Cloud, AI Engineering, CFA, PMP, Full-Stack",
                  },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const active = domain === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDomain(cat.id)}
                      className={`text-left rounded-2xl border p-3.5 transition cursor-pointer ${
                        active
                          ? "border-cyan-400 bg-cyan-500/15 shadow-md"
                          : "border-white/10 bg-slate-950/70 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-white">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active ? "text-cyan-300" : "text-slate-400"
                          }`}
                        />
                        <span>{cat.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {cat.sub}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CASCADING DROPDOWN GRID: COUNTRY -> INSTITUTION -> DYNAMIC LEVELS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* BOX: COUNTRY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  2. Select Country
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
                  <option value="__custom__">➕ Type Custom Country...</option>
                </select>
                {country === "__custom__" && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      placeholder="Enter country name..."
                      className="flex-1 rounded-xl border border-cyan-400/40 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customCountry.trim()) return;
                        setLoadingInstitutions(true);
                        fetch("/api/academy/tree", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "institutions",
                            country: customCountry.trim(),
                            domain,
                          }),
                        })
                          .then((r) => r.json())
                          .then((d) => {
                            const list = Array.isArray(d.items) ? d.items : [];
                            setDynamicInstitutions(list);
                            if (list[0]) {
                              setInstitution(list[0]);
                              fetchChildrenLevel(
                                customCountry.trim(),
                                domain,
                                list[0],
                                [],
                                0
                              );
                            }
                          })
                          .finally(() => setLoadingInstitutions(false));
                      }}
                      className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                )}
              </div>

              {/* BOX: INSTITUTION / BOARD / EXAM */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    3.{" "}
                    {domain === "UNIVERSITY"
                      ? "Select University / Institute"
                      : domain === "SCHOOL_BOARD"
                      ? "Select School Board"
                      : domain === "COMPETITIVE_EXAM"
                      ? "Select Competitive Exam"
                      : "Select Certification Body"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLoadingInstitutions(true);
                      fetch("/api/academy/tree", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "institutions",
                          country: effectiveCountry,
                          domain,
                          forceRefresh: true,
                        }),
                      })
                        .then((r) => r.json())
                        .then((d) => {
                          if (Array.isArray(d.items)) {
                            setDynamicInstitutions(d.items);
                          }
                        })
                        .finally(() => setLoadingInstitutions(false));
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-cyan-300 cursor-pointer"
                    title="Discover more official institutions in this country"
                  >
                    {loadingInstitutions ? (
                      <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                    )}
                    <span>More</span>
                  </button>
                </div>

                <select
                  value={institution}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInstitution(val);
                    setLevels([]);
                    setPaperSyllabus(null);
                    if (val && val !== "__custom__") {
                      fetchChildrenLevel(effectiveCountry, domain, val, [], 0);
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                >
                  {institutionOptions.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                  <option value="__custom__">
                    ➕ Other (Type Any University, Board, or Exam...)
                  </option>
                </select>

                {institution === "__custom__" && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={customInstitution}
                      onChange={(e) => setCustomInstitution(e.target.value)}
                      placeholder="Type university, board, or exam name..."
                      className="flex-1 rounded-xl border border-cyan-400/40 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customInstitution.trim()) {
                          fetchChildrenLevel(
                            effectiveCountry,
                            domain,
                            customInstitution.trim(),
                            [],
                            0
                          );
                        }
                      }}
                      className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* DYNAMIC CASCADING BOXES (Box 4 -> Box 5 -> Box 6) */}
              {levels.map((lvl, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      {lvl.stepLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const prior = levels
                          .slice(0, idx)
                          .map((l) =>
                            l.selected === "__custom__"
                              ? l.customValue.trim()
                              : l.selected
                          )
                          .filter(Boolean);
                        fetchChildrenLevel(
                          effectiveCountry,
                          domain,
                          effectiveInstitution,
                          prior,
                          idx,
                          true
                        );
                      }}
                      className="text-[10px] text-slate-500 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                      title="Refresh official list"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>

                  <select
                    value={lvl.selected}
                    onChange={(e) => handleSelectDynamicLevel(idx, e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none ${
                      lvl.selected
                        ? "border-cyan-400/40 bg-slate-950"
                        : "border-amber-400/50 bg-slate-950 ring-1 ring-amber-400/20"
                    }`}
                  >
                    <option value="">
                      — {lvl.placeholder || `Choose ${lvl.stepLabel}`} ({lvl.items.length}) —
                    </option>
                    {lvl.items.map((item) => (
                      <option key={item.id + item.label} value={item.label}>
                        {item.label}
                        {item.badge ? ` [${item.badge}]` : ""}
                      </option>
                    ))}
                    <option value="__custom__">
                      ➕ Not listed? Type exact code / name...
                    </option>
                  </select>

                  {lvl.selected === "__custom__" && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={lvl.customValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLevels((prev) =>
                            prev.map((box, bIdx) =>
                              bIdx === idx ? { ...box, customValue: val } : box
                            )
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleConfirmCustomLevel(idx);
                          }
                        }}
                        placeholder="e.g., MCS-226, Odia Optional Paper I..."
                        className="flex-1 rounded-xl border border-cyan-400/40 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleConfirmCustomLevel(idx)}
                        className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Skeleton for Next Cascading Box */}
              {loadingLevelIdx !== null && (
                <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-4 flex items-center gap-3 text-xs text-cyan-200">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400 shrink-0" />
                  <span>Loading official programs / papers...</span>
                </div>
              )}
            </div>

            {/* Optional Custom Syllabus PDF Upload */}
            <details className="rounded-2xl border border-white/10 bg-slate-950/50 p-3.5">
              <summary className="cursor-pointer text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  Optional: Upload Official Course / Exam Syllabus PDF (if your institution revised its syllabus)
                </span>
                {syllabusFileName && (
                  <span className="text-emerald-300 ml-2">✓ {syllabusFileName}</span>
                )}
              </summary>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 cursor-pointer">
                  {uploadingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  <span>{uploadingPdf ? "Extracting PDF..." : "Choose Syllabus PDF"}</span>
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
                  Uploading automatically restructures the selected paper&apos;s chapters around your official PDF.
                </span>
              </div>
            </details>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">
                {error}
              </div>
            )}
          </div>

          {/* ==================================================================== */}
          {/* DISPLAYED PAPER SYLLABUS & CHAPTERS + LEARNER TEACHING PREFERENCES   */}
          {/* ==================================================================== */}
          {loadingSyllabus && (
            <div className="rounded-3xl border border-cyan-400/30 bg-slate-900/80 p-12 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
              <div className="text-sm font-bold text-white">
                Loading Official Syllabus Blocks, Units &amp; Chapters...
              </div>
              <p className="text-xs text-slate-400">
                Organizing every chapter and sub-topic for full-chapter Voice Blackboard teaching (cached for instant future access).
              </p>
            </div>
          )}

          {!loadingSyllabus && paperSyllabus && (
            <div className="space-y-5">
              {/* Paper Header + Learner Teaching Controls */}
              <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 p-6 space-y-5 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-cyan-300">
                      {paperSyllabus.paperCode && (
                        <span className="rounded-md bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.5 font-mono">
                          {paperSyllabus.paperCode}
                        </span>
                      )}
                      <span>{explorerBreadcrumb.slice(0, -1).join(" • ")}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {paperSyllabus.paperTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
                      {paperSyllabus.overview}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePinCurrentPaper}
                    disabled={pinning || Boolean(pinnedProgramId)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                      pinnedProgramId
                        ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg hover:brightness-110"
                    }`}
                  >
                    {pinning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4" />
                    )}
                    <span>
                      {pinnedProgramId
                        ? "Saved in My Syllabi ✓"
                        : "Save Paper to My Enrolled Syllabi (Free)"}
                    </span>
                  </button>
                </div>

                {/* Official Marking & Exam Pattern */}
                {paperSyllabus.examPattern?.markingScheme && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/10">
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        Duration &amp; Credits / Marks
                      </div>
                      <div className="text-slate-200 font-medium mt-0.5">
                        {paperSyllabus.examPattern.duration} •{" "}
                        {paperSyllabus.examPattern.totalMarks}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        Evaluation / Marking Pattern
                      </div>
                      <div className="text-slate-200 font-medium mt-0.5">
                        {paperSyllabus.examPattern.markingScheme}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950/70 border border-white/5 p-3">
                      <div className="text-[10px] uppercase text-amber-300 font-bold flex items-center gap-1">
                        <Award className="h-3 w-3" /> Exam Strategy
                      </div>
                      <div className="text-slate-200 font-medium mt-0.5">
                        {paperSyllabus.examPattern.keyStrategy}
                      </div>
                    </div>
                  </div>
                )}

                {/* LEARNER-SELECTED TEACHING CONTROLS */}
                <div className="rounded-2xl border border-cyan-400/25 bg-slate-950/85 p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      Your Chapter Teaching Preferences (Applied When You Click &ldquo;Teach Entire Chapter&rdquo;)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Learner's Chosen Teaching Style */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Teaching Style
                      </label>
                      <select
                        value={teachingMode}
                        onChange={(e) => setTeachingMode(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      >
                        {TEACHING_MODES.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label} — {m.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Learner's Chosen Language & Derived Script */}
                    <div>
                      <LanguageSelector
                        value={language}
                        onChange={setLanguage}
                        label="Teaching Language & Script"
                      />
                    </div>

                    {/* 3. Learner's Chosen Depth / Rigor */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Academic Depth
                      </label>
                      <select
                        value={teachingLevel}
                        onChange={(e) => setTeachingLevel(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      >
                        {STUDENT_LEVELS.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.label} — {lvl.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCKS / UNITS -> ALL CHAPTERS DISPLAYED */}
              <div className="space-y-5">
                {(paperSyllabus.units || []).map((unit) => (
                  <div
                    key={unit.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/75 overflow-hidden"
                  >
                    <div className="border-b border-white/10 bg-slate-950/85 px-5 py-3.5 flex items-center justify-between">
                      <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{unit.unitTitle}</span>
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {(unit.chapters || []).length} Chapters
                      </span>
                    </div>

                    <div className="divide-y divide-white/10">
                      {(unit.chapters || []).map((ch) => {
                        const curriculumLabel = explorerBreadcrumb.join(" • ");
                        return (
                          <div
                            key={ch.id}
                            className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.015] transition"
                          >
                            <div className="space-y-2 max-w-3xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-xs font-extrabold text-cyan-300">
                                  Chapter {ch.chapterNumber}
                                </span>
                                <h4 className="font-bold text-base text-white">
                                  {ch.title}
                                </h4>
                                {ch.weightage && (
                                  <span className="rounded-md bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                    {ch.weightage}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                  <Clock className="h-3 w-3" />
                                  {ch.estimatedMinutes} min full lecture
                                </span>
                              </div>

                              <p className="text-xs text-slate-300">
                                {ch.summary}
                              </p>

                              {/* Complete Official Syllabus Topics Covered in This Chapter */}
                              {Array.isArray(ch.syllabusTopics) &&
                                ch.syllabusTopics.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {ch.syllabusTopics.map((st, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="rounded-lg border border-white/10 bg-slate-950/90 px-2.5 py-1 text-[11px] text-slate-300"
                                      >
                                        {sIdx + 1}. {st}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* TEACH ENTIRE CHAPTER + QUIZ + 3D CARDS */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={async () => {
                                  const progId = await handlePinCurrentPaper();
                                  launchFullChapterTeaching({
                                    chapterNumber: ch.chapterNumber,
                                    chapterTitle: ch.title,
                                    syllabusTopics: ch.syllabusTopics || [ch.summary],
                                    paperName: paperSyllabus.paperTitle,
                                    curriculumLabel,
                                    programId: progId || undefined,
                                  });
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 transition cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                <span>Teach Entire Chapter</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    tab: "quizzes",
                                    topic: `Chapter ${ch.chapterNumber}: ${ch.title} (${paperSyllabus.paperTitle} — ${effectiveInstitution})`,
                                    level: teachingLevel,
                                    lang: language,
                                  });
                                  router.push(`/practice?${params.toString()}`);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                              >
                                <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Quiz</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    tab: "flashcards",
                                    topic: `Chapter ${ch.chapterNumber}: ${ch.title} (${paperSyllabus.paperTitle})`,
                                    lang: language,
                                  });
                                  router.push(`/practice?${params.toString()}`);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Layers className="h-3.5 w-3.5 text-amber-400" />
                                <span>3D Cards</span>
                              </button>
                            </div>
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
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MY SAVED / ENROLLED SYLLABI & PROGRESS TRACKER                */}
      {/* ==================================================================== */}
      {topTab === "enrolled" && (
        <div>
          {loadingPrograms ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Loading your saved syllabi...
            </div>
          ) : programs.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-10 text-center space-y-4">
              <Compass className="h-10 w-10 text-cyan-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">
                No Saved Syllabi Yet
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Use the Universal Syllabus Explorer to pick any Country, University (e.g., IGNOU MCA MCS-211), School Board, or Competitive Exam (e.g., UPSC GS-II), and click &ldquo;Save Paper&rdquo; or &ldquo;Teach Entire Chapter&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setTopTab("explorer")}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 cursor-pointer"
              >
                <span>Open Syllabus Explorer</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Switcher */}
              <div className="lg:col-span-3 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Enrolled Programmes ({programs.length})
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
                      className={`group rounded-2xl border p-4 transition cursor-pointer ${
                        isSelected
                          ? "border-cyan-400/50 bg-slate-900 shadow-lg"
                          : "border-white/10 bg-slate-900/50 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                          {prog.country}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProgram(prog.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <h3 className="mt-2 font-bold text-sm text-white line-clamp-2">
                        {prog.title}
                      </h3>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Chapter Mastery</span>
                          <span className="font-bold text-cyan-300">
                            {prog.progressPercent}%
                          </span>
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

              {/* Right Enrolled Chapters View */}
              {activeProgram && (
                <div className="lg:col-span-9 space-y-5">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-cyan-300">
                          {activeProgram.country} • {activeProgram.boardOrBody}
                        </div>
                        <h2 className="text-xl font-extrabold text-white mt-0.5">
                          {activeProgram.title}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {activeProgram.overview}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-center">
                        <div className="text-2xl font-extrabold text-cyan-300">
                          {activeProgram.progressPercent}%
                        </div>
                        <div className="text-[10px] uppercase text-slate-300">
                          Completed
                        </div>
                      </div>
                    </div>

                    {enrolledExamPattern.markingScheme && (
                      <div className="text-xs text-slate-400 border-t border-white/10 pt-3">
                        <strong className="text-slate-200">Exam Pattern:</strong>{" "}
                        {enrolledExamPattern.markingScheme}
                      </div>
                    )}

                    {/* Teaching Mode & Language Selector for Saved Syllabus */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          Teaching Style
                        </label>
                        <select
                          value={teachingMode}
                          onChange={(e) => setTeachingMode(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                        >
                          {TEACHING_MODES.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <LanguageSelector
                          value={language}
                          onChange={setLanguage}
                          label="Teaching Language & Script"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paper / Subject Tabs inside Saved Programme */}
                  {enrolledSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {enrolledSubjects.map((subj, idx) => (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => setActiveSubjectIdx(idx)}
                          className={`rounded-xl border px-4 py-2 text-xs font-bold transition cursor-pointer ${
                            idx === activeSubjectIdx
                              ? "border-cyan-400 bg-cyan-500 text-slate-950"
                              : "border-white/10 bg-slate-900 text-slate-200 hover:border-white/25"
                          }`}
                        >
                          {subj.code ? `${subj.code}: ` : ""}
                          {subj.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Units & Chapters */}
                  {currentEnrolledSubject && (
                    <div className="space-y-4">
                      {(currentEnrolledSubject.units || []).map((unit) => (
                        <div
                          key={unit.id}
                          className="rounded-2xl border border-white/10 bg-slate-900/70 overflow-hidden"
                        >
                          <div className="border-b border-white/10 bg-slate-950/80 px-5 py-3 font-bold text-sm text-cyan-300">
                            {unit.title}
                          </div>
                          <div className="divide-y divide-white/10">
                            {(unit.chapters || []).map((ch) => {
                              const primaryTopic = ch.topics?.[0];
                              const topicId = primaryTopic?.id || ch.id;
                              const isDone = completedTopics.includes(topicId);
                              const subTopicsList = primaryTopic?.summary
                                ? primaryTopic.summary.split(" • ").filter(Boolean)
                                : (ch.topics || []).map((t) => t.title);

                              return (
                                <div
                                  key={ch.id}
                                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleEnrolledTopic(
                                          activeProgram.id,
                                          topicId
                                        )
                                      }
                                      className="mt-1 text-slate-400 hover:text-emerald-400 cursor-pointer"
                                    >
                                      {isDone ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                      ) : (
                                        <Circle className="h-5 w-5" />
                                      )}
                                    </button>
                                    <div>
                                      <div className="font-bold text-sm text-white">
                                        Ch {ch.chapterNumber}: {ch.title}
                                      </div>
                                      <p className="text-xs text-slate-400 mt-0.5">
                                        {ch.summary}
                                      </p>
                                      {subTopicsList.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {subTopicsList.map((st, idx) => (
                                            <span
                                              key={idx}
                                              className="rounded bg-slate-950 border border-white/10 px-2 py-0.5 text-[11px] text-slate-300"
                                            >
                                              {st}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      launchFullChapterTeaching({
                                        chapterNumber: ch.chapterNumber,
                                        chapterTitle: ch.title,
                                        syllabusTopics:
                                          subTopicsList.length > 0
                                            ? subTopicsList
                                            : [ch.title],
                                        paperName: currentEnrolledSubject.name,
                                        curriculumLabel: `${activeProgram.country} • ${activeProgram.boardOrBody} • ${activeProgram.gradeOrExam}`,
                                        levelOverride: activeProgram.pedagogyStage,
                                        programId: activeProgram.id,
                                        programTopicId: topicId,
                                      })
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shrink-0 cursor-pointer"
                                  >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>Teach Entire Chapter</span>
                                  </button>
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
      )}
    </div>
  );
}

export default function AcademyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          Loading Universal Syllabus Explorer...
        </div>
      }
    >
      <AcademyInner />
    </Suspense>
  );
}
