export interface YouTubeExtractResult {
  videoId: string;
  title: string;
  channel: string;
  durationSeconds?: number;
  thumbnailUrl: string;
  captionLanguage?: string;
  hasTranscript: boolean;
  transcriptWarning?: string;
  text: string;
}

interface CaptionTrack {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
  name?: { simpleText?: string; runs?: Array<{ text?: string }> };
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const seg = parsed.pathname.split("/").filter(Boolean)[0] || "";
      return /^[a-zA-Z0-9_-]{11}$/.test(seg) ? seg : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const vParam = parsed.searchParams.get("v");
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        ["shorts", "embed", "live", "v"].includes(parts[0].toLowerCase()) &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, code) => {
      const n = Number(code);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => {
      const n = parseInt(hex, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    });
}

function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

function groupSegmentsIntoTranscript(
  segments: Array<{ startSec: number; text: string }>
): string {
  const blocks: string[] = [];
  let currentStart = -1;
  let buffer: string[] = [];

  for (const seg of segments) {
    const clean = seg.text.replace(/\s+/g, " ").trim();
    if (!clean) continue;

    if (currentStart < 0) {
      currentStart = seg.startSec;
    }

    if (seg.startSec - currentStart >= 40 && buffer.length > 0) {
      blocks.push(`[${formatTimestamp(currentStart)}] ${buffer.join(" ")}`);
      currentStart = seg.startSec;
      buffer = [clean];
    } else {
      buffer.push(clean);
    }
  }

  if (buffer.length > 0 && currentStart >= 0) {
    blocks.push(`[${formatTimestamp(currentStart)}] ${buffer.join(" ")}`);
  }

  return blocks.join("\n\n").slice(0, 58000);
}

function pickBestCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  const valid = tracks.filter((t) => Boolean(t?.baseUrl));
  if (valid.length === 0) return null;

  const isEn = (t: CaptionTrack) =>
    (t.languageCode || "").toLowerCase().startsWith("en");
  const isManual = (t: CaptionTrack) => t.kind !== "asr";

  return (
    valid.find((t) => isEn(t) && isManual(t)) ||
    valid.find((t) => isEn(t)) ||
    valid.find((t) => isManual(t)) ||
    valid[0]
  );
}

async function fetchCaptionTrackText(baseUrl: string): Promise<string> {
  // Prefer json3 format for clean timestamped segments
  try {
    const jsonUrl = baseUrl.includes("fmt=")
      ? baseUrl.replace(/fmt=[^&]+/, "fmt=json3")
      : `${baseUrl}&fmt=json3`;
    const res = await fetch(jsonUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (res.ok) {
      const raw = await res.text();
      if (raw.trim().startsWith("{")) {
        const data = JSON.parse(raw) as {
          events?: Array<{
            tStartMs?: number;
            segs?: Array<{ utf8?: string }>;
          }>;
        };
        const segments: Array<{ startSec: number; text: string }> = [];
        for (const ev of data.events || []) {
          if (!Array.isArray(ev.segs)) continue;
          const combined = ev.segs
            .map((s) => s.utf8 || "")
            .join("")
            .replace(/\n+/g, " ")
            .trim();
          if (combined) {
            segments.push({
              startSec: (ev.tStartMs || 0) / 1000,
              text: decodeHtmlEntities(combined),
            });
          }
        }
        const grouped = groupSegmentsIntoTranscript(segments);
        if (grouped.length > 30) return grouped;
      }
    }
  } catch {
    // Fall back to default XML timedtext format
  }

  // XML timedtext fallback
  const xmlRes = await fetch(baseUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!xmlRes.ok) return "";
  const xml = await xmlRes.text();

  const segments: Array<{ startSec: number; text: string }> = [];
  // Handles both <text start="12.34" ...> and <p t="12340" ...>
  const textRegex = /<text\b[^>]*\bstart="([^"]+)"[^>]*>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;
  while ((match = textRegex.exec(xml)) !== null) {
    const startSec = parseFloat(match[1]) || 0;
    const content = decodeHtmlEntities(match[2].replace(/<[^>]+>/g, " ")).trim();
    if (content) segments.push({ startSec, text: content });
  }

  if (segments.length === 0) {
    const pRegex = /<p\b[^>]*\bt="(\d+)"[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(xml)) !== null) {
      const startSec = (parseInt(match[1], 10) || 0) / 1000;
      const content = decodeHtmlEntities(match[2].replace(/<[^>]+>/g, " ")).trim();
      if (content) segments.push({ startSec, text: content });
    }
  }

  return groupSegmentsIntoTranscript(segments);
}

function extractBalancedJsonArray(source: string, marker: string): string | null {
  const idx = source.indexOf(marker);
  if (idx === -1) return null;
  const start = source.indexOf("[", idx + marker.length - 1);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < source.length && i < start + 250000; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "[") {
      depth++;
    } else if (ch === "]") {
      depth--;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  return null;
}

async function fetchInnerTubePlayer(videoId: string): Promise<{
  title?: string;
  channel?: string;
  description?: string;
  durationSeconds?: number;
  tracks: CaptionTrack[];
}> {
  try {
    const res = await fetch(
      "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
          "X-YouTube-Client-Name": "3",
          "X-YouTube-Client-Version": "20.10.38",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
              hl: "en",
              gl: "US",
            },
          },
          videoId,
        }),
      }
    );

    if (!res.ok) return { tracks: [] };
    const data = (await res.json()) as {
      videoDetails?: {
        title?: string;
        author?: string;
        shortDescription?: string;
        lengthSeconds?: string;
      };
      captions?: {
        playerCaptionsTracklistRenderer?: {
          captionTracks?: CaptionTrack[];
        };
      };
    };

    return {
      title: data.videoDetails?.title,
      channel: data.videoDetails?.author,
      description: data.videoDetails?.shortDescription,
      durationSeconds: data.videoDetails?.lengthSeconds
        ? parseInt(data.videoDetails.lengthSeconds, 10) || undefined
        : undefined,
      tracks: data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [],
    };
  } catch {
    return { tracks: [] };
  }
}

