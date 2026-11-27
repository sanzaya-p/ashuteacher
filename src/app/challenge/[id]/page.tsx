import React, { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuizQuestion } from "@/lib/constants";
import { QuizChallengeArena } from "@/components/QuizChallengeArena";

async function getCachedChallengeQuiz(id: string) {
  "use cache";
  cacheLife("hours");

  if (!id || id.length > 64) return null;
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        topic: true,
        level: true,
        language: true,
        questionsJson: true,
        totalQuestions: true,
        bestScore: true,
        userId: true,
        user: {
          select: { name: true },
        },
      },
    });
    if (!quiz) return null;

    let questions: QuizQuestion[] = [];
    try {
      const parsed = JSON.parse(quiz.questionsJson || "[]");
      if (Array.isArray(parsed)) questions = parsed;
    } catch {
      questions = [];
    }
    if (questions.length === 0) return null;

    const creatorFirstName = (quiz.user?.name || "A Classmate")
      .trim()
      .split(/\s+/)[0];

    return {
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      level: quiz.level,
      language: quiz.language,
      questions,
      bestScore: quiz.bestScore,
      creatorId: quiz.userId,
      creatorFirstName,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const quiz = await getCachedChallengeQuiz(id);
  if (!quiz) {
    return {
      title: "Classmate Quiz Challenge — AshuTeacher",
      description:
        "Take interactive AI quizzes with step-by-step LaTeX explanations free on AshuTeacher.",
    };
  }

  return {
    title: `🏆 Beat ${quiz.creatorFirstName}'s Score: ${quiz.title} — AshuTeacher`,
    description: `${quiz.creatorFirstName} challenged you to a ${quiz.questions.length}-question ${quiz.level} quiz on "${quiz.topic}". Play free with zero login & see step-by-step LaTeX explanations!`,
    openGraph: {
      title: `🏆 Classmate Quiz Challenge: ${quiz.title}`,
      description: `Can you beat ${quiz.creatorFirstName}'s score on "${quiz.topic}" (${quiz.questions.length} MCQs)? Play free immediately—no login needed!`,
    },
  };
}

async function ChallengeQuizBody({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const quiz = await getCachedChallengeQuiz(id);

  if (!quiz) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white">
          Quiz Challenge Not Found
        </h1>
        <p className="text-sm text-slate-400">
          This quiz challenge link may have been deleted by its creator. You can generate a brand-new quiz on any topic in seconds!
        </p>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
        >
          Create Your Own Quiz Free →
        </Link>
      </div>
    );
  }

  return (
    <QuizChallengeArena
      quizId={quiz.id}
      title={quiz.title}
      topic={quiz.topic}
      level={quiz.level}
      language={quiz.language}
      questions={quiz.questions}
      defaultBestScore={quiz.bestScore}
      creatorId={quiz.creatorId}
      creatorFirstName={quiz.creatorFirstName}
    />
  );
}

export default function ChallengeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-300">
          Loading classmate quiz challenge...
        </div>
      }
    >
      <ChallengeQuizBody paramsPromise={params} />
    </Suspense>
  );
}
