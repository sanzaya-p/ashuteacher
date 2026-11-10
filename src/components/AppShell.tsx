"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Presentation,
  GraduationCap,
  BrainCircuit,
  Library,
  Settings,
  Sparkles,
  Flame,
  KeyRound,
  CheckCircle2,
  Menu,
  X,
  Zap,
  LogIn,
  LogOut,
  Coins,
  ShieldCheck,
  Compass,
  FlaskConical,
  Globe,
} from "lucide-react";
import {
  getStoredApiKey,
  promptApiKeyModal,
  promptAuthModal,
  subscribeKeyUpdated,
  subscribeWalletUpdated,
} from "@/lib/client-api";
import { ApiKeyModal } from "./ApiKeyModal";
import { AuthModal } from "./AuthModal";
import { PaywallModal } from "./PaywallModal";
import { InstallAppButton } from "./InstallAppButton";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/academy", label: "Syllabus Academy", icon: Compass },
  { href: "/classroom", label: "Classroom", icon: Presentation },
  { href: "/research", label: "Research & Projects", icon: FlaskConical },
  { href: "/courses", label: "Course Builder", icon: GraduationCap },
  { href: "/practice", label: "Quiz & Cards", icon: BrainCircuit },
  { href: "/explore", label: "Explore Study Hubs", icon: Globe },
  { href: "/library", label: "Saved Library", icon: Library },
  { href: "/pricing", label: "Credits & Pricing", icon: Coins },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarNav({
  onSelect,
  onPathnameChange,
  showAdmin,
}: {
  onSelect: () => void;
  onPathnameChange: (p: string) => void;
  showAdmin: boolean;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onPathnameChange(pathname);
  }, [pathname, onPathnameChange]);

  const items = showAdmin
    ? [...NAV_ITEMS, { href: "/admin", label: "Founder Admin", icon: ShieldCheck }]
    : NAV_ITEMS;

  return (
    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onSelect}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/15 text-cyan-300 border border-cyan-400/30 shadow-sm"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent"
            }`}
          >
            <Icon
              className={`h-4 w-4 transition-colors ${
                active
                  ? "text-cyan-400"
                  : "text-slate-500 group-hover:text-slate-300"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePath, setActivePath] = useState("/");
  const [aiReady, setAiReady] = useState<boolean | null>(null);
  const [canConfigKey, setCanConfigKey] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [profileInfo, setProfileInfo] = useState<{
    name: string;
    email?: string;
    creditsBalance: number;
    xpPoints: number;
    streakDays: number;
    planTier: string;
  }>({
    name: "Guest Scholar",
    creditsBalance: 0,
    xpPoints: 0,
    streakDays: 1,
    planTier: "Guest",
  });

  async function refreshStatus() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        const hasLocal = Boolean(getStoredApiKey());
        setAiReady(Boolean(data.hasServerKey || hasLocal));
        setCanConfigKey(Boolean(data.canConfigureServerKey));
        setAuthenticated(Boolean(data.authenticated));
        if (data.profile) {
          const emailLower = String(data.profile.email || "").trim().toLowerCase();
          setIsAdminUser(emailLower === "sanzaya@msn.com");
          setProfileInfo({
            name: data.profile.name,
            email: data.profile.email,
            creditsBalance: data.profile.creditsBalance ?? 0,
            xpPoints: data.profile.xpPoints ?? 100,
            streakDays: data.profile.streakDays ?? 1,
            planTier: data.profile.planTier ?? "Starter",
          });
        }
      }
    } catch {
      setAiReady(Boolean(getStoredApiKey()));
    }
  }

  useEffect(() => {
    refreshStatus();

    // Capture ?ref= classmate referral & log privacy-safe external traffic beacon once per tab session
    if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        const refParam = (sp.get("ref") || "").trim();
        const utmSource = (sp.get("utm_source") || "").trim();
        if (refParam) {
          window.localStorage.setItem("ashu_ref", refParam);
          document.cookie = `ashu_ref=${encodeURIComponent(refParam)}; path=/; max-age=2592000; samesite=lax`;
        }
        if (!window.sessionStorage.getItem("ashu_visit_logged")) {
          window.sessionStorage.setItem("ashu_visit_logged", "1");
          fetch("/api/analytics/visit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              path: window.location.pathname,
              referrer: document.referrer || "",
              utmSource,
              refCode: refParam || window.localStorage.getItem("ashu_ref") || "",
            }),
          }).catch(() => null);
        }
      } catch {
        // Ignore storage restrictions
      }
    }

    const unsubKey = subscribeKeyUpdated(() => refreshStatus());
    const unsubWallet = subscribeWalletUpdated((credits) => {
      if (typeof credits === "number") {
        setProfileInfo((prev) => ({ ...prev, creditsBalance: credits }));
      } else {
        refreshStatus();
      }
    });
    return () => {
      unsubKey();
      unsubWallet();
    };
  }, [activePath]);

  async function handleSignOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  }

  const levelNumber = Math.max(1, Math.floor(profileInfo.xpPoints / 150) + 1);
  const xpInLevel = profileInfo.xpPoints % 150;
  const xpProgress = Math.round((xpInLevel / 150) * 100);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100 print:block print:h-auto print:overflow-visible print:bg-white print:text-black">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-md lg:hidden print:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight text-white">AshuTeacher</span>
        </Link>
        <div className="flex items-center gap-2">
          {authenticated && (
            <Link
              href="/pricing"
              className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 text-xs font-bold text-amber-200"
            >
              <Zap className="h-3 w-3 text-amber-400 fill-current" />
              {profileInfo.creditsBalance}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden print:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0d1322] transition-transform duration-200 lg:static lg:translate-x-0 print:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white">
                  AshuTeacher
                </span>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-400/30 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Interactive Classroom</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <Suspense
          fallback={
            <nav className="flex-1 space-y-1 px-3 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400"
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </nav>
          }
        >
          <SidebarNav
            onSelect={() => setMobileOpen(false)}
            onPathnameChange={setActivePath}
            showAdmin={isAdminUser}
          />
        </Suspense>

        {/* Bottom Wallet, AI Status & Account Card */}
        <div className="space-y-2.5 border-t border-white/10 p-4">
          <InstallAppButton />

          {/* Study Credits Wallet Card */}
          {authenticated ? (
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-3 py-2.5 hover:border-amber-400/60 transition"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 fill-current" />
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {profileInfo.creditsBalance} Credits
                  </div>
                  <div className="text-[10px] text-amber-200/80">
                    Study Wallet
                  </div>
                </div>
              </div>
              <span className="rounded-lg bg-amber-400 px-2 py-1 text-[10px] font-extrabold text-slate-950">
                Top Up
              </span>
            </Link>
          ) : (
            <button
              onClick={promptAuthModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
            >
              <LogIn className="h-4 w-4" />
              Sign In • Get 30 Free Credits
            </button>
          )}

          {/* Admin / Local Server Key Status */}
          {canConfigKey && aiReady === false && (
            <button
              onClick={promptApiKeyModal}
              className="flex w-full items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-left text-xs font-medium text-cyan-200 hover:bg-cyan-500/20 transition"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                Set Server Gemini Key
              </span>
              <span className="text-[10px] font-bold underline">Admin</span>
            </button>
          )}

          {canConfigKey && aiReady === true && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Gemini 3 Ready
              </span>
              <button
                onClick={promptApiKeyModal}
                className="text-[10px] text-emerald-400/80 underline hover:text-emerald-200"
              >
                Key
              </button>
            </div>
          )}

          {/* Profile & Sign Out */}
          {authenticated && (
            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="truncate text-xs font-semibold text-white">
                  {profileInfo.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-300">
                    <Flame className="h-2.5 w-2.5 text-orange-400" />
                    {profileInfo.streakDays}d
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-rose-300"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                <span>Level {levelNumber} Scholar</span>
                <span>{profileInfo.xpPoints} XP</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 print:pt-0 print:overflow-visible">
        {children}
      </main>

      <ApiKeyModal />
      <AuthModal />
      <PaywallModal />
    </div>
  );
}
