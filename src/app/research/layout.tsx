import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "6-Milestone Thesis, Capstone & Live AI Viva Voce Defense Lab",
  description:
    "Architect B.Tech/MCA capstones, Master's dissertations, and Ph.D. research blueprints from literature gap to methodology, and practice before a live AI Viva Voce examiner panel.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/research",
  },
};

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
