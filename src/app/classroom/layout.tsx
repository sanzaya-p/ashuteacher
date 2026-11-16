import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive AI Voice Blackboard & Exam Paper Solver",
  description:
    "Stream step-by-step whiteboard lectures with synchronized native voice narration in 100+ languages, or upload scanned PDF/photo exam papers for instant worked solutions.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/classroom",
  },
};

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
