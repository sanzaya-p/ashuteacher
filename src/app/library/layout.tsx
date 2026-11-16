import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Lectures, Courses & Study Library",
  description:
    "Access your saved AI Voice Blackboard lectures, solved exam papers, custom courses, quizzes, and 3D flashcard decks anytime across web and Android.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/library",
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
