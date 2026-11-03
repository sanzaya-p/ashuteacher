import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

async function extractPdfRange(
  uint8Array: Uint8Array,
  startPage?: number,
  endPage?: number
): Promise<{ text: string; totalPages: number }> {
  const pdf = await getDocumentProxy(uint8Array);
  const totalPages = pdf.numPages;
  const from = Math.max(1, Math.min(startPage || 1, totalPages));
  const to = Math.max(from, Math.min(endPage || totalPages, totalPages));

  const { text: pagesText } = await extractText(pdf, { mergePages: false });
  const selected = Array.isArray(pagesText)
    ? pagesText.slice(from - 1, to).join("\n\n")
    : String(pagesText || "");

  return { text: selected.trim(), totalPages };
}

function stripHtmlToReadableText(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "Web Article";

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<(nav|footer|header|aside)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, text: cleaned.slice(0, 60000) };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Case 1: Multipart file upload (PDF or text)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const startPage = Number(formData.get("startPage") || 1);
      const endPage = Number(formData.get("endPage") || 9999);

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const { text, totalPages } = await extractPdfRange(bytes, startPage, endPage);
        // Also provide base64 if file <= 10MB so Gemini multimodal can inspect scanned pages/diagrams directly
        const base64Data =
          bytes.byteLength <= 10 * 1024 * 1024
            ? Buffer.from(bytes).toString("base64")
            : undefined;

        return NextResponse.json({
          title: file.name.replace(/\.pdf$/i, ""),
          text,
          totalPages,
          mimeType: "application/pdf",
          base64Data,
        });
      }

      if (file.type.startsWith("image/")) {
        const base64Data = Buffer.from(bytes).toString("base64");
        return NextResponse.json({
          title: file.name,
          text: "",
          mimeType: file.type,
          base64Data,
        });
      }

      const textContent = Buffer.from(bytes).toString("utf-8");
      return NextResponse.json({
        title: file.name,
        text: textContent.slice(0, 80000),
        totalPages: 1,
      });
    }

    // Case 2: Remote URL extraction (fixes CORS completely!)
    const body = await req.json();
    const { url, startPage, endPage } = body;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are supported" }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AshuTeacherBot/1.0; +https://ashuteacher.app)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Remote server returned HTTP ${response.status}` },
        { status: 400 }
      );
    }

    const remoteType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (
      remoteType.includes("application/pdf") ||
      parsedUrl.pathname.toLowerCase().endsWith(".pdf")
    ) {
      const { text, totalPages } = await extractPdfRange(bytes, startPage, endPage);
      const base64Data =
        bytes.byteLength <= 10 * 1024 * 1024
          ? Buffer.from(bytes).toString("base64")
          : undefined;
      const filename = parsedUrl.pathname.split("/").pop() || "Remote Document";

      return NextResponse.json({
        title: filename.replace(/\.pdf$/i, ""),
        isPdf: true,
        text,
        totalPages,
        mimeType: "application/pdf",
        base64Data,
      });
    }

    const html = Buffer.from(bytes).toString("utf-8");
    const { title, text } = stripHtmlToReadableText(html);
    return NextResponse.json({
      title,
      isPdf: false,
      text,
      totalPages: 1,
    });
  } catch (error) {
    console.error("Extract error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
