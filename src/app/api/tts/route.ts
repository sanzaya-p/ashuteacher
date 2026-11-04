import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

const TTS_MODELS = [
  "gemini-3.8-flash-lite-tts",
  "gemini-3.8-flash-tts",
  "gemini-2.5-flash-preview-tts",
] as const;

const ALLOWED_VOICES = new Set(["Kore", "Puck", "Aoede", "Charon", "Fenrir"]);

function ensureWavContainer(rawBuffer: Buffer, sampleRate = 24000): Buffer {
  if (
    rawBuffer.length >= 12 &&
    rawBuffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    rawBuffer.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    return rawBuffer;
  }

  // Wrap raw 16-bit signed little-endian mono PCM (audio/L16) in a 44-byte RIFF WAV header
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = rawBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // Linear PCM format = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, rawBuffer]);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const headerKey = req.headers.get("x-gemini-api-key")?.trim() || "";

    if (!user && !headerKey) {
      return NextResponse.json(
        { error: "AUTH_REQUIRED: Please sign in to use Gemini AI Neural Voice narration." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawText = typeof body?.text === "string" ? body.text.trim() : "";
    const requestedVoice = typeof body?.voice === "string" ? body.voice.trim() : "Kore";
    const voiceName = ALLOWED_VOICES.has(requestedVoice) ? requestedVoice : "Kore";

    if (!rawText) {
      return NextResponse.json({ error: "Text is required for speech synthesis." }, { status: 400 });
    }

    // Cap batch text to 1,200 chars per request so latency stays low & response stays well under serverless limits
    const text = rawText.slice(0, 1200);

    const apiKey =
      headerKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "MISSING_API_KEY: No Gemini API key configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let lastError: unknown;

    for (const model of TTS_MODELS) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: text,
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName,
                },
              },
            },
          },
        });

        const inlineData = res.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (!inlineData?.data) {
          throw new Error(`No audio data returned from ${model}`);
        }

        const decoded = Buffer.from(inlineData.data, "base64");
        const wavBuffer = ensureWavContainer(decoded, 24000);

        return new NextResponse(new Uint8Array(wavBuffer), {
          status: 200,
          headers: {
            "Content-Type": "audio/wav",
            "Content-Length": String(wavBuffer.length),
            "Cache-Control": "private, max-age=3600",
          },
        });
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("AI voice synthesis failed.");
  } catch (err) {
    return handleApiError(err);
  }
}
