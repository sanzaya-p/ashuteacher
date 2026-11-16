import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pay-As-You-Study Credits & Pricing — Start Free with 30 Credits",
  description:
    "Zero mandatory monthly subscriptions. Claim 30 free AI Study Credits on sign-up and top up affordable student micro-packs only when you need extra lectures or exam paper solutions.",
  alternates: {
    canonical: "https://ashuteacher.vercel.app/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
