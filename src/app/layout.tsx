import type { Metadata, Viewport } from "next";
import {
  Inter,
  Caveat,
  JetBrains_Mono,
  Noto_Sans_Oriya,
} from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const notoOriya = Noto_Sans_Oriya({
  variable: "--font-oriya",
  subsets: ["oriya"],
  weight: ["400", "700"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ashuteacher.vercel.app";

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "AshuTeacher",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AshuTeacher",
  },
  title: {
    default: "AshuTeacher — AI Interactive Blackboard, Exam Solver & Voice Tutor",
    template: "%s | AshuTeacher",
  },
  description:
    "AI interactive blackboard with synchronized voice narration in all 22 Indian & 60+ global languages, step-by-step JEE/NEET/board exam paper solver, custom syllabi, adaptive quizzes, and 3D flashcards. Start free with 30 study credits.",
  keywords: [
    "AI tutor",
    "AI blackboard",
    "exam paper solver",
    "JEE NEET doubt solver",
    "homework solver step by step",
    "AI voice teacher",
    "Hindi AI tutor",
    "Odia AI tutor",
    "IGNOU MCA MBA study tutor",
    "UPSC CSE AI blackboard",
    "CBSE Class 10 12 AI teacher",
    "viva voce defense simulator",
    "interactive flashcards",
    "AI quiz generator",
  ],
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "AshuTeacher",
    title: "AshuTeacher — AI Interactive Blackboard & Exam Solver",
    description:
      "Upload any PDF, screenshot, or tough topic. Watch it written step-by-step on a smart blackboard with live voice narration. Claim 30 free credits!",
  },
  twitter: {
    card: "summary_large_image",
    title: "AshuTeacher — AI Interactive Blackboard & Exam Solver",
    description:
      "Step-by-step LaTeX solutions, live voice narration in 85+ Indian & global languages, custom courses & quizzes. Start free with 30 credits.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AshuTeacher",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, Android, iOS",
    url: appUrl,
    downloadUrl: `${appUrl}/downloads/AshuTeacher.apk`,
    description:
      "Interactive AI Voice Blackboard and Step-by-Step Exam Paper Solver across all 22 Indian and 60+ international languages with custom courses, quizzes, and 3D flashcards.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "30 Free Study Credits on Sign-Up",
    },
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${caveat.variable} ${jetbrainsMono.variable} ${notoOriya.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
