import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import {
  createGeminiClient,
  DISCOVERY_OPTIONS_SCHEMA,
  resolveModelName,
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      country = "Global / International",
      discoveryType = "boards", // "boards" | "exams" | "subjects"
      boardOrBody = "",
      gradeOrExam = "",
      streamOrFocus = "",
    } = body;

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(user.preferredModel);

    let prompt = "";
    if (discoveryType === "boards") {
      prompt = `List the top 12 official school education boards, national curriculum bodies, and major university curriculum systems in "${country}" (spanning Early Childhood/K-12 through University/Doctoral). Return concise, accurate official names.`;
    } else if (discoveryType === "exams") {
      prompt = `List the top 15 major official competitive, entrance, licensing, civil-service, and scholarship exams taken by students and professionals in "${country}" (plus relevant international exams popular there). Return concise official exam names with short parenthetical descriptions.`;
    } else {
      prompt = `List the official core and major elective subjects/papers for:
Country: ${country}
Board / Exam / University: ${boardOrBody || "Standard Official Curriculum"}
Class / Grade / Degree / Exam: ${gradeOrExam || "General"}
${streamOrFocus ? `Stream / Major: ${streamOrFocus}` : ""}
Return 6 to 12 accurate official subject or paper names.`;
    }

    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: DISCOVERY_OPTIONS_SCHEMA,
      },
    });

    const parsed = JSON.parse(res.text || '{"items":[]}');
    const items = Array.isArray(parsed.items)
      ? parsed.items.map((x: unknown) => String(x).trim()).filter(Boolean)
      : [];

    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
