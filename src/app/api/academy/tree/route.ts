import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import {
  buildLanguageDirective,
  createGeminiClient,
  DISCOVERY_OPTIONS_SCHEMA,
  PAPER_SYLLABUS_SCHEMA,
  resolveModelName,
  TREE_CHILDREN_SCHEMA,
} from "@/lib/gemini";

function normalizeKey(parts: string[]): string {
  return parts
    .map((p) =>
      String(p || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    )
    .join("::");
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const {
      action = "children", // "institutions" | "children" | "syllabus"
      country = "India",
      domain = "UNIVERSITY", // UNIVERSITY | SCHOOL_BOARD | COMPETITIVE_EXAM | CERTIFICATION
      institution = "",
      path = [] as string[],
      paper = "",
      language = "en-US",
      customSyllabusText = "",
      forceRefresh = false,
    } = body;

    const headerKey =
      process.env.NODE_ENV !== "production" || user?.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;

    // ------------------------------------------------------------------
    // ACTION 1: Discover Official Institutions / Boards / Exams in Country
    // ------------------------------------------------------------------
    if (action === "institutions") {
      const cacheKey = normalizeKey(["inst", country, domain]);
      if (!forceRefresh) {
        const cached = await prisma.catalogCache.findUnique({
          where: { cacheKey },
        });
        if (cached) {
          return NextResponse.json(JSON.parse(cached.payloadJson));
        }
      }

      const ai = createGeminiClient(headerKey);
      const model = resolveModelName(user?.preferredModel);

      const domainDesc =
        domain === "UNIVERSITY"
          ? "top 18 official universities, open universities, national institutes of technology/science, and higher-education curriculum bodies"
          : domain === "SCHOOL_BOARD"
          ? "top 15 official K-12 / school education boards, early-childhood frameworks, and national/state secondary examination councils"
          : domain === "COMPETITIVE_EXAM"
          ? "top 20 official national & regional competitive, entrance, civil-service, medical, engineering, law, and licensing examinations"
          : "top 15 professional certifications and industry mastery tracks";

      const res = await ai.models.generateContent({
        model,
        contents: `List the ${domainDesc} for learners in "${country}". Return official names (with common abbreviations in parentheses).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: DISCOVERY_OPTIONS_SCHEMA,
        },
      });

      const parsed = JSON.parse(res.text || '{"items":[]}');
      const payload = {
        items: Array.isArray(parsed.items)
          ? parsed.items.map((x: unknown) => String(x).trim()).filter(Boolean)
          : [],
      };

      if (payload.items.length > 0) {
        await prisma.catalogCache
          .upsert({
            where: { cacheKey },
            create: {
              cacheKey,
              nodeType: "INSTITUTIONS",
              payloadJson: JSON.stringify(payload),
            },
            update: { payloadJson: JSON.stringify(payload) },
          })
          .catch(() => null);
      }

      return NextResponse.json(payload);
    }

    // ------------------------------------------------------------------
    // ACTION 2: Cascading Drill-Down Children (Levels -> Programs -> Course Codes / Papers)
    // ------------------------------------------------------------------
    if (action === "children") {
      const cleanPath = Array.isArray(path)
        ? path.map((p) => String(p).trim()).filter(Boolean)
        : [];
      const cacheKey = normalizeKey([
        "children_v1",
        country,
        domain,
        institution,
        ...cleanPath,
      ]);

      if (!forceRefresh) {
        const cached = await prisma.catalogCache.findUnique({
          where: { cacheKey },
        });
        if (cached) {
          return NextResponse.json(JSON.parse(cached.payloadJson));
        }
      }

      const ai = createGeminiClient(headerKey);
      const model = resolveModelName(user?.preferredModel);

      let prompt = "";
      if (domain === "UNIVERSITY") {
        if (cleanPath.length === 0) {
          prompt = `For "${institution}" (${country}), return ALL official qualification levels offered (e.g., Bachelor's / Undergraduate Degree, Master's / Postgraduate Degree, Post Graduate Diploma, Diploma, Certificate, Doctoral / PhD — tailored accurately to what "${institution}" actually offers).
Set stepLabel = "4. Qualification Level", isPaperLevel = false.`;
        } else if (cleanPath.length === 1) {
          prompt = `For "${institution}" (${country}) at qualification level "${cleanPath[0]}", list the 18 to 28 major official academic programmes / degrees / majors offered.
CRITICAL: Include official programme codes where "${institution}" uses them (for example, for IGNOU Master's include MCA_NEW, MBA, MEG, MHD, MPS, MEC, MSO, MCOM, MAPC, MPA, MLIS, MSc-MACS, MSCDFSM, etc.; for MIT include Course 6-3 CS, Course 8 Physics, Course 18 Math, etc.).
Set stepLabel = "5. Select Programme / Degree", isPaperLevel = false.`;
        } else {
          prompt = `For "${institution}" (${country}) -> Level "${cleanPath[0]}" -> Programme "${cleanPath[1]}", list ALL official courses / papers across semesters or years (14 to 25 courses).
CRITICAL: Include the EXACT official Course / Paper Codes and Titles used by "${institution}" (for example, for IGNOU MCA_NEW: "MCS-201: Programming in C and Python", "MCS-202: Computer Organisation", "MCS-203: Operating Systems", "MCS-206: Object Oriented Programming Using Java", "MCS-207: Database Management Systems", "MCS-208: Data Structures and Algorithms", "MCS-211: Design and Analysis of Algorithms", "MCS-212: Discrete Mathematics", "MCS-213: Software Engineering", "MCS-214: Professional Skills and Ethics", "MCS-215: Security and Cyber Laws", "MCS-218: Data Communication and Computer Networks", "MCS-219: Object Oriented Analysis and Design", "MCS-220: Web Technologies", "MCS-221: Data Warehousing and Data Mining", "MCS-224: Artificial Intelligence and Machine Learning", etc.), and put the semester/year in badge (e.g. "Sem 1", "Sem 2", "Sem 3").
Set stepLabel = "6. Select Course / Paper (Official Code)", isPaperLevel = true.`;
        }
      } else if (domain === "SCHOOL_BOARD") {
        if (cleanPath.length === 0) {
          prompt = `For school board / curriculum "${institution}" in "${country}", list ALL official grades / classes / stages from Early Childhood (Nursery / KG) through Final High School (e.g. Nursery / KG, Class 1 through Class 10, Class 11 Science, Class 11 Commerce, Class 11 Humanities/Arts, Class 12 Science, Class 12 Commerce, Class 12 Humanities/Arts — using the exact grade naming of "${institution}").
Set stepLabel = "4. Select Class / Grade & Stream", isPaperLevel = false.`;
        } else {
          prompt = `For school board "${institution}" (${country}) -> "${cleanPath[0]}", list ALL official core and major elective subjects / papers taught in this class (include official subject codes where applicable, e.g. for CBSE Class 12: 042 Physics, 043 Chemistry, 041 Mathematics, 044 Biology, 083 Computer Science, 301 English Core, etc.).
Set stepLabel = "5. Select Official Subject / Paper", isPaperLevel = true.`;
        }
      } else if (domain === "COMPETITIVE_EXAM") {
        if (cleanPath.length === 0) {
          prompt = `For competitive examination "${institution}" (${country}), list its official Exam Stages / Categories / Streams (for example, for UPSC CSE: "Preliminary Examination (GS + CSAT)", "Mains — Compulsory & Essay Papers", "Mains — General Studies Papers (GS I–IV)", "Mains — Optional Subject Papers"; for GATE: list major GATE paper branches like CS, DA, EC, EE, ME, CE, IN, BT, PH, MA; for JEE/NEET/SAT/MCAT/USMLE: list official exam sections or paper tracks).
Set stepLabel = "4. Select Exam Stage / Stream", isPaperLevel = false.`;
        } else {
          prompt = `For competitive exam "${institution}" (${country}) -> Stage/Stream "${cleanPath[0]}", list ALL individual official exam papers available under "${cleanPath[0]}" (10 to 25 official papers, e.g. for UPSC Mains GS: Essay, GS Paper-I, GS Paper-II, GS Paper-III, GS Paper-IV; for UPSC Optional: Anthropology Paper I, Anthropology Paper II, PSIR Paper I, PSIR Paper II, Sociology Paper I & II, Public Administration Paper I & II, Geography Paper I & II, History Paper I & II, Mathematics Paper I & II, Literature papers, etc.).
Set stepLabel = "5. Select Specific Official Paper", isPaperLevel = true.`;
        }
      } else {
        if (cleanPath.length === 0) {
          prompt = `For professional certification / skill track "${institution}" (${country}), list the official specialization levels or role tracks. Set stepLabel = "4. Select Track / Level", isPaperLevel = false.`;
        } else {
          prompt = `For "${institution}" -> "${cleanPath[0]}", list the individual exam papers or core mastery modules. Set stepLabel = "5. Select Exam / Module", isPaperLevel = true.`;
        }
      }

      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: TREE_CHILDREN_SCHEMA,
        },
      });

      const payload = JSON.parse(res.text || "{}");
      if (Array.isArray(payload.items) && payload.items.length > 0) {
        await prisma.catalogCache
          .upsert({
            where: { cacheKey },
            create: {
              cacheKey,
              nodeType: "CHILDREN",
              payloadJson: JSON.stringify(payload),
            },
            update: { payloadJson: JSON.stringify(payload) },
          })
          .catch(() => null);
      }

      return NextResponse.json(payload);
    }

    // ------------------------------------------------------------------
    // ACTION 3: Load Complete Official Syllabus & All Chapters of Selected Paper
    // ------------------------------------------------------------------
    if (action === "syllabus") {
      const cleanPath = Array.isArray(path)
        ? path.map((p) => String(p).trim()).filter(Boolean)
        : [];
      const hasCustom = Boolean(String(customSyllabusText || "").trim());
      const cacheKey = normalizeKey([
        "syllabus_v1",
        country,
        domain,
        institution,
        ...cleanPath,
        paper,
        language,
      ]);

      if (!forceRefresh && !hasCustom) {
        const cached = await prisma.catalogCache.findUnique({
          where: { cacheKey },
        });
        if (cached) {
          return NextResponse.json(JSON.parse(cached.payloadJson));
        }
      }

      const ai = createGeminiClient(headerKey);
      const model = resolveModelName(user?.preferredModel);
      const languageDirective = buildLanguageDirective(language);

      const hierarchyStr = [country, institution, ...cleanPath, paper]
        .filter(Boolean)
        .join(" → ");

      const prompt = `Generate the COMPLETE, authentic, official chapter-by-chapter syllabus for:
Hierarchy: **${hierarchyStr}**
Selected Paper / Course: **${paper}**

${
  hasCustom
    ? `OFFICIAL UPLOADED / PASTED SYLLABUS DOCUMENT (Mirror all blocks/units and chapters faithfully):\n${String(
        customSyllabusText
      ).slice(0, 28000)}\n`
    : ""
}
CRITICAL ACCURACY RULES:
1. Mirror the REAL official syllabus of **${paper}** under **${institution}** (${country})!
   - If IGNOU or Open University course (e.g., MCS-201, MCS-211, MEG-01, etc.): organize into its exact **Blocks (Block 1, Block 2, Block 3, Block 4...)** and all **Units / Chapters** inside each Block!
   - If School Board subject (e.g., CBSE Class 12 Physics 042, KG, ICSE, IB, AP): include ALL official Units and ALL NCERT/Board Chapters in exact order (e.g., Chapters 1 to 14) with marks weightage!
   - If Competitive Exam paper (e.g., UPSC GS Paper II, Optional Paper, GATE CS, JEE, USMLE, GRE): include ALL official syllabus Units and break them into comprehensive, teachable Chapters covering 100% of the official syllabus!
2. Inside EVERY chapter's \`syllabusTopics\` array, list all 5 to 8 official sub-topics, theorems/algorithms/acts, and concepts of that chapter—because when the learner clicks "Teach Entire Chapter", AshuTeacher will teach ALL those syllabusTopics together in one complete lecture!
3. Set \`pedagogyStage\` accurately:
   - "KG & Early Wonder" for Nursery/KG/Grades 1–2
   - "Primary & Middle School" for Grades 3–8
   - "Intermediate" for Grades 9–12
   - "Advanced" for Bachelor's / Diploma / UG / Competitive Exams
   - "Expert" for Master's / Postgraduate / Doctoral / MIT-level courses.

${languageDirective}`;

      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: PAPER_SYLLABUS_SCHEMA,
        },
      });

      const payload = JSON.parse(res.text || "{}");
      if (!hasCustom && Array.isArray(payload.units) && payload.units.length > 0) {
        await prisma.catalogCache
          .upsert({
            where: { cacheKey },
            create: {
              cacheKey,
              nodeType: "SYLLABUS",
              payloadJson: JSON.stringify(payload),
            },
            update: { payloadJson: JSON.stringify(payload) },
          })
          .catch(() => null);
      }

      return NextResponse.json(payload);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
