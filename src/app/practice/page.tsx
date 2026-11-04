"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BrainCircuit,
  Layers,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Trash2,
  Sparkles,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  FlashcardItem,
  QuizQuestion,
  STUDENT_LEVELS,
} from "@/lib/constants";
import { apiFetch, getStoredModel } from "@/lib/client-api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { LanguageSelector } from "@/components/LanguageSelector";

interface QuizRecord {
  id: string;
  title: string;
  topic: string;
  level: string;
  language: string;
  questionsJson: string;
  totalQuestions: number;
  bestScore: number;
  attemptsCount: number;
  createdAt: string;
}

interface FlashcardSetRecord {
  id: string;
  title: string;
  topic: string;
  language: string;
  cardsJson: string;
  totalCards: number;
  masteredCount: number;
}

function PracticeInner() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"quizzes" | "flashcards">("quizzes");

  // Quizzes state
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [quizTopic, setQuizTopic] = useState("");
  const [quizCount, setQuizCount] = useState(10);
  const [quizLevel, setQuizLevel] = useState("Intermediate");
  const [quizLang, setQuizLang] = useState("en-US");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Flashcards state
  const [decks, setDecks] = useState<FlashcardSetRecord[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [creatingDeck, setCreatingDeck] = useState(false);
  const [deckTopic, setDeckTopic] = useState("");
  const [deckCount, setDeckCount] = useState(12);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  async function loadAll(preferQuizId?: string | null, preferDeckId?: string | null) {
    const [qRes, fRes] = await Promise.all([
      fetch("/api/quizzes").then((r) => r.json()),
      fetch("/api/flashcards").then((r) => r.json()),
    ]);

    if (Array.isArray(qRes.quizzes)) {
      setQuizzes(qRes.quizzes);
      const qid = preferQuizId || searchParams.get("quizId");
      if (qid && qRes.quizzes.some((q: QuizRecord) => q.id === qid)) {
        setActiveQuizId(qid);
      } else if (qRes.quizzes.length > 0 && !activeQuizId) {
        setActiveQuizId(qRes.quizzes[0].id);
      }
    }

    if (Array.isArray(fRes.flashcardSets)) {
      setDecks(fRes.flashcardSets);
      const did = preferDeckId || searchParams.get("deckId");
      if (did && fRes.flashcardSets.some((d: FlashcardSetRecord) => d.id === did)) {
        setActiveDeckId(did);
      } else if (fRes.flashcardSets.length > 0 && !activeDeckId) {
        setActiveDeckId(fRes.flashcardSets[0].id);
      }
    }
  }

  useEffect(() => {
    const qTab = searchParams.get("tab");
    if (qTab === "flashcards") setActiveTab("flashcards");
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Reset runner when switching quiz
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [activeQuizId]);

  useEffect(() => {
    setCardIndex(0);
    setFlipped(false);
    setShowHint(false);
  }, [activeDeckId]);

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!quizTopic.trim()) return;
    setCreatingQuiz(true);
    setQuizError("");
    try {
      const res = await apiFetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic.trim(),
          questionCount: quizCount,
          level: quizLevel,
          language: quizLang,
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      setQuizTopic("");
      await loadAll(data.quiz.id, null);
      setActiveQuizId(data.quiz.id);
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : "Error creating quiz");
    } finally {
      setCreatingQuiz(false);
    }
  }

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || null;
  const activeQuestions: QuizQuestion[] = activeQuiz
    ? JSON.parse(activeQuiz.questionsJson || "[]")
    : [];

  async function handleFinishQuiz() {
    if (!activeQuiz) return;
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });
    setSubmitted(true);

    const res = await fetch(`/api/quizzes/${activeQuiz.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score,
        total: activeQuestions.length,
        answers,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuizzes((prev) =>
        prev.map((q) => (q.id === activeQuiz.id ? data.quiz : q))
      );
    }
  }

  async function handleCreateDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!deckTopic.trim()) return;
    setCreatingDeck(true);
    setQuizError("");
    try {
      const res = await apiFetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: deckTopic.trim(),
          cardCount: deckCount,
          level: quizLevel,
          language: quizLang,
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create flashcards");
      setDeckTopic("");
      await loadAll(null, data.flashcardSet.id);
      setActiveDeckId(data.flashcardSet.id);
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : "Error creating deck");
    } finally {
      setCreatingDeck(false);
    }
  }

  const activeDeck = decks.find((d) => d.id === activeDeckId) || null;
  const activeCards: FlashcardItem[] = activeDeck
    ? JSON.parse(activeDeck.cardsJson || "[]")
    : [];
  const currentCard = activeCards[cardIndex] || null;

  async function markCardStatus(status: "learning" | "mastered") {
    if (!activeDeck || !currentCard) return;
    const updatedCards = activeCards.map((c, i) =>
      i === cardIndex ? { ...c, status } : c
    );
    const res = await fetch(`/api/flashcards/${activeDeck.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards: updatedCards }),
    });
    if (res.ok) {
      const data = await res.json();
      setDecks((prev) =>
        prev.map((d) => (d.id === activeDeck.id ? data.flashcardSet : d))
      );
    }
    setFlipped(false);
    setShowHint(false);
    if (cardIndex < activeCards.length - 1) {
      setCardIndex(cardIndex + 1);
    }
  }

  const currentScore = activeQuestions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <BrainCircuit className="h-7 w-7 text-cyan-400" />
            Practice & Active Recall Arena
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Structured multiple-choice exams with LaTeX explanations & interactive 3D flashcards.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-slate-900 p-1">
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "quizzes"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            Interactive Quizzes
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "flashcards"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            3D Flashcards
          </button>
        </div>
      </div>

      {quizError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-3 text-xs text-rose-200">
          {quizError}
        </div>
      )}

      {activeTab === "quizzes" ? (
        <div className="space-y-6">
          {/* Quick Quiz Generator */}
          <form
            onSubmit={handleCreateQuiz}
            className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 flex flex-col lg:flex-row gap-3 items-end"
          >
            <div className="w-full flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Generate New Quiz Topic
              </label>
              <input
                type="text"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g., Thermodynamics Laws, React Hooks, Constitutional Law..."
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Questions
                </label>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-xs text-white"
                >
                  {[5, 10, 15, 20].map((n) => (
                    <option key={n} value={n} className="bg-slate-900">
                      {n} Qs
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Level</label>
                <select
                  value={quizLevel}
                  onChange={(e) => setQuizLevel(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-xs text-white"
                >
                  {STUDENT_LEVELS.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-900">
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Language (Indian &amp; Global)
                </label>
                <LanguageSelector
                  value={quizLang}
                  onChange={setQuizLang}
                  selectClassName="w-full rounded-xl border border-white/15 bg-slate-950 px-2.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingQuiz}
              className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
            >
              {creatingQuiz ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Quiz
                </>
              )}
            </button>
          </form>

          {quizzes.length > 0 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Saved Quizzes List */}
              <div className="lg:col-span-4 space-y-2.5">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuizId(q.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      q.id === activeQuizId
                        ? "border-cyan-400 bg-slate-900 shadow-lg"
                        : "border-white/10 bg-slate-900/50 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-cyan-400">
                          {q.level} • {q.totalQuestions} Questions
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">
                          {q.title}
                        </h3>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await fetch(`/api/quizzes/${q.id}`, { method: "DELETE" });
                          const next = quizzes.filter((x) => x.id !== q.id);
                          setQuizzes(next);
                          if (activeQuizId === q.id) setActiveQuizId(next[0]?.id || null);
                        }}
                        className="rounded p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Attempts: {q.attemptsCount}</span>
                      <span className="font-semibold text-emerald-400">
                        Best: {q.bestScore}/{q.totalQuestions}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Quiz Runner */}
              <div className="lg:col-span-8">
                {activeQuiz && (
                  <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 sm:p-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {activeQuiz.title}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Answered {Object.keys(answers).length} of{" "}
                          {activeQuestions.length} questions
                        </p>
                      </div>

                      {submitted && (
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2">
                          <Trophy className="h-5 w-5 text-amber-400" />
                          <div>
                            <div className="text-sm font-extrabold text-white">
                              Score: {currentScore} / {activeQuestions.length} (
                              {Math.round(
                                (currentScore / Math.max(1, activeQuestions.length)) * 100
                              )}
                              %)
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setAnswers({});
                              setSubmitted(false);
                            }}
                            className="ml-2 inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Retry
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {activeQuestions.map((q, qIdx) => {
                        const picked = answers[qIdx];
                        const hasPicked = picked !== undefined;

                        return (
                          <div
                            key={q.id || qIdx}
                            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4"
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
                                  "border-white/10 bg-slate-900/70 text-slate-200 hover:border-cyan-400/40";
                                if (hasPicked) {
                                  if (isCorrect) {
                                    optionStyle =
                                      "border-emerald-400 bg-emerald-500/20 text-emerald-100";
                                  } else if (isSelected && !isCorrect) {
                                    optionStyle =
                                      "border-rose-400 bg-rose-500/20 text-rose-100";
                                  } else {
                                    optionStyle =
                                      "border-white/5 bg-slate-900/40 text-slate-400 opacity-75";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
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

                    {!submitted && activeQuestions.length > 0 && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleFinishQuiz}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 transition"
                        >
                          <Trophy className="h-4 w-4" />
                          Submit & Record Quiz Score
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FLASHCARDS ARENA */
        <div className="space-y-6">
          <form
            onSubmit={handleCreateDeck}
            className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 flex flex-col sm:flex-row gap-3 items-end"
          >
            <div className="w-full flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Generate 3D Flashcard Deck
              </label>
              <input
                type="text"
                value={deckTopic}
                onChange={(e) => setDeckTopic(e.target.value)}
                placeholder="e.g., Organic Chemistry Functional Groups, Calculus Derivatives..."
                className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cards</label>
              <select
                value={deckCount}
                onChange={(e) => setDeckCount(Number(e.target.value))}
                className="rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
              >
                {[8, 12, 20].map((n) => (
                  <option key={n} value={n} className="bg-slate-900">
                    {n} Cards
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creatingDeck}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
            >
              {creatingDeck ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Deck
            </button>
          </form>

          {decks.length > 0 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4 space-y-2.5">
                {decks.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setActiveDeckId(d.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      d.id === activeDeckId
                        ? "border-cyan-400 bg-slate-900 shadow-lg"
                        : "border-white/10 bg-slate-900/50 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-white">{d.title}</h3>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await fetch(`/api/flashcards/${d.id}`, { method: "DELETE" });
                          const next = decks.filter((x) => x.id !== d.id);
                          setDecks(next);
                          if (activeDeckId === d.id) setActiveDeckId(next[0]?.id || null);
                        }}
                        className="rounded p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                      Mastered {d.masteredCount} / {d.totalCards} cards
                    </p>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-8">
                {activeDeck && currentCard && (
                  <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 sm:p-10 flex flex-col items-center space-y-6">
                    <div className="w-full flex items-center justify-between text-xs text-slate-400">
                      <span>{activeDeck.title}</span>
                      <span>
                        Card {cardIndex + 1} of {activeCards.length}
                      </span>
                    </div>

                    {/* Interactive Flip Card */}
                    <div
                      onClick={() => setFlipped(!flipped)}
                      className="w-full max-w-xl min-h-[280px] cursor-pointer rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-[#101c33] to-slate-950 p-8 flex flex-col items-center justify-center text-center shadow-2xl hover:border-cyan-400/60 transition"
                    >
                      <span className="mb-3 rounded-full bg-cyan-500/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {flipped ? "Answer / Back" : "Prompt / Front (Click to Flip)"}
                      </span>
                      <div className="text-lg sm:text-xl font-semibold text-white">
                        <MarkdownRenderer
                          content={flipped ? currentCard.back : currentCard.front}
                        />
                      </div>

                      {!flipped && showHint && currentCard.hint && (
                        <div className="mt-4 rounded-xl bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 text-xs text-amber-200">
                          Hint: {currentCard.hint}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setCardIndex(Math.max(0, cardIndex - 1))}
                        disabled={cardIndex === 0}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>

                      {currentCard.hint && !flipped && (
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 py-2.5 text-xs font-semibold text-amber-200"
                        >
                          <Lightbulb className="h-3.5 w-3.5" />
                          Hint
                        </button>
                      )}

                      <button
                        onClick={() => markCardStatus("learning")}
                        className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25 transition"
                      >
                        Needs Review
                      </button>

                      <button
                        onClick={() => markCardStatus("mastered")}
                        className="rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition"
                      >
                        Mastered ✓
                      </button>

                      <button
                        onClick={() =>
                          setCardIndex(Math.min(activeCards.length - 1, cardIndex + 1))
                        }
                        disabled={cardIndex >= activeCards.length - 1}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-400">Loading Practice Arena...</div>
      }
    >
      <PracticeInner />
    </Suspense>
  );
}
