import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Quiz Generator & 3D Spaced-Repetition Flashcards",
  description:
    "Turn any syllabus chapter, lecture, or PDF into timed LaTeX-rendered MCQ mock tests with step-by-step explanations and interactive 3D active-recall flashcards.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/practice",
  },
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
