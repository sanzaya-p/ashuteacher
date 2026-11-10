import React, { Suspense } from "react";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SharedLecturePlayer } from "@/components/SharedLecturePlayer";

async function getCachedSharedLesson(id: string) {
  "use cache";
  cacheLife("hours");

  if (!id || id.length > 64) return null;
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subject: true,
        language: true,
        level: true,
        content: true,
        userId: true,
        user: {
          select: { name: true },
        },
      },
    });
    if (!lesson || !lesson.content || lesson.content.trim().length < 40) {
      return null;
    }
    const firstName = (lesson.user?.name || "A Scholar").split(/\s+/)[0];
    return {
      id: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      language: lesson.language,
      level: lesson.level,
      content: lesson.content,
      sharerId: lesson.userId,
      sharerFirstName: firstName,
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
  const lesson = await getCachedSharedLesson(id);
  if (!lesson) {
    return {
      title: "Shared AI Voice Blackboard Lecture",
      description:
        "Watch and listen to interactive AI Voice Blackboard lectures across 195+ countries and 100+ languages on AshuTeacher.",
    };
  }

  const cleanSnippet = lesson.content
    .replace(/[#*$\\`>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);

  return {
    title: `${lesson.title} (${lesson.subject}) — Live AI Voice Blackboard`,
    description:
      cleanSnippet ||
      `Watch and listen to "${lesson.title}" on AshuTeacher's AI Voice Blackboard. Claim 35 Free Study Credits!`,
    openGraph: {
      title: `🎓 ${lesson.title} — AshuTeacher AI Voice Blackboard`,
      description: `Shared by ${lesson.sharerFirstName}: Watch & hear this ${lesson.subject} chalkboard lecture free, and claim 35 Free Study Credits!`,
    },
  };
}

async function SharedLessonBody({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const lesson = await getCachedSharedLesson(id);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white">
          Lecture Not Found or Still Streaming
        </h1>
        <p className="text-sm text-slate-400">
          This shared blackboard link may have been removed or hasn&apos;t finished generating yet.
        </p>
        <Link
          href="/classroom"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
        >
          Launch Your Own Free AI Blackboard Lecture →
        </Link>
      </div>
    );
  }

  return (
    <SharedLecturePlayer
      lessonId={lesson.id}
      title={lesson.title}
      subject={lesson.subject}
      language={lesson.language}
      level={lesson.level}
      content={lesson.content}
      sharerId={lesson.sharerId}
      sharerFirstName={lesson.sharerFirstName}
    />
  );
}

export default function ShareLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-300">
          Loading shared AI Voice Blackboard lecture...
        </div>
      }
    >
      <SharedLessonBody paramsPromise={params} />
    </Suspense>
  );
}