async function fetchWatchPageMetadataAndTracks(videoId: string): Promise<{
  title?: string;
  channel?: string;
  description?: string;
  durationSeconds?: number;
  tracks: CaptionTrack[];
}> {
  try {
    const res = await fetch(
      `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&hl=en`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: "CONSENT=YES+1; SOCS=CAI",
        },
      }
    );
    if (!res.ok) return { tracks: [] };
    const html = await res.text();

    let tracks: CaptionTrack[] = [];
    const rawTracks = extractBalancedJsonArray(html, '"captionTracks":');
    if (rawTracks) {
      try {
        const parsed = JSON.parse(rawTracks);
        if (Array.isArray(parsed)) tracks = parsed;
      } catch {
        // Ignore malformed tracks JSON
      }
    }

    const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)?.[1];
    const metaDesc = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    const authorMatch = html.match(/"author":"([^"]+)"/);
    const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);

    return {
      title: ogTitle ? decodeHtmlEntities(ogTitle) : undefined,
      channel: authorMatch ? decodeHtmlEntities(authorMatch[1]) : undefined,
      description: metaDesc ? decodeHtmlEntities(metaDesc) : undefined,
      durationSeconds: lengthMatch ? parseInt(lengthMatch[1], 10) || undefined : undefined,
      tracks,
    };
  } catch {
    return { tracks: [] };
  }
}

async function fetchOEmbedMetadata(
  videoId: string
): Promise<{ title?: string; channel?: string }> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}&format=json`
    );
    if (!res.ok) return {};
    const data = (await res.json()) as { title?: string; author_name?: string };
    return { title: data.title, channel: data.author_name };
  } catch {
    return {};
  }
}

export async function extractYouTubeLecture(
  rawUrl: string
): Promise<YouTubeExtractResult> {
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) {
    throw new Error("Could not find a valid YouTube video ID in that URL.");
  }

  // Tier 1: InnerTube Android player (works reliably from cloud IPs)
  let info = await fetchInnerTubePlayer(videoId);

  // Tier 2: Watch page HTML fallback if InnerTube didn't return caption tracks
  if (info.tracks.length === 0) {
    const watchInfo = await fetchWatchPageMetadataAndTracks(videoId);
    info = {
      title: info.title || watchInfo.title,
      channel: info.channel || watchInfo.channel,
      description: info.description || watchInfo.description,
      durationSeconds: info.durationSeconds || watchInfo.durationSeconds,
      tracks: watchInfo.tracks.length > 0 ? watchInfo.tracks : info.tracks,
    };
  }

  // Always fill missing title/channel via oEmbed
  if (!info.title || !info.channel) {
    const oembed = await fetchOEmbedMetadata(videoId);
    info.title = info.title || oembed.title;
    info.channel = info.channel || oembed.channel;
  }

  const cleanTitle = (info.title || `YouTube Lecture (${videoId})`).trim();
  const cleanChannel = (info.channel || "YouTube Creator").trim();
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const bestTrack = pickBestCaptionTrack(info.tracks);
  let transcriptText = "";
  let captionLanguage: string | undefined;

  if (bestTrack?.baseUrl) {
    captionLanguage =
      bestTrack.name?.simpleText ||
      bestTrack.name?.runs?.map((r) => r.text || "").join("") ||
      bestTrack.languageCode ||
      "Captions";
    transcriptText = await fetchCaptionTrackText(bestTrack.baseUrl).catch(() => "");
  }

  if (transcriptText.trim().length > 40) {
    const headerLines = [
      `YouTube Lecture: ${cleanTitle}`,
      `Channel: ${cleanChannel}`,
      info.durationSeconds
        ? `Duration: ${formatTimestamp(info.durationSeconds)}`
        : null,
      captionLanguage ? `Source Captions: ${captionLanguage}` : null,
      "",
      "Timestamped Lecture Transcript:",
      transcriptText,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    return {
      videoId,
      title: cleanTitle,
      channel: cleanChannel,
      durationSeconds: info.durationSeconds,
      thumbnailUrl,
      captionLanguage,
      hasTranscript: true,
      text: headerLines.slice(0, 60000),
    };
  }

  // Tier 3: Graceful metadata fallback when video captions are disabled or blocked
  const fallbackText = [
    `YouTube Lecture Title: ${cleanTitle}`,
    `Channel / Instructor: ${cleanChannel}`,
    info.durationSeconds
      ? `Duration: ${formatTimestamp(info.durationSeconds)}`
      : null,
    info.description
      ? `\nVideo Description & Chapters:\n${info.description.slice(0, 6000)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    videoId,
    title: cleanTitle,
    channel: cleanChannel,
    durationSeconds: info.durationSeconds,
    thumbnailUrl,
    hasTranscript: false,
    transcriptWarning:
      "Captions weren't available for this video, so we loaded its title & description. You can still generate a complete blackboard lesson, quiz, or flashcards on this topic!",
    text: fallbackText,
  };
}
