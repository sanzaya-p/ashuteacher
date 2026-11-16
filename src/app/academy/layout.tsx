import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "195-Country Cascading Syllabus & Competitive Exam Academy",
  description:
    "Explore official curricula from KG to Doctoral across 195+ countries: IGNOU, CBSE, ICSE, UPSC, IIT-JEE, NEET, GATE, SAT, AP, Cambridge, ENEM, Gaokao, and MIT OpenCourseWare.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/academy",
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
