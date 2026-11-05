"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Play,
  Save,
  Trash2,
  MessageSquareWarning,
  Send,
  RotateCcw,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import {
  RESEARCH_DOMAINS,
  RESEARCH_TIERS,
  ResearchBlueprint,
} from "@/lib/global-catalog";
import { apiFetch, getStoredModel } from "@/lib/client-api";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ResearchProjectRecord {
  id: string;
  title: string;
  tier: string;
  domain: string;
  language: string;
  problemStatement: string;
  blueprintJson: string;
  completedStagesJson: string;
  stageNotesJson: string;
  vivaHistoryJson: string;
  progressPercent: number;
  createdAt: string;
}

export default function ResearchLabPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ResearchProjectRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [viewTab, setViewTab] = useState<"milestones" | "viva">("milestones");
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  // Creator form
  const [tier, setTier] = useState<string>(RESEARCH_TIERS[1].id);
  const [domain, setDomain] = useState<string>(RESEARCH_DOMAINS[0]);
  const [ideaOrTopic, setIdeaOrTopic] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Active workspace states
  const [noteDraft, setNoteDraft] = useState("");
  const [mentorPrompt, setMentorPrompt] = useState("");
  const [mentoring, setMentoring] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [vivaInput, setVivaInput] = useState("");
  const [vivaLoading, setVivaLoading] = useState(false);

  async function loadProjects(preferId?: string | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/research");
      const data = await res.json();
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (preferId && data.projects.some((p: ResearchProjectRecord) => p.id === preferId)) {
          setSelectedId(preferId);
        } else if (data.projects.length > 0) {
          setSelectedId((prev) => prev || data.projects[0].id);
        } else {
          setShowCreator(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const activeProject = projects.find((p) => p.id === selectedId) || null;

  const blueprint: ResearchBlueprint | null = useMemo(() => {
    if (!activeProject) return null;
    try {
      return JSON.parse(activeProject.blueprintJson || "{}");
    } catch {
      return null;
    }
  }, [activeProject]);

  const completedStages: string[] = useMemo(() => {
    if (!activeProject) return [];
    try {
      return JSON.parse(activeProject.completedStagesJson || "[]");
    } catch {
      return [];
    }
  }, [activeProject]);

  const stageNotes: Record<string, string> = useMemo(() => {
    if (!activeProject) return {};
    try {
      return JSON.parse(activeProject.stageNotesJson || "{}");
    } catch {
      return {};
    }
  }, [activeProject]);

  const vivaHistory: Array<{ role: "examiner" | "candidate"; content: string }> =
    useMemo(() => {
      if (!activeProject) return [];
      try {
        return JSON.parse(activeProject.vivaHistoryJson || "[]");
      } catch {
        return [];
      }
    }, [activeProject]);

  const currentStage = blueprint?.stages?.[activeStageIdx] || null;

  useEffect(() => {
    if (currentStage) {
      setNoteDraft(stageNotes[currentStage.id] || "");
    }
  }, [currentStage, stageNotes]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!ideaOrTopic.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          domain,
          ideaOrTopic: ideaOrTopic.trim(),
          language,
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate research blueprint");
      setIdeaOrTopic("");
      setShowCreator(false);
      setActiveStageIdx(0);
      await loadProjects(data.project.id);
      setSelectedId(data.project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStage(stageId: string) {
    if (!activeProject) return;
    const res = await fetch(`/api/research/${activeProject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleStageId: stageId }),
    });
    if (res.ok) {
      const data = await res.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === activeProject.id ? data.project : p))
      );
    }
  }

  async function handleSaveNote() {
    if (!activeProject || !currentStage) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/research/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saveStageNote: { stageId: currentStage.id, content: noteDraft },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === activeProject.id ? data.project : p))
        );
      }
    } finally {
      setSavingNote(false);
    }
  }

  async function handleAskMentor() {
    if (!activeProject || !currentStage) return;
    setMentoring(true);
    try {
      // Save current note edits first if changed
      if (noteDraft !== (stageNotes[currentStage.id] || "")) {
        await fetch(`/api/research/${activeProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            saveStageNote: { stageId: currentStage.id, content: noteDraft },
          }),
        });
      }

      const res = await apiFetch(`/api/research/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorStageId: currentStage.id,
          customPrompt: mentorPrompt.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        setMentorPrompt("");
        setProjects((prev) =>
          prev.map((p) => (p.id === activeProject.id ? data.project : p))
        );
      }
    } finally {
      setMentoring(false);
    }
  }

  async function handleVivaSend(resetViva = false) {
    if (!activeProject) return;
    if (!resetViva && vivaHistory.length > 0 && !vivaInput.trim()) return;
    setVivaLoading(true);
    try {
      const res = await apiFetch(`/api/research/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vivaAction: true,
          resetViva,
          candidateAnswer: resetViva ? "" : vivaInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.project) {
        setVivaInput("");
        setProjects((prev) =>
          prev.map((p) => (p.id === activeProject.id ? data.project : p))
        );
      }
    } finally {
      setVivaLoading(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Delete this research/project workspace?")) return;
    await fetch(`/api/research/${id}`, { method: "DELETE" });
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id || null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-300 mb-2">
            <FlaskConical className="h-3.5 w-3.5" />
            <span>School Fair → B.Tech Capstone → MIT / PhD Frontier Research</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <FlaskConical className="h-7 w-7 text-violet-400" />
            <span>Project, Thesis &amp; Research Lab</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Structured 6-milestone scientific &amp; engineering mentorship, system architecture, IEEE/thesis drafting, and AI Viva Defense Simulator.
          </p>
        </div>

        <button
          onClick={() => setShowCreator((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{showCreator ? "Close Project Wizard" : "New Project / Research Blueprint"}</span>
        </button>
      </div>

      {/* CREATOR WIZARD */}
      {showCreator && (
        <form
          onSubmit={handleCreateProject}
          className="rounded-3xl border border-violet-400/30 bg-slate-900/90 p-5 sm:p-7 space-y-5 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-sm font-bold text-violet-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Architect a New Structured Project or Research Thesis (3 Credits)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RESEARCH_TIERS.map((rt) => {
              const active = tier === rt.id;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setTier(rt.id)}
                  className={`text-left rounded-2xl border p-3.5 transition cursor-pointer ${
                    active
                      ? "border-violet-400 bg-violet-500/15"
                      : "border-white/10 bg-slate-950/70 hover:border-white/25"
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-white">
                    {rt.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{rt.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Research / Engineering Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
              >
                {RESEARCH_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <LanguageSelector
                value={language}
                onChange={setLanguage}
                label="Research & Mentorship Language"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Your Project Idea, Thesis Topic, or Open Research Problem
            </label>
            <textarea
              rows={3}
              value={ideaOrTopic}
              onChange={(e) => setIdeaOrTopic(e.target.value)}
              placeholder="e.g., Low-cost solar water purifier model for Class 9 science fair — OR — Physics-informed neural networks for turbulent fluid flow at MIT research depth..."
              className="w-full rounded-xl border border-white/15 bg-slate-950 p-3.5 text-sm text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCreator(false)}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Structuring 6-Stage Research Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Research &amp; Project Lab</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MAIN WORKSPACE */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">
          Loading Research &amp; Project Lab...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-10 text-center space-y-3">
          <FlaskConical className="h-10 w-10 text-violet-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">
            Start a Guided School Project, Engineering Capstone, or PhD Thesis
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Describe any topic above to get a complete 6-stage research architecture, 1-click prerequisite lessons on the Voice Blackboard, AI Principal Investigator drafts, and an interactive Viva Voce examiner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Switcher */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              My Research &amp; Projects ({projects.length})
            </div>
            {projects.map((p) => {
              const active = p.id === activeProject?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setActiveStageIdx(0);
                  }}
                  className={`group rounded-2xl border p-4 transition cursor-pointer ${
                    active
                      ? "border-violet-400/50 bg-slate-900 shadow-lg"
                      : "border-white/10 bg-slate-900/50 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                      {p.tier}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="mt-2 font-bold text-sm text-white line-clamp-2">
                    {p.title}
                  </h3>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Milestones</span>
                      <span className="text-violet-300 font-bold">{p.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        style={{ width: `${p.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Workspace */}
          {activeProject && blueprint && (
            <div className="lg:col-span-9 space-y-5">
              {/* Overview Card + Prerequisite Blackboard Launcher */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30 p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-violet-300">
                      {activeProject.tier} • {activeProject.domain}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {activeProject.title}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Abstract / Executive Framing
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {blueprint.abstractDraft}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-3.5">
                    <div className="text-[10px] font-bold uppercase text-violet-300 mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> Core Hypothesis &amp; Novelty
                    </div>
                    <p className="text-slate-200 leading-relaxed">
                      {blueprint.noveltyHypothesis}
                    </p>
                  </div>
                </div>

                {/* Prerequisite Concepts -> 1-Click Voice Blackboard */}
                {Array.isArray(blueprint.prerequisiteTopics) &&
                  blueprint.prerequisiteTopics.length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                        <span>
                          Foundational Prerequisites (Click any concept to master it on the Live Voice Blackboard):
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {blueprint.prerequisiteTopics.map((prereq) => (
                          <button
                            key={prereq}
                            type="button"
                            onClick={() => {
                              const matchedTier = RESEARCH_TIERS.find(
                                (t) => t.id === activeProject.tier
                              );
                              const params = new URLSearchParams({
                                topic: `${prereq} (for ${activeProject.title})`,
                                subject: activeProject.domain,
                                mode: "lesson",
                                level: matchedTier?.pedagogyLevel || "Expert",
                                lang: activeProject.language,
                                autostart: "1",
                              });
                              router.push(`/classroom?${params.toString()}`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 transition cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-current text-cyan-400" />
                            <span>{prereq}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Mode Switcher: 6-Stage Milestones vs Viva Defense Simulator */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setViewTab("milestones")}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    viewTab === "milestones"
                      ? "bg-violet-500 text-white shadow-md"
                      : "border border-white/10 bg-slate-900 text-slate-300 hover:text-white"
                  }`}
                >
                  6-Stage Research &amp; Build Milestones
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab("viva")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    viewTab === "viva"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "border border-amber-400/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
                  }`}
                >
                  <MessageSquareWarning className="h-3.5 w-3.5" />
                  <span>Viva Voce / Committee Defense Simulator</span>
                </button>
              </div>

              {viewTab === "milestones" && currentStage && (
                <div className="space-y-4">
                  {/* Stage Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {(blueprint.stages || []).map((st, idx) => {
                      const done = completedStages.includes(st.id);
                      const active = idx === activeStageIdx;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setActiveStageIdx(idx)}
                          className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                            active
                              ? "border-violet-400 bg-violet-500/20"
                              : done
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-white/10 bg-slate-900/70 hover:border-white/25"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>STAGE {st.stageNumber}</span>
                            {done ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-slate-600" />
                            )}
                          </div>
                          <div className="mt-1 text-xs font-bold text-white line-clamp-2">
                            {st.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Stage Card */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="text-xs font-bold text-violet-300">
                          Milestone {currentStage.stageNumber} of 6
                        </div>
                        <h3 className="text-lg font-extrabold text-white">
                          {currentStage.title}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          {currentStage.objective}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStage(currentStage.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                          completedStages.includes(currentStage.id)
                            ? "bg-emerald-500 text-slate-950"
                            : "border border-white/15 bg-slate-950 text-slate-200 hover:border-emerald-400"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {completedStages.includes(currentStage.id)
                            ? "Milestone Completed"
                            : "Mark Stage Complete"}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3.5 space-y-1.5">
                        <div className="font-bold text-emerald-300 uppercase text-[10px]">
                          Expected Deliverables
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {(currentStage.deliverables || []).map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3.5 space-y-1.5">
                        <div className="font-bold text-cyan-300 uppercase text-[10px]">
                          Key Research Questions
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {(currentStage.guidingQuestions || []).map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-slate-950/70 p-3.5 space-y-1.5">
                        <div className="font-bold text-amber-300 uppercase text-[10px]">
                          Suggested Tools &amp; Methods
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {(currentStage.suggestedMethods || []).map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* AI Principal Investigator Co-Author Bar */}
                    <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 space-y-3">
                      <div className="text-xs font-bold text-violet-200 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-violet-300" />
                        <span>
                          AI Principal Investigator Mentor — Generate Architecture, Math Formulation, or Section Draft (1 Credit)
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={mentorPrompt}
                          onChange={(e) => setMentorPrompt(e.target.value)}
                          placeholder={`Optional specific instruction for ${currentStage.title} (or leave blank for complete draft)...`}
                          className="flex-1 rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAskMentor}
                          disabled={mentoring}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white hover:bg-violet-400 disabled:opacity-60 cursor-pointer"
                        >
                          {mentoring ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Drafting...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Generate Stage Blueprint</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Researcher Notebook + Rendered Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Stage Lab Notebook &amp; Drafts (Markdown + LaTeX Supported)
                        </label>
                        <button
                          type="button"
                          onClick={handleSaveNote}
                          disabled={savingNote}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 cursor-pointer"
                        >
                          <Save className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{savingNote ? "Saving..." : "Save Notes (Free)"}</span>
                        </button>
                      </div>

                      <textarea
                        rows={6}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Write your equations, observations, code architecture, or click 'Generate Stage Blueprint' above..."
                        className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-violet-400 focus:outline-none"
                      />

                      {noteDraft.trim() && (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Rendered Academic Preview (Equations &amp; Diagrams)
                          </div>
                          <MarkdownRenderer content={noteDraft} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIVA VOCE / COMMITTEE DEFENSE TAB */}
              {viewTab === "viva" && (
                <div className="rounded-3xl border border-amber-400/30 bg-slate-900/85 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">
                        AI Viva Voce &amp; Thesis Defense Simulator
                      </h3>
                      <p className="text-xs text-slate-400">
                        Practice defending your methodology, edge cases, and novelty before a live examiner calibrated to {activeProject.tier}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVivaSend(true)}
                      disabled={vivaLoading}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
                    >
                      {vivaLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {vivaHistory.length === 0
                          ? "Start Live Viva Defense (1 Credit)"
                          : "Restart Defense Session"}
                      </span>
                    </button>
                  </div>

                  {/* Sample Defense Questions */}
                  {Array.isArray(blueprint.sampleVivaQuestions) &&
                    blueprint.sampleVivaQuestions.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                        <div className="text-[11px] font-bold uppercase text-amber-300">
                          Key Questions Your Committee Will Expect You to Master:
                        </div>
                        <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-300">
                          {blueprint.sampleVivaQuestions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                  {/* Transcript */}
                  {vivaHistory.length > 0 && (
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {vivaHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-2xl p-4 text-xs ${
                            msg.role === "examiner"
                              ? "border border-amber-400/30 bg-amber-500/10 text-slate-100"
                              : "border border-cyan-400/30 bg-cyan-500/10 text-cyan-100 ml-6"
                          }`}
                        >
                          <div className="font-bold uppercase text-[10px] mb-1.5 text-amber-300">
                            {msg.role === "examiner"
                              ? "🎓 Defense Committee Chair"
                              : "🧑‍🔬 Your Defense Response"}
                          </div>
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      ))}
                    </div>
                  )}

                  {vivaHistory.length > 0 && (
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={vivaInput}
                        onChange={(e) => setVivaInput(e.target.value)}
                        placeholder="Defend your design, equations, or experimental choice..."
                        className="flex-1 rounded-xl border border-white/15 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleVivaSend(false)}
                        disabled={vivaLoading || !vivaInput.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                      >
                        {vivaLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span>Defend</span>
                      </button>
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
