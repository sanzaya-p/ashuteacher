import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Course & Custom Curriculum Builder",
  description:
    "Generate structured multi-chapter study courses with interactive blackboard lectures, worked examples, and progress tracking for any school, university, or competitive exam syllabus.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/courses",
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
