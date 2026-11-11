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
      "Step-by-step LaTeX solutions, live voice narration in 100+ global & Indian languages, 195-country syllabi & quizzes. Start free with 30 credits.",
  },
  verification: {
    google: "gBIulmj-GklwoljOv4gSA9HANM6ldkUERvpBhJVPdh8",
  },
  alternates: {
    canonical: appUrl,
    languages: {
      "x-default": `${appUrl}/explore`,
      "en": `${appUrl}/explore/global-sat-ap-ib-cambridge-mit-ai-tutor`,
      "en-IN": `${appUrl}/explore/ignou-mca-syllabus-ai-tutor`,
      "en-NG": `${appUrl}/explore/waec-jamb-utme-neco-kcse-matric-ai-tutor-africa`,
      "en-PH": `${appUrl}/explore/upcat-cet-prc-board-exam-let-nursing-ai-reviewer-philippines`,
      "pt-BR": `${appUrl}/explore/professor-ia-gratuito-enem-vestibular-fuvest-brasil`,
      "es": `${appUrl}/explore/profesor-ia-gratis-pau-ebau-unam-icfes-paes-espanol`,
      "ar": `${appUrl}/explore/muallim-dhaka-istinai-majani-thanaweya-qudurat-tawjihi-arabic`,
      "fr": `${appUrl}/explore/professeur-ia-gratuit-baccalaureat-brevet-prepa-francais`,
      "id": `${appUrl}/explore/guru-ai-gratis-utbk-snbt-olimpiade-sma-indonesia`,
      "vi": `${appUrl}/explore/gia-su-ai-mien-phi-luyen-thi-thpt-quoc-gia-vietnam`,
      "tr": `${appUrl}/explore/ucretsiz-yapay-zeka-ogretmen-yks-tyt-ayt-lgs-kpss-turkiye`,
      "zh": `${appUrl}/explore/gaokao-kaoyan-mianfei-ai-yuyin-heiban-chinese`,
      "ko": `${appUrl}/explore/suneung-csat-muryo-ai-chilpan-tutor-korean`,
      "ja": `${appUrl}/explore/kyotsu-test-daigaku-juken-muryo-ai-kokuban-japanese`,
      "de": `${appUrl}/explore/kostenloser-ki-lehrer-abitur-matura-studium-deutsch`,
      "ru": `${appUrl}/explore/besplatnyj-ii-uchitel-ege-oge-ent-ekzameny-russian`,
      "bn": `${appUrl}/explore/bangla-ai-voice-blackboard-hsc-ssc-bcs-wbchse`,
      "ur": `${appUrl}/explore/urdu-ai-voice-blackboard-mdcat-fsc-matric-css`,
      "hi": `${appUrl}/explore/hindi-bengali-tamil-telugu-indian-languages-ai-tutor`,
      "or": `${appUrl}/explore/odia-sambalpuri-santali-ai-voice-tutor`,
      "ta": `${appUrl}/explore/tamil-telugu-marathi-gujarati-kannada-malayalam-ai-tutor`,
    },
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
