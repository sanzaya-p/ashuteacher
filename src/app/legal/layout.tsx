import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service, Privacy Policy & Refund Policy",
  description:
    "Official Terms of Service, Student Data Privacy Policy, and Study Credit Refund Policy for AshuTeacher AI Interactive Classroom.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/legal",
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
