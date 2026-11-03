import { NextRequest } from "next/server";
import {
  createGeminiClient,
  getLanguageName,
  resolveModelName,
} from "@/lib/gemini";
import { requireAuthUser } from "@/lib/auth";
import { CREDIT_COSTS, refundCredits, spendCredits } from "@/lib/credits";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  let chargedUserId: string | null = null;
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const {
      feature,
      topic = "Current Topic",
      context = "",
      language = "en-US",
      level = "Intermediate",
      model: requestedModel,
    } = body;

    const headerKey =
      process.env.NODE_ENV !== "production" || user.isAdmin
        ? req.headers.get("x-gemini-api-key")
        : null;
    const ai = createGeminiClient(headerKey);
    const model = resolveModelName(requestedModel || user.preferredModel);
    const languageName = getLanguageName(language);

    const { remainingCredits } = await spendCredits({
      userId: user.id,
      cost: CREDIT_COSTS.ASSISTANT,
      description: `Assistant Tool (${feature}): ${topic.slice(0, 50)}`,
    });
    chargedUserId = user.id;

    let prompt = "";
    switch (feature) {
      case "explain":
        prompt = `Identify the most challenging or abstract concept in the lesson below and explain it in a radically simpler, intuitive way using an everyday analogy and step-by-step breakdown.`;
        break;
      case "example":
        prompt = `Give 2 vivid, concrete real-world applications or worked examples demonstrating the main principles of this lesson.`;
        break;
      case "summarize":
        prompt = `Distill this entire lesson into an executive 5-bullet summary plus a "1-Sentence Golden Takeaway".`;
        break;
      case "recap":
      default:
        prompt = `Extract every key formula, law, theorem, and core definition from this lesson into a clean, high-yield quick-reference sheet.`;
        break;
    }

    const systemInstruction = `You are a brilliant teaching assistant. Respond strictly in ${languageName} at the ${level} level. Use clean GitHub-Flavored Markdown and proper LaTeX ($...$ for inline math, $$...$$ for block equations).`;

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: `${prompt}\n\nTopic: ${topic}\n\nLesson Material:\n${String(context).slice(0, 28000)}`,
      config: { systemInstruction },
    });

    const encoder = new TextEncoder();
    let anyText = false;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              anyText = true;
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          if (!anyText) {
            await refundCredits({
              userId: user.id,
              amount: CREDIT_COSTS.ASSISTANT,
              description: "Refund for interrupted assistant tool",
            });
          }
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Credits-Remaining": String(remainingCredits),
      },
    });
  } catch (error) {
    if (chargedUserId) {
      await refundCredits({
        userId: chargedUserId,
        amount: CREDIT_COSTS.ASSISTANT,
        description: "Automatic refund after failed assistant tool",
      });
    }
    return handleApiError(error, "Failed to run assistant tool");
  }
}
