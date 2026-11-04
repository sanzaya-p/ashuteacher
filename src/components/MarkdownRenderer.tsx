"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function sanitizeMermaidChart(raw: string): string {
  // Auto-quote unquoted square-bracket node labels that contain parentheses or equals signs
  // e.g. A[ବାହ୍ୟ ବଳ (Force)] -> A["ବାହ୍ୟ ବଳ (Force)"]
  return raw
    .trim()
    .replace(/(\b[A-Za-z0-9_]+)\[(?!")([^\][\n]*[()=][^\][\n]*)\]/g, '$1["$2"]');
}

function cleanupMermaidOrphans(renderId?: string) {
  if (typeof document === "undefined") return;
  if (renderId) {
    document.getElementById(renderId)?.remove();
    document.getElementById(`d${renderId}`)?.remove();
  }
  document
    .querySelectorAll('body > [id^="dmermaid-"], body > [id^="mermaid-"]')
    .forEach((el) => el.remove());
}

function MermaidBlock({ chart }: { chart: string }) {
  const rawId = useId();
  const safeId = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const timer = setTimeout(async () => {
      const cleaned = sanitizeMermaidChart(chart);
      if (!cleaned) return;

      const renderId = `${safeId}-${Math.floor(Math.random() * 100000)}`;
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "Inter, sans-serif",
        });
        mermaid.setParseErrorHandler(() => {});

        const isValid = await mermaid.parse(cleaned, { suppressErrors: true });
        if (!isValid) {
          // Likely still streaming token-by-token; only show raw fallback if still invalid after 2.5s
          fallbackTimer = setTimeout(() => {
            if (!cancelled) setError(true);
          }, 2500);
          return;
        }

        const { svg: renderedSvg } = await mermaid.render(renderId, cleaned);
        if (renderedSvg.includes("Syntax error in text")) {
          fallbackTimer = setTimeout(() => {
            if (!cancelled) setError(true);
          }, 2500);
          return;
        }
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch {
        fallbackTimer = setTimeout(() => {
          if (!cancelled) setError(true);
        }, 2500);
      } finally {
        cleanupMermaidOrphans(renderId);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [chart, safeId]);

  if (svg) {
    return (
      <div
        className="my-6 flex justify-center rounded-2xl bg-slate-950/60 border border-cyan-500/20 p-5 overflow-x-auto shadow-inner"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  if (error) {
    return (
      <pre className="my-4 rounded-xl bg-slate-900/80 border border-slate-700/70 p-4 text-xs text-slate-300 overflow-x-auto font-mono">
        {chart}
      </pre>
    );
  }

  return (
    <div className="my-4 rounded-xl bg-slate-900/50 border border-cyan-500/20 p-6 text-center text-sm text-slate-400">
      Sketching diagram on blackboard...
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  activeSpeechSnippet?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
  activeSpeechSnippet,
}: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Highlight the block currently matching the spoken segment
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prev = container.querySelectorAll(".active-speech-block");
    prev.forEach((el) => el.classList.remove("active-speech-block"));

    if (!activeSpeechSnippet || activeSpeechSnippet.length < 6) return;

    const normalizedTarget = activeSpeechSnippet
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 36);

    if (!normalizedTarget) return;

    const blocks = container.querySelectorAll("p, li, h1, h2, h3, h4, blockquote");
    for (const block of Array.from(blocks)) {
      const blockText = (block.textContent || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ");
      if (blockText.includes(normalizedTarget)) {
        block.classList.add("active-speech-block");
        block.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  }, [activeSpeechSnippet]);

  return (
    <div ref={containerRef} dir="auto" className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || "");
            const codeString = String(children).replace(/\n$/, "");
            if (match && match[1] === "mermaid") {
              return <MermaidBlock chart={codeString} />;
            }
            const isBlock = Boolean(match) || codeString.includes("\n");
            if (isBlock) {
              return (
                <pre className="my-4 rounded-xl bg-slate-950/85 border border-white/10 p-4 overflow-x-auto text-sm font-mono text-cyan-100 leading-relaxed">
                  <code className={codeClass} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code
                className="rounded-md bg-cyan-500/15 border border-cyan-400/20 px-1.5 py-0.5 text-[0.9em] font-mono text-cyan-200"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="my-5 overflow-x-auto rounded-xl border border-white/15">
                <table className="w-full border-collapse text-left text-base">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="bg-white/10 px-4 py-2.5 font-semibold border-b border-white/15">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2.5 border-b border-white/10">{children}</td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
