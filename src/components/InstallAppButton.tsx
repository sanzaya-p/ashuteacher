"use client";

import React, { useEffect, useState } from "react";
import { Smartphone, Download, Share, X, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker for Android WebAPK & PWABuilder store compliance
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Check if already running as installed standalone app
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuide(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }
    setShowGuide(true);
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex w-full items-center justify-between rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-left text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 transition"
      >
        <span className="flex items-center gap-2">
          <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
          Install Android / iOS App
        </span>
        <Download className="h-3.5 w-3.5 text-cyan-300" />
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-black">
                AT
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Install AshuTeacher Mobile App
                </h3>
                <p className="text-xs text-slate-400">
                  Full-screen Android &amp; iOS experience • Zero storage bloat
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/70 p-4 text-xs text-slate-300">
                <p className="font-semibold text-cyan-300">
                  On iPhone / iPad (Safari):
                </p>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    1
                  </span>
                  <span>
                    Tap the <Share className="inline h-3.5 w-3.5 text-cyan-400 mx-0.5" />{" "}
                    <strong>Share</strong> icon in Safari&apos;s bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>, then tap <strong>Add</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/70 p-4 text-xs text-slate-300">
                <a
                  href="/downloads/AshuTeacher.apk"
                  download="AshuTeacher.apk"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-4 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 transition"
                >
                  <Download className="h-4 w-4" />
                  Download Android .APK (1.3 MB)
                </a>
                <p className="font-semibold text-cyan-300 pt-1">
                  Or instant 1-tap browser install:
                </p>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    <strong>Android Chrome:</strong> Tap the browser menu (<strong>⋮</strong>) and tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    <strong>Desktop Chrome / Edge:</strong> Click the <strong>Install</strong> icon on the right side of your address bar.
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white hover:brightness-110 transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
