"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Volume2,
  Upload,
  Globe,
  FileText,
  Sparkles,
  BookOpen,
  FileCheck2,
  ListChecks,
  Hand,
  StickyNote,
  Maximize2,
  Minimize2,
  Star,
  Printer,
  Lightbulb,
  Search,
  AlignLeft,
  Sigma,
  BrainCircuit,
  Layers,
  Send,
  Mic,
  MicOff,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  SkipBack,
  SkipForward,
  Check,
  Share2,
} from "lucide-react";
import {
  AI_TTS_VOICES,
  STUDENT_LEVELS,
  TEACHING_MODES,
  findBrowserVoicesForLanguage,
  parseLanguageAndScript,
} from "@/lib/constants";
import { markdownToSpeechSegments } from "@/lib/speech";
import { apiFetch, getStoredModel } from "@/lib/client-api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { LanguageSelector } from "@/components/LanguageSelector";

type SourceTab = "topic" | "upload" | "url" | "paste";
type BoardTheme = "photon" | "chalk" | "paper";

interface DoubtChatItem {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

function ClassroomInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Studio controls state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sourceTab, setSourceTab] = useState<SourceTab>("topic");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlStatus, setUrlStatus] = useState("");
  const [extracting, setExtracting] = useState(false);

  // Uploaded file / PDF state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedSourceText, setExtractedSourceText] = useState("");
  const [attachment, setAttachment] = useState<{
    mimeType: string;
    base64Data: string;
  } | null>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [pdfStartPage, setPdfStartPage] = useState<number>(1);
  const [pdfEndPage, setPdfEndPage] = useState<number>(1);

  // Pedagogical settings
  const [mode, setMode] = useState<string>("lesson");
  const [language, setLanguage] = useState<string>("en-US");
  const [level, setLevel] = useState<string>("Intermediate");
  const [speakingRate, setSpeakingRate] = useState<number>(1.0);
  const [autoNarrate, setAutoNarrate] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // Blackboard display state
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("chalk");
  const [useHandwritingFont, setUseHandwritingFont] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(1); // 0=sm, 1=md, 2=lg
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active lesson state
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [boardMarkdown, setBoardMarkdown] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [courseContext, setCourseContext] = useState<{
    courseId?: string;
    chapterId?: string;
    programId?: string;
    programTopicId?: string;
    curriculumContext?: string;
    fullChapter?: boolean;
    chapterOutline?: string;
  }>({});

  // SpeechSynthesis & Gemini AI Neural TTS narrator state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState<boolean>(false);
  const [speechIndex, setSpeechIndex] = useState<number>(0);
  const speechSegments = useMemo(
    () => markdownToSpeechSegments(boardMarkdown),
    [boardMarkdown]
  );
  const speechActiveRef = useRef(false);
  const speechRunIdRef = useRef(0);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsBlobCacheRef = useRef<Map<string, string>>(new Map());
  const ttsInflightRef = useRef<Map<string, Promise<string>>>(new Map());
  const userPickedAiVoiceRef = useRef(false);

  // Right Drawer: Doubt Chat & Notes
  const [rightDrawer, setRightDrawer] = useState<"closed" | "doubt" | "notes">(
    "closed"
  );
  const [doubts, setDoubts] = useState<DoubtChatItem[]>([]);
  const [doubtInput, setDoubtInput] = useState("");
  const [askingDoubt, setAskingDoubt] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // Assistant Modal (Explain / Example / Summary / Recap)
  const [assistantModal, setAssistantModal] = useState<{
    open: boolean;
    title: string;
    content: string;
    loading: boolean;
  }>({ open: false, title: "", content: "", loading: false });

  // Action loading states for Quiz / Flashcards generation
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [creatingCards, setCreatingCards] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  async function handleViralShare() {
    const activeTopic = (lessonTitle || topic || "Interactive AI Lesson").trim();
    const params = new URLSearchParams();
    params.set("topic", activeTopic);
    if (mode) params.set("mode", mode);
    if (subject.trim()) params.set("subject", subject.trim());

    const shareUrl = `${window.location.origin}/classroom?${params.toString()}`;
    const shareText = `I just studied "${activeTopic}" on AshuTeacher's AI Voice Blackboard! Sign up for 30 free study credits and try this lesson:`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${activeTopic} — AshuTeacher AI`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or desktop fallback -> copy to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareCopied(true);
      setStatusMessage("Viral invite link copied! Paste on WhatsApp, Telegram, or Reddit.");
      setTimeout(() => setShareCopied(false), 2800);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  const abortControllerRef = useRef<AbortController | null>(null);
  const autostartTriggeredRef = useRef(false);

  // Load browser SpeechSynthesis voices (using addEventListener so LanguageSelector doesn't clash)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    function updateVoices() {
      const all = window.speechSynthesis.getVoices();
      setVoices(all);
    }
    updateVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", updateVoices);

    const cacheMap = ttsBlobCacheRef.current;
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", updateVoices);
      window.speechSynthesis.cancel();
      if (aiAudioRef.current) {
        aiAudioRef.current.pause();
        aiAudioRef.current.src = "";
        aiAudioRef.current = null;
      }
      for (const blobUrl of cacheMap.values()) {
        URL.revokeObjectURL(blobUrl);
      }
      cacheMap.clear();
    };
  }, []);

  const voicesForLanguage = useMemo(
    () => findBrowserVoicesForLanguage(voices, language),
    [voices, language]
  );
  const hasNativeBrowserVoice = voicesForLanguage.length > 0;

  const parsedLanguage = useMemo(
    () => parseLanguageAndScript(language),
    [language]
  );

  const activeLanguageDisplay = useMemo(
    () => parsedLanguage.languageName,
    [parsedLanguage]
  );

  useEffect(() => {
    if (hasNativeBrowserVoice) {
      if (userPickedAiVoiceRef.current && selectedVoiceName.startsWith("ai:")) {
        return;
      }
      if (!voicesForLanguage.some((v) => v.name === selectedVoiceName)) {
        setSelectedVoiceName(voicesForLanguage[0].name);
      }
    } else {
      // No native/same-script browser voice exists (e.g. Santali Ol Chiki, Manipuri, Custom dialect, or Odia on desktop Chrome).
      // Automatically switch to Gemini AI Neural Voice so native scripts are never skipped!
      if (!selectedVoiceName.startsWith("ai:")) {
        setSelectedVoiceName("ai:Kore");
      }
    }
  }, [hasNativeBrowserVoice, voicesForLanguage, selectedVoiceName]);

  // Keep active HTML5 AI audio speed synced when slider moves
  useEffect(() => {
    if (aiAudioRef.current) {
      aiAudioRef.current.playbackRate = speakingRate;
    }
  }, [speakingRate]);

  // Stop speech helper (both Browser SpeechSynthesis and Gemini AI Audio)
  const stopSpeaking = useCallback(() => {
    speechRunIdRef.current += 1;
    speechActiveRef.current = false;
    if (aiAudioRef.current) {
      aiAudioRef.current.onended = null;
      aiAudioRef.current.ontimeupdate = null;
      aiAudioRef.current.onerror = null;
      aiAudioRef.current.pause();
      aiAudioRef.current.src = "";
      aiAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSynthesizingAudio(false);
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const fetchAiTtsBlobUrl = useCallback(
    async (text: string, voiceName: string): Promise<string> => {
      const cacheKey = `${voiceName}::${text}`;
      const cached = ttsBlobCacheRef.current.get(cacheKey);
      if (cached) return cached;

      const existingPromise = ttsInflightRef.current.get(cacheKey);
      if (existingPromise) return existingPromise;

      const promise = (async () => {
        try {
          const res = await apiFetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice: voiceName }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `AI TTS error (${res.status})`);
          }
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          ttsBlobCacheRef.current.set(cacheKey, blobUrl);
          return blobUrl;
        } finally {
          ttsInflightRef.current.delete(cacheKey);
        }
      })();

      ttsInflightRef.current.set(cacheKey, promise);
      return promise;
    },
    []
  );

  // Speak starting from a specific segment index (Hybrid: Gemini AI Neural Voice or Browser Voice)
  const speakFromSegment = useCallback(
    (startIndex: number, segmentsOverride?: string[]) => {
      if (typeof window === "undefined") return;
      const segs = segmentsOverride || speechSegments;
      if (!segs.length || startIndex >= segs.length) {
        stopSpeaking();
        return;
      }

      // Cancel any prior run cleanly
      const runId = speechRunIdRef.current + 1;
      speechRunIdRef.current = runId;
      if (aiAudioRef.current) {
        aiAudioRef.current.onended = null;
        aiAudioRef.current.ontimeupdate = null;
        aiAudioRef.current.onerror = null;
        aiAudioRef.current.pause();
        aiAudioRef.current.src = "";
        aiAudioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      speechActiveRef.current = true;
      setIsSpeaking(true);
      setIsPaused(false);
      setSpeechIndex(startIndex);

      const useAiVoice =
        selectedVoiceName.startsWith("ai:") || !hasNativeBrowserVoice;

      if (useAiVoice) {
        const aiVoiceName = selectedVoiceName.startsWith("ai:")
          ? selectedVoiceName.slice(3)
          : "Kore";

        const buildBatch = (fromIdx: number) => {
          let endIdx = fromIdx;
          const parts: string[] = [segs[fromIdx]];
          let charCount = segs[fromIdx].length;
          while (
            endIdx + 1 < segs.length &&
            charCount + segs[endIdx + 1].length + 2 <= 580
          ) {
            endIdx += 1;
            parts.push(segs[endIdx]);
            charCount += segs[endIdx].length + 2;
          }
          return {
            endIdx,
            text: parts.join(" "),
            segLengths: parts.map((p) => Math.max(1, p.length)),
          };
        };

        const batch = buildBatch(startIndex);
        setIsSynthesizingAudio(true);

        fetchAiTtsBlobUrl(batch.text, aiVoiceName)
          .then((blobUrl) => {
            if (!speechActiveRef.current || speechRunIdRef.current !== runId) {
              return;
            }
            setIsSynthesizingAudio(false);

            // Prefetch next batch in the background for zero-gap transitions
            if (batch.endIdx + 1 < segs.length) {
              const nextBatch = buildBatch(batch.endIdx + 1);
              fetchAiTtsBlobUrl(nextBatch.text, aiVoiceName).catch(() => {});
            }

            const audio = new Audio(blobUrl);
            audio.playbackRate = speakingRate;
            aiAudioRef.current = audio;

            const totalChars = batch.segLengths.reduce((a, b) => a + b, 0);
            audio.ontimeupdate = () => {
              if (!audio.duration || !Number.isFinite(audio.duration)) return;
              const targetChar = (audio.currentTime / audio.duration) * totalChars;
              let acc = 0;
              let offset = 0;
              for (let i = 0; i < batch.segLengths.length; i++) {
                acc += batch.segLengths[i];
                if (targetChar <= acc) {
                  offset = i;
                  break;
                }
                offset = i;
              }
              setSpeechIndex(startIndex + offset);
            };

            audio.onended = () => {
              if (!speechActiveRef.current || speechRunIdRef.current !== runId) {
                return;
              }
              const nextIdx = batch.endIdx + 1;
              if (nextIdx < segs.length) {
                speakFromSegment(nextIdx, segs);
              } else {
                speechActiveRef.current = false;
                setIsSpeaking(false);
                setIsPaused(false);
              }
            };

            audio.onerror = () => {
              if (speechRunIdRef.current !== runId) return;
              speechActiveRef.current = false;
              setIsSpeaking(false);
              setIsSynthesizingAudio(false);
            };

            audio.play().catch((err) => {
              if (speechRunIdRef.current !== runId) return;
              speechActiveRef.current = false;
              setIsSpeaking(false);
              setStatusMessage(
                `Click Narrate to start audio (${err instanceof Error ? err.message : "autoplay blocked"}).`
              );
            });
          })
          .catch((err) => {
            if (speechRunIdRef.current !== runId) return;
            setIsSynthesizingAudio(false);
            speechActiveRef.current = false;
            setIsSpeaking(false);
            const reason =
              err instanceof Error ? err.message : "AI voice unavailable";
            if (!hasNativeBrowserVoice) {
              setStatusMessage(
                `No built-in browser voice for ${activeLanguageDisplay}. Sign in to enable AI Neural Voice (${reason}).`
              );
            } else {
              setStatusMessage(`AI Voice unavailable (${reason}). Select a Browser Voice.`);
            }
          });
        return;
      }

      if (!("speechSynthesis" in window)) {
        stopSpeaking();
        return;
      }

      const utter = new SpeechSynthesisUtterance(segs[startIndex]);
      const chosen = voicesForLanguage.find((v) => v.name === selectedVoiceName);
      if (chosen) utter.voice = chosen;
      utter.lang =
        chosen?.lang ||
        parsedLanguage.voiceLangCandidates[0] ||
        "en-IN";
      utter.rate = speakingRate;

      utter.onend = () => {
        if (!speechActiveRef.current || speechRunIdRef.current !== runId) return;
        const next = startIndex + 1;
        if (next < segs.length) {
          speakFromSegment(next, segs);
        } else {
          speechActiveRef.current = false;
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };

      utter.onerror = () => {
        if (speechRunIdRef.current !== runId) return;
        speechActiveRef.current = false;
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utter);
    },
    [
      speechSegments,
      voicesForLanguage,
      hasNativeBrowserVoice,
      selectedVoiceName,
      parsedLanguage,
      activeLanguageDisplay,
      speakingRate,
      stopSpeaking,
      fetchAiTtsBlobUrl,
    ]
  );

  // Load existing lesson if `?lessonId=...` is passed
  useEffect(() => {
    const qLessonId = searchParams.get("lessonId");
    const qTab = searchParams.get("tab") as SourceTab | null;
    const qMode = searchParams.get("mode");
    const qTopic = searchParams.get("topic");
    const qSubject = searchParams.get("subject");
    const qCourseId = searchParams.get("courseId") || undefined;
    const qChapterId = searchParams.get("chapterId") || undefined;
    const qProgramId = searchParams.get("programId") || undefined;
    const qProgramTopicId = searchParams.get("programTopicId") || undefined;
    const qCurriculum = searchParams.get("curriculum") || undefined;
    const qFullChapter = searchParams.get("fullChapter") === "1";
    let storedOutline: string | undefined = undefined;
    if (qFullChapter && typeof window !== "undefined") {
      storedOutline =
        window.sessionStorage.getItem("ashuteacher_chapter_outline") || undefined;
    }
    const qLevel = searchParams.get("level");
    const qLang = searchParams.get("lang");

    if (qTab && ["topic", "upload", "url", "paste"].includes(qTab)) {
      setSourceTab(qTab);
    }
    if (qMode) setMode(qMode);
    if (qTopic) setTopic(qTopic);
    if (qSubject) setSubject(qSubject);
    if (qLevel) {
      setLevel(qLevel);
      if (qLevel.includes("KG")) setSpeakingRate(0.9);
    }
    if (qLang) setLanguage(qLang);
    if (
      qCourseId ||
      qChapterId ||
      qProgramId ||
      qProgramTopicId ||
      qCurriculum ||
      qFullChapter
    ) {
      setCourseContext({
        courseId: qCourseId,
        chapterId: qChapterId,
        programId: qProgramId,
        programTopicId: qProgramTopicId,
        curriculumContext: qCurriculum,
        fullChapter: qFullChapter,
        chapterOutline: storedOutline,
      });
    }

    if (qLessonId) {
      setStatusMessage("Loading saved lesson...");
      fetch(`/api/lessons/${qLessonId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.lesson) {
            const l = data.lesson;
            setLessonId(l.id);
            setLessonTitle(l.title);
            setSubject(l.subject || "");
            setTopic(l.topic || "");
            setMode(l.mode || "lesson");
            setLanguage(l.language || "en-US");
            setLevel(l.level || "Intermediate");
            setBoardMarkdown(l.content || "");
            setNotes(l.notes || "");
            setIsFavorite(Boolean(l.isFavorite));
            setExtractedSourceText(l.sourceContent || "");
            if (Array.isArray(l.messages)) {
              setDoubts(
                l.messages.map((m: { id: string; role: "user" | "assistant"; content: string }) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                }))
              );
            }
            setStatusMessage("Saved lesson loaded");
          }
        })
        .catch(() => setStatusMessage("Could not load lesson"));
    }
  }, [searchParams]);

  // Handle File Upload / Screenshot Paste
  async function processUploadedFile(file: File, startPg = 1, endPg = 9999) {
    setUploadedFile(file);
    setExtracting(true);
    setStatusMessage(`Processing ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("startPage", String(startPg));
      formData.append("endPage", String(endPg));

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      setExtractedSourceText(data.text || "");
      if (!topic) setTopic(data.title || file.name);
      if (data.totalPages && data.totalPages > 1) {
        setPdfTotalPages(data.totalPages);
        if (endPg === 9999) {
          setPdfStartPage(1);
          setPdfEndPage(data.totalPages);
        }
      } else {
        setPdfTotalPages(0);
      }

      if (data.base64Data && data.mimeType) {
        setAttachment({
          mimeType: data.mimeType,
          base64Data: data.base64Data,
        });
      } else {
        setAttachment(null);
      }
      setStatusMessage("Document ready");
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to read file"
      );
    } finally {
      setExtracting(false);
    }
  }

  async function handleUrlExtract() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setExtracting(true);
    setUrlStatus("Fetching document server-side (no CORS limits)...");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          startPage: pdfStartPage,
          endPage: pdfTotalPages ? pdfEndPage : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch URL");

      setExtractedSourceText(data.text || "");
      if (!topic) setTopic(data.title || "Web Source");
      if (data.isPdf && data.totalPages > 1) {
        setPdfTotalPages(data.totalPages);
        setPdfStartPage(1);
        setPdfEndPage(data.totalPages);
      } else {
        setPdfTotalPages(0);
      }
      if (data.base64Data && data.mimeType) {
        setAttachment({
          mimeType: data.mimeType,
          base64Data: data.base64Data,
        });
      } else {
        setAttachment(null);
      }
      setUrlStatus(
        `Loaded "${data.title}" (${(data.text || "").length.toLocaleString()} chars)`
      );
      setStatusMessage("URL content ready");
    } catch (err) {
      setUrlStatus(err instanceof Error ? err.message : "Failed to load URL");
    } finally {
      setExtracting(false);
    }
  }

  // Generate & Stream Lesson onto Blackboard
  const startTeaching = useCallback(
    async (
      overrideMode?: string,
      overrideTopic?: string,
      overrideSubject?: string,
      overrideExtras?: {
        lang?: string;
        level?: string;
        programId?: string;
        programTopicId?: string;
        curriculumContext?: string;
        fullChapter?: boolean;
        chapterOutline?: string;
      }
    ) => {
      const activeMode = overrideMode || mode;
      const activeTopic = (overrideTopic ?? topic).trim();
      const activeSubject = (overrideSubject ?? subject).trim() || "General";
      const activeLanguage = overrideExtras?.lang || language;
      const activeLevel = overrideExtras?.level || level;

      let sourceContent = "";
      if (sourceTab === "paste") {
        sourceContent = pastedText.trim();
      } else if (sourceTab === "upload" || sourceTab === "url") {
        sourceContent = extractedSourceText.trim();
      }

      if (!activeTopic && !sourceContent && !attachment) {
        setStatusMessage("Please enter a topic, paste text, or upload a file first.");
        return;
      }

      stopSpeaking();
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsGenerating(true);
      setBoardMarkdown("");
      setDoubts([]);
      setLessonId(null);
      const displayTitle =
        activeTopic ||
        uploadedFile?.name ||
        (sourceTab === "paste" ? "Custom Text Session" : "Interactive Session");
      setLessonTitle(displayTitle);
      setStatusMessage("Streaming live lesson from Gemini...");

      // Auto-collapse studio panel on narrow screens so blackboard shines
      if (typeof window !== "undefined" && window.innerWidth < 1100) {
        setSidebarOpen(false);
      }

      try {
        // Re-extract PDF page range if user adjusted page numbers on uploaded file
        if (sourceTab === "upload" && uploadedFile && pdfTotalPages > 1) {
          const fd = new FormData();
          fd.append("file", uploadedFile);
          fd.append("startPage", String(pdfStartPage));
          fd.append("endPage", String(pdfEndPage));
          const extRes = await fetch("/api/extract", { method: "POST", body: fd });
          if (extRes.ok) {
            const extData = await extRes.json();
            sourceContent = extData.text || sourceContent;
          }
        }

        const res = await apiFetch("/api/teach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            topic: displayTitle,
            subject: activeSubject,
            mode: activeMode,
            sourceType:
              courseContext.courseId ||
              courseContext.programId ||
              overrideExtras?.programId
                ? "course"
                : sourceTab,
            sourceContent,
            language: activeLanguage,
            level: activeLevel,
            courseId: courseContext.courseId,
            chapterId: courseContext.chapterId,
            programId: overrideExtras?.programId || courseContext.programId,
            programTopicId:
              overrideExtras?.programTopicId || courseContext.programTopicId,
            curriculumContext:
              overrideExtras?.curriculumContext || courseContext.curriculumContext,
            fullChapter: Boolean(
              overrideExtras?.fullChapter ?? courseContext.fullChapter
            ),
            chapterOutline:
              overrideExtras?.chapterOutline || courseContext.chapterOutline || "",
            model: getStoredModel(),
            attachment,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `Error ${res.status}`);
        }

        const newId = res.headers.get("X-Lesson-Id");
        if (newId) setLessonId(newId);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            setBoardMarkdown(accumulated);
          }
        }

        setStatusMessage("Lesson ready");

        if (autoNarrate && activeMode !== "solve" && accumulated.trim()) {
          const segs = markdownToSpeechSegments(accumulated);
          if (segs.length > 0) {
            setTimeout(() => speakFromSegment(0, segs), 250);
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          setStatusMessage("Generation stopped");
        } else {
          setStatusMessage(
            err instanceof Error ? err.message : "Failed to generate lesson"
          );
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [
      mode,
      topic,
      subject,
      sourceTab,
      pastedText,
      extractedSourceText,
      attachment,
      uploadedFile,
      pdfTotalPages,
      pdfStartPage,
      pdfEndPage,
      courseContext,
      language,
      level,
      autoNarrate,
      stopSpeaking,
      speakFromSegment,
    ]
  );

  // Trigger autostart when navigated from Dashboard or Course Builder
  useEffect(() => {
    const autostart = searchParams.get("autostart");
    const qTopic = searchParams.get("topic");
    const qMode = searchParams.get("mode") || "lesson";
    const qSubject = searchParams.get("subject") || "General";

    if (autostart === "1" && qTopic && !autostartTriggeredRef.current) {
      autostartTriggeredRef.current = true;
      const isFullCh = searchParams.get("fullChapter") === "1";
      const outline =
        isFullCh && typeof window !== "undefined"
          ? window.sessionStorage.getItem("ashuteacher_chapter_outline") || undefined
          : undefined;
      startTeaching(qMode, qTopic, qSubject, {
        lang: searchParams.get("lang") || undefined,
        level: searchParams.get("level") || undefined,
        programId: searchParams.get("programId") || undefined,
        programTopicId: searchParams.get("programTopicId") || undefined,
        curriculumContext: searchParams.get("curriculum") || undefined,
        fullChapter: isFullCh,
        chapterOutline: outline,
      });
    }
  }, [searchParams, startTeaching]);

  // Toggle favorite on current lesson
  async function handleToggleFavorite() {
    if (!lessonId) return;
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    await fetch(`/api/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: nextVal }),
    }).catch(() => null);
  }

  // Save study notes
  async function handleSaveNotes() {
    if (!lessonId) return;
    await fetch(`/api/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  // Run 1-click contextual AI assistant tools
  async function runAssistantFeature(feature: string, label: string) {
    if (!boardMarkdown && !extractedSourceText && !topic) return;
    setAssistantModal({
      open: true,
      title: label,
      content: "",
      loading: true,
    });

    try {
      const res = await apiFetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          topic: lessonTitle || topic,
          context: boardMarkdown || extractedSourceText,
          language,
          level,
          model: getStoredModel(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Assistant request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setAssistantModal((prev) => ({ ...prev, content: acc, loading: false }));
        }
      }
    } catch (err) {
      setAssistantModal((prev) => ({
        ...prev,
        loading: false,
        content: `**Error:** ${err instanceof Error ? err.message : "Request failed"}`,
      }));
    }
  }

  // Generate Structured Quiz from Lesson & Open Practice Arena
  async function handleGenerateQuizFromLesson() {
    const contextMaterial = boardMarkdown || extractedSourceText || pastedText;
    const quizTopic = lessonTitle || topic;
    if (!quizTopic && !contextMaterial) return;

    setCreatingQuiz(true);
    setStatusMessage("Building structured interactive quiz...");
    try {
      const res = await apiFetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: quizTopic || "Current Lesson",
          sourceContent: contextMaterial,
          questionCount: 10,
          level,
          language,
          lessonId,
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      router.push(`/practice?quizId=${data.quiz.id}`);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Quiz generation failed");
    } finally {
      setCreatingQuiz(false);
    }
  }

  // Generate 3D Flashcards from Lesson & Open Practice Arena
  async function handleGenerateFlashcardsFromLesson() {
    const contextMaterial = boardMarkdown || extractedSourceText || pastedText;
    const deckTopic = lessonTitle || topic;
    if (!deckTopic && !contextMaterial) return;

    setCreatingCards(true);
    setStatusMessage("Creating 3D active-recall flashcards...");
    try {
      const res = await apiFetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: deckTopic || "Current Lesson",
          sourceContent: contextMaterial,
          cardCount: 12,
          level,
          language,
          lessonId,
          model: getStoredModel(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate flashcards");
      router.push(`/practice?tab=flashcards&deckId=${data.flashcardSet.id}`);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Flashcard generation failed"
      );
    } finally {
      setCreatingCards(false);
    }
  }

  // Raise Hand Doubt Chat submission
  async function handleAskDoubt(e?: React.FormEvent) {
    e?.preventDefault();
    const q = doubtInput.trim();
    if (!q || askingDoubt) return;

    const prevHistory = [...doubts];
    setDoubtInput("");
    setAskingDoubt(true);
    setDoubts((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "" },
    ]);

    try {
      const res = await apiFetch("/api/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          question: q,
          lessonContext: boardMarkdown || extractedSourceText,
          topic: lessonTitle || topic || "General Concept",
          language,
          level,
          history: prevHistory,
          model: getStoredModel(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not answer question");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          setDoubts((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: reply };
            return copy;
          });
        }
      }
    } catch (err) {
      setDoubts((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${
            err instanceof Error ? err.message : "Failed"
          }`,
        };
        return copy;
      });
    } finally {
      setAskingDoubt(false);
    }
  }

  // Voice Speech-to-Text for Doubt Chat
  function toggleVoiceDoubtMic() {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Voice recognition is supported in Chrome, Edge, and Safari.");
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    const recognition = new SpeechRec() as {
      lang: string;
      interimResults: boolean;
      onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
    };
    recognition.lang =
      parsedLanguage.voiceLangCandidates[0] ||
      (parsedLanguage.baseCode.startsWith("custom:") ||
      parsedLanguage.baseCode === "hinglish"
        ? "en-IN"
        : parsedLanguage.baseCode);
    recognition.interimResults = false;
    setIsListeningMic(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      if (transcript) {
        setDoubtInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => setIsListeningMic(false);
    recognition.onend = () => setIsListeningMic(false);
    recognition.start();
  }

  const fontSizeClass =
    fontScale === 0
      ? "text-base"
      : fontScale === 2
        ? useHandwritingFont
          ? "text-3xl"
          : "text-xl"
        : useHandwritingFont
          ? "text-2xl"
          : "text-lg";

  const boardSurfaceClass =
    boardTheme === "chalk"
      ? "board-chalk"
      : boardTheme === "paper"
        ? "board-paper"
        : "board-photon";

  return (
    <div
      className={`flex h-full w-full overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#090d16]" : ""
      }`}
    >
      {/* LEFT PANEL: Lesson Studio Controls */}
      {sidebarOpen && !isFullscreen && (
        <div className="w-full sm:w-88 lg:w-92 shrink-0 border-r border-white/10 bg-[#0d1424] flex flex-col h-full overflow-y-auto p-5 space-y-5 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Lesson Studio
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              title="Collapse Studio Panel"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* 4 Source Tabs */}
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-950/80 p-1 border border-white/10">
            {(
              [
                { id: "topic", label: "Topic", icon: Sparkles },
                { id: "upload", label: "Upload", icon: Upload },
                { id: "url", label: "URL", icon: Globe },
                { id: "paste", label: "Paste", icon: FileText },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              const active = sourceTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSourceTab(t.id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition ${
                    active
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {sourceTab === "topic" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subject / Course
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Physics, Organic Chemistry, Economics"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Topic or Question
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Maxwell's Equations & Electromagnetic Waves"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {sourceTab === "upload" && (
            <div
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                for (const item of Array.from(items)) {
                  if (item.kind === "file") {
                    const f = item.getAsFile();
                    if (f) processUploadedFile(f);
                  }
                }
              }}
              className="space-y-3"
            >
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-950/50 px-4 py-6 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-500/5 transition">
                <Upload className="h-6 w-6 text-cyan-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  {uploadedFile
                    ? uploadedFile.name
                    : "Click to upload PDF, Image, TXT, MD"}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Or press Ctrl+V here to paste a screenshot!
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processUploadedFile(f);
                  }}
                />
              </label>

              {extracting && (
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Extracting document...
                </div>
              )}

              {pdfTotalPages > 1 && (
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 space-y-2">
                  <div className="text-xs font-medium text-slate-300">
                    PDF Page Range ({pdfTotalPages} pages total)
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">From</span>
                    <input
                      type="number"
                      min={1}
                      max={pdfTotalPages}
                      value={pdfStartPage}
                      onChange={(e) => setPdfStartPage(Number(e.target.value))}
                      className="w-16 rounded-lg border border-white/15 bg-slate-900 px-2 py-1 text-center text-white"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      min={pdfStartPage}
                      max={pdfTotalPages}
                      value={pdfEndPage}
                      onChange={(e) => setPdfEndPage(Number(e.target.value))}
                      className="w-16 rounded-lg border border-white/15 bg-slate-900 px-2 py-1 text-center text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {sourceTab === "url" && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Any Web Article or Remote PDF URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://arxiv.org/pdf/... or article URL"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={handleUrlExtract}
                  disabled={extracting}
                  className="rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50 transition"
                >
                  {extracting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Fetch"
                  )}
                </button>
              </div>
              {urlStatus && (
                <p className="text-[11px] text-slate-400 leading-snug">
                  {urlStatus}
                </p>
              )}
            </div>
          )}

          {sourceTab === "paste" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Paste Notes, Textbook Excerpt, or Exam Questions
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your study material or problem set here..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}

          {/* Teaching Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Teaching Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEACHING_MODES.map((m) => {
                const active = mode === m.id;
                const Icon =
                  m.id === "story"
                    ? BookOpen
                    : m.id === "solve"
                      ? FileCheck2
                      : m.id === "cheatsheet"
                        ? ListChecks
                        : Sparkles;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                      active
                        ? "border-cyan-400 bg-cyan-500/15 text-white shadow-sm"
                        : "border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-cyan-400" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{m.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-1">
            {isGenerating ? (
              <button
                onClick={() => abortControllerRef.current?.abort()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 px-4 text-sm font-bold text-white shadow-lg hover:bg-rose-500 transition"
              >
                <Square className="h-4 w-4 fill-current" />
                Stop Generation
              </button>
            ) : (
              <button
                onClick={() => startTeaching()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
              >
                <Play className="h-4 w-4 fill-current" />
                {mode === "solve"
                  ? "Solve Paper Step-by-Step"
                  : mode === "story"
                    ? "Tell Educational Story"
                    : mode === "cheatsheet"
                      ? "Build Formula Cheat Sheet"
                      : "Start Interactive Lesson"}
              </button>
            )}
          </div>

          {/* Voice & Student Level Settings */}
          <div className="space-y-3.5 border-t border-white/10 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pedagogy & Voice Settings
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Student Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                {STUDENT_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id} className="bg-slate-900">
                    {lvl.label} — {lvl.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 items-start">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Language (Indian &amp; World)
                </label>
                <LanguageSelector
                  value={language}
                  onChange={(nextLang) => {
                    stopSpeaking();
                    setLanguage(nextLang);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Narrator Voice
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    const nextVoice = e.target.value;
                    userPickedAiVoiceRef.current = nextVoice.startsWith("ai:");
                    stopSpeaking();
                    setSelectedVoiceName(nextVoice);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  {hasNativeBrowserVoice && (
                    <optgroup
                      label="🔊 Built-in Browser Voices (Instant / Offline)"
                      className="bg-slate-950 text-emerald-300 font-semibold"
                    >
                      {voicesForLanguage.map((v) => (
                        <option
                          key={v.name}
                          value={v.name}
                          className="bg-slate-900 text-white font-normal"
                        >
                          🔊 {v.name.replace(/Microsoft |Google /g, "")}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup
                    label="✨ Gemini AI Neural Voices (Reads All Indian & World Scripts)"
                    className="bg-slate-950 text-cyan-300 font-semibold"
                  >
                    {AI_TTS_VOICES.map((av) => (
                      <option
                        key={av.id}
                        value={av.id}
                        className="bg-slate-900 text-white font-normal"
                      >
                        {av.label}
                      </option>
                    ))}
                  </optgroup>

                  {!hasNativeBrowserVoice && (
                    <optgroup
                      label="🔇 Browser Voice Status"
                      className="bg-slate-950 text-amber-300 font-semibold"
                    >
                      <option disabled value="__none__" className="bg-slate-900 text-slate-400">
                        Browser voice unavailable for {activeLanguageDisplay}
                      </option>
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {!hasNativeBrowserVoice && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-snug text-amber-200">
                <span className="font-semibold text-amber-300">
                  Browser voice unavailable for {activeLanguageDisplay}:
                </span>{" "}
                Switched automatically to{" "}
                <span className="font-semibold text-cyan-300">
                  ✨ Gemini AI Neural Voice
                </span>{" "}
                so every native script word is spoken aloud instead of skipping non-English text.
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Speaking Speed</span>
                <span className="font-mono text-cyan-300">{speakingRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={2.0}
                step={0.1}
                value={speakingRate}
                onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoNarrate}
                onChange={(e) => setAutoNarrate(e.target.checked)}
                className="rounded border-white/20 bg-slate-900 text-cyan-500"
              />
              Auto-speak lesson when ready
            </label>
          </div>
        </div>
      )}

      {/* CENTER PANEL: Interactive Smart Blackboard */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Classroom Toolbar */}
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            {!sidebarOpen && !isFullscreen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Open Lesson Studio"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isGenerating
                      ? "bg-cyan-400 animate-ping"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="truncate text-sm font-bold text-white">
                  {lessonTitle || "Interactive Blackboard"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{statusMessage}</p>
            </div>
          </div>

          {/* Voice Narrator Transport Controls */}
          {boardMarkdown && (
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/90 px-2.5 py-1.5">
              <Volume2 className="h-3.5 w-3.5 text-cyan-400 mr-1" />
              <button
                onClick={() => speakFromSegment(Math.max(0, speechIndex - 1))}
                disabled={speechIndex <= 0}
                className="rounded p-1 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                title="Previous Section"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>

              {!isSpeaking ? (
                <button
                  onClick={() => speakFromSegment(speechIndex)}
                  className="flex items-center gap-1 rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>
                    {selectedVoiceName.startsWith("ai:") || !hasNativeBrowserVoice
                      ? "Narrate (AI)"
                      : "Narrate"}
                  </span>
                </button>
              ) : isSynthesizingAudio ? (
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition"
                  title="Synthesizing Gemini AI Neural Voice..."
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>AI Voice...</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (aiAudioRef.current) {
                      if (isPaused) {
                        aiAudioRef.current.play().catch(() => {});
                        setIsPaused(false);
                      } else {
                        aiAudioRef.current.pause();
                        setIsPaused(true);
                      }
                      return;
                    }
                    if (isPaused) {
                      window.speechSynthesis.resume();
                      setIsPaused(false);
                    } else {
                      window.speechSynthesis.pause();
                      setIsPaused(true);
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => speakFromSegment(speechIndex + 1)}
                disabled={speechIndex >= speechSegments.length - 1}
                className="rounded p-1 text-slate-300 hover:bg-white/10 disabled:opacity-30"
                title="Next Section"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="rounded p-1 text-rose-400 hover:bg-rose-500/15"
                  title="Stop Narration"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}

              <span className="text-[10px] font-mono text-slate-400 pl-1">
                {Math.min(speechIndex + 1, speechSegments.length)}/{speechSegments.length}
              </span>
            </div>
          )}

          {/* Board Appearance & Utility Controls */}
          <div className="flex items-center gap-1.5">
            {/* Theme pills */}
            <div className="hidden md:flex items-center rounded-lg border border-white/10 bg-slate-900 p-0.5 text-[11px]">
              {(["chalk", "photon", "paper"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setBoardTheme(t)}
                  className={`rounded-md px-2 py-1 capitalize font-medium transition ${
                    boardTheme === t
                      ? "bg-cyan-500/25 text-cyan-200"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setUseHandwritingFont(!useHandwritingFont)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                useHandwritingFont
                  ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
              title="Toggle Chalk Handwriting vs Crisp Sans Font"
            >
              Aa
            </button>

            <button
              onClick={() => setFontScale((s) => (s + 1) % 3)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10"
              title="Cycle Text Size"
            >
              {fontScale === 0 ? "A-" : fontScale === 2 ? "A+" : "A"}
            </button>

            {lessonId && (
              <button
                onClick={handleToggleFavorite}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                title="Save to Favorites"
              >
                <Star
                  className={`h-4 w-4 ${
                    isFavorite ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
              </button>
            )}

            {boardMarkdown && (
              <>
                <button
                  onClick={handleViralShare}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    shareCopied
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                      : "border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                  }`}
                  title="Share Lesson & Invite Friends (30 Free Credits)"
                >
                  {shareCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span className="hidden sm:inline">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                  title="Print / Save Vector PDF"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              onClick={() =>
                setRightDrawer((d) => (d === "doubt" ? "closed" : "doubt"))
              }
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                rightDrawer === "doubt"
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200"
                  : "border-amber-400/30 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25"
              }`}
            >
              <Hand className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Raise Hand</span>
            </button>

            <button
              onClick={() =>
                setRightDrawer((d) => (d === "notes" ? "closed" : "notes"))
              }
              className={`rounded-lg border p-2 transition ${
                rightDrawer === "notes"
                  ? "border-cyan-400 bg-cyan-500/25 text-cyan-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
              title="Personal Study Notes"
            >
              <StickyNote className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Blackboard Surface */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 print:p-0 print:overflow-visible">
          <div
            className={`mx-auto max-w-4xl min-h-full rounded-3xl p-6 sm:p-10 transition-colors ${boardSurfaceClass} ${
              useHandwritingFont ? "font-chalk-handwriting" : ""
            } ${fontSizeClass}`}
          >
            {!boardMarkdown && !isGenerating ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center px-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Your Smart Blackboard is Ready
                </h2>
                <p className="max-w-md text-sm opacity-75 leading-relaxed mb-6 font-sans">
                  Enter any topic, upload a PDF or exam screenshot, or fetch a URL from the Lesson Studio on the left to begin a live interactive session.
                </p>
                <div className="flex flex-wrap justify-center gap-2 font-sans">
                  {[
                    "Schrödinger's Wave Equation",
                    "Dynamic Programming Intuition",
                    "Photosynthesis Calvin Cycle",
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => {
                        setTopic(sample);
                        startTeaching("lesson", sample, "STEM");
                      }}
                      className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-500/20 transition"
                    >
                      Teach &ldquo;{sample}&rdquo; →
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {boardMarkdown ? (
                  <MarkdownRenderer
                    content={boardMarkdown}
                    activeSpeechSnippet={
                      isSpeaking ? speechSegments[speechIndex] : undefined
                    }
                  />
                ) : (
                  <div className="flex items-center gap-3 py-12 text-cyan-300 font-sans text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Preparing your blackboard lesson...</span>
                  </div>
                )}

                {isGenerating && boardMarkdown && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-sans text-cyan-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Writing on blackboard...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Contextual AI Study Bar */}
        {boardMarkdown && !isGenerating && (
          <div className="border-t border-white/10 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md print:hidden">
            <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() =>
                  runAssistantFeature("explain", "Simpler Intuitive Explanation")
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-400/30 bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-500/25 transition"
              >
                <Search className="h-3.5 w-3.5" />
                Explain Simpler
              </button>
              <button
                onClick={() =>
                  runAssistantFeature("example", "Real-World Worked Examples")
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 transition"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Real-World Example
              </button>
              <button
                onClick={() =>
                  runAssistantFeature("summarize", "Executive Summary")
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-500/25 transition"
              >
                <AlignLeft className="h-3.5 w-3.5" />
                Summarize
              </button>
              <button
                onClick={() =>
                  runAssistantFeature("recap", "Formulas & Laws Recap")
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition"
              >
                <Sigma className="h-3.5 w-3.5" />
                Recap Formulas
              </button>

              <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />

              <button
                onClick={handleGenerateQuizFromLesson}
                disabled={creatingQuiz}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 disabled:opacity-50 transition"
              >
                {creatingQuiz ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <BrainCircuit className="h-3.5 w-3.5" />
                )}
                Quiz Me on This
              </button>

              <button
                onClick={handleGenerateFlashcardsFromLesson}
                disabled={creatingCards}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3.5 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50 transition"
              >
                {creatingCards ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Layers className="h-3.5 w-3.5" />
                )}
                3D Flashcards
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT DRAWER: "Raise Hand" Live Doubt Chat & Personal Study Notes */}
      {rightDrawer !== "closed" && (
        <aside className="w-full sm:w-96 shrink-0 border-l border-white/10 bg-[#0d1424] flex flex-col h-full print:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => setRightDrawer("doubt")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  rightDrawer === "doubt"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Raise Hand Q&A
              </button>
              <button
                onClick={() => setRightDrawer("notes")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  rightDrawer === "notes"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                My Notes
              </button>
            </div>
            <button
              onClick={() => setRightDrawer("closed")}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {rightDrawer === "doubt" ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {doubts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-center mt-6">
                    <Hand className="mx-auto h-7 w-7 text-amber-400 mb-2" />
                    <p className="text-sm font-semibold text-white">
                      Have a doubt? Raise your hand!
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ask anything about the current lesson by typing or clicking the microphone.
                    </p>
                  </div>
                ) : (
                  doubts.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "ml-6 bg-cyan-600/25 border border-cyan-400/30 text-cyan-50"
                          : "mr-3 bg-slate-900 border border-white/10 text-slate-200"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider opacity-60">
                        <span>{m.role === "user" ? "You" : "AshuTeacher"}</span>
                        {m.role === "assistant" && m.content && (
                          <button
                            onClick={() => {
                              const segs = markdownToSpeechSegments(m.content);
                              if (segs.length) speakFromSegment(0, segs);
                            }}
                            className="text-cyan-300 hover:underline"
                          >
                            Speak
                          </button>
                        )}
                      </div>
                      <MarkdownRenderer content={m.content || "..."} />
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAskDoubt}
                className="border-t border-white/10 p-3 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleVoiceDoubtMic}
                  className={`rounded-xl p-2.5 transition ${
                    isListeningMic
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  title="Ask with Voice"
                >
                  {isListeningMic ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="text"
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={askingDoubt || !doubtInput.trim()}
                  className="rounded-xl bg-cyan-500 p-2.5 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition"
                >
                  {askingDoubt ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-4 space-y-3">
              <p className="text-xs text-slate-400">
                Jot down key takeaways, personal mnemonics, or exam reminders for this session.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your personal notes here..."
                className="flex-1 w-full rounded-xl border border-white/15 bg-slate-950/80 p-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={!lessonId}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40 transition"
              >
                {notesSaved ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Notes Saved!
                  </>
                ) : lessonId ? (
                  "Save Notes to Library"
                ) : (
                  "Start a lesson to save notes"
                )}
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Assistant Output Modal */}
      {assistantModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-bold text-cyan-300">
                {assistantModal.title}
              </h3>
              <button
                onClick={() =>
                  setAssistantModal((p) => ({ ...p, open: false }))
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-100">
              {assistantModal.loading && !assistantModal.content ? (
                <div className="flex items-center gap-2 text-cyan-300 py-8 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating insights...</span>
                </div>
              ) : (
                <MarkdownRenderer content={assistantModal.content} />
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-3">
              {assistantModal.content && (
                <button
                  onClick={() => {
                    const segs = markdownToSpeechSegments(assistantModal.content);
                    if (segs.length) speakFromSegment(0, segs);
                  }}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/25"
                >
                  Read Aloud
                </button>
              )}
              <button
                onClick={() =>
                  setAssistantModal((p) => ({ ...p, open: false }))
                }
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassroomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Loading Interactive Classroom...
        </div>
      }
    >
      <ClassroomInner />
    </Suspense>
  );
}
