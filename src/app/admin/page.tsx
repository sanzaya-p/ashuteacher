"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  IndianRupee,
  Coins,
  BookOpen,
  RefreshCw,
  Download,
  Search,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  planTier: string;
  creditsBalance: number;
  xpPoints: number;
  streakDays: number;
  preferredLang: string;
  createdAt: string;
  _count: {
    lessons: number;
    courses: number;
    quizzes: number;
    flashcardSets: number;
    paymentOrders: number;
  };
}

interface AdminPaymentRow {
  id: string;
  provider: string;
  externalOrderId: string;
  externalPaymentId: string | null;
  packId: string;
  creditsAmount: number;
  amountSubunits: number;
  currency: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

interface AdminTransactionRow {
  id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
  user: { name: string; email: string };
}

interface AdminPayload {
  stats: {
    totalUsers: number;
    recentSignupsCount: number;
    paidOrdersCount: number;
    totalOrdersCount: number;
    revenueInr: number;
    revenueUsd: number;
    creditsPurchasedTotal: number;
    totalLessons: number;
    totalCourses: number;
    totalQuizzes: number;
    totalFlashcards: number;
    cachedLessonsCount?: number;
    cachedCatalogNodesCount?: number;
    apiCallsSavedByCache?: number;
    activeGeminiKeyPoolSize?: number;
    totalVisitsCount?: number;
    visits7dCount?: number;
    uniqueVisitors7d?: number;
    referralSignupsCount?: number;
  };
  users: AdminUserRow[];
  paymentOrders: AdminPaymentRow[];
  recentTransactions: AdminTransactionRow[];
  topReferrers?: Array<{ source: string; count: number }>;
  topCountries?: Array<{ country: string; count: number }>;
  recentVisits?: Array<{
    id: string;
    path: string;
    referrerHost: string;
    utmSource: string;
    country: string;
    refUserId: string | null;
    createdAt: string;
  }>;
}

export default function FounderAdminPage() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "traffic" | "payments" | "ledger">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState<number>(50);
  const [statusToast, setStatusToast] = useState<string>("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Admin access required (sign in with founder account).");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin console");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data.users;
    return data.users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.planTier.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  async function handleGrantCredits(userId: string, email: string) {
    if (!grantAmount) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          credits: Number(grantAmount),
          reason: `Founder bonus grant (${grantAmount > 0 ? "+" : ""}${grantAmount} credits)`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to adjust credits");
      setStatusToast(`Updated ${email} → New balance: ${json.user.creditsBalance} credits`);
      setGrantingUserId(null);
      await loadAdminData();
      setTimeout(() => setStatusToast(""), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to grant credits");
    }
  }

  function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
    const escapeCell = (v: string | number) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escapeCell).join(","),
      ...rows.map((r) => r.map(escapeCell).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-300">
        Loading Founder Admin Console...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">Founder Admin Access Only</h1>
          <p className="text-sm text-rose-200">{error}</p>
          <p className="text-xs text-slate-400">
            Please sign in with your founder email (<code>sanzaya@msn.com</code>) to view registrations and payments.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-cyan-400" />
            Founder Admin &amp; Revenue Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live student registrations, Study Credit balances, Razorpay payments, and audit ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://dashboard.razorpay.com/app/payments"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            <span>Razorpay Settlements</span>
            <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
          </a>
          <button
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Live</span>
          </button>
        </div>
      </div>

      {statusToast && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-medium text-emerald-200">
          {statusToast}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Scholars</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {data.stats.totalUsers}
          </div>
          <div className="mt-1 text-xs text-emerald-300">
            +{data.stats.recentSignupsCount} in 7d • {data.stats.referralSignupsCount ?? 0} via referrals • {data.stats.uniqueVisitors7d ?? 0} unique visitors (7d)
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Razorpay Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            ₹{data.stats.revenueInr.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {data.stats.paidOrdersCount} paid / {data.stats.totalOrdersCount} orders initiated
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Paid Credits Issued</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {data.stats.creditsPurchasedTotal.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            +30 free welcome credits per signup
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Learning Activity</span>
            <BookOpen className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {data.stats.totalLessons +
              data.stats.totalCourses +
              data.stats.totalQuizzes +
              data.stats.totalFlashcards}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {data.stats.totalLessons} lessons • {data.stats.totalQuizzes} quizzes • {data.stats.totalCourses} courses
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs text-cyan-300">
            <span>Zero-Cost Scale Cache</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">
            {(data.stats.cachedLessonsCount ?? 0) +
              (data.stats.cachedCatalogNodesCount ?? 0)}
          </div>
          <div className="mt-1 text-xs text-emerald-300">
            {data.stats.apiCallsSavedByCache ?? 0} AI calls saved •{" "}
            {data.stats.activeGeminiKeyPoolSize ?? 1} key(s) active
          </div>
        </div>
      </div>

      {/* Tabs + Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="inline-flex rounded-xl border border-white/10 bg-slate-900 p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Registrations ({data.users.length})
          </button>
          <button
            onClick={() => setActiveTab("traffic")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "traffic"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            External Traffic ({data.stats.totalVisitsCount ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "payments"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Payments ({data.paymentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === "ledger"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Credit Ledger ({data.recentTransactions.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "users" && (
            <>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search email or name..."
                  className="rounded-xl border border-white/10 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() =>
                  downloadCsv(
                    "ashuteacher-users.csv",
                    ["Name", "Email", "Plan", "Credits", "Lessons", "Quizzes", "Courses", "Joined"],
                    data.users.map((u) => [
                      u.name,
                      u.email,
                      u.planTier,
                      u.creditsBalance,
                      u._count.lessons,
                      u._count.quizzes,
                      u._count.courses,
                      new Date(u.createdAt).toISOString(),
                    ])
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>CSV</span>
              </button>
            </>
          )}

          {activeTab === "payments" && (
            <button
              onClick={() =>
                downloadCsv(
                  "ashuteacher-payments.csv",
                  ["Date", "Status", "User Email", "Pack", "Amount", "Currency", "Credits", "Order ID", "Payment ID"],
                  data.paymentOrders.map((p) => [
                    new Date(p.createdAt).toISOString(),
                    p.status,
                    p.user?.email || "",
                    p.packId,
                    (p.amountSubunits / 100).toFixed(2),
                    p.currency,
                    p.creditsAmount,
                    p.externalOrderId,
                    p.externalPaymentId || "",
                  ])
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Payments CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 bg-slate-950/80 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Scholar</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Credits Left</th>
                <th className="px-4 py-3">Usage (L / Q / C)</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Manage Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.email.trim().toLowerCase() === "sanzaya@msn.com" && (
                        <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">
                          Founder Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{u.planTier}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-300">
                    {u.creditsBalance}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {u._count.lessons}L / {u._count.quizzes}Q / {u._count.courses}C
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {grantingUserId === u.id ? (
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          value={grantAmount}
                          onChange={(e) => setGrantAmount(Number(e.target.value))}
                          className="w-20 rounded-lg border border-cyan-400/40 bg-slate-950 px-2 py-1 text-xs text-white text-right"
                        />
                        <button
                          onClick={() => handleGrantCredits(u.id, u.email)}
                          className="rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setGrantingUserId(null)}
                          className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setGrantingUserId(u.id);
                          setGrantAmount(50);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Grant Credits</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === "payments" && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70">
          {data.paymentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No payment orders created yet. When any learner opens Razorpay checkout or completes a purchase, it appears here immediately.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 bg-slate-950/80 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Pack &amp; Credits</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Razorpay IDs</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.paymentOrders.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      {p.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                          <Clock className="h-3 w-3" /> {p.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{p.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{p.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-white">{p.packId}</span>{" "}
                      <span className="text-amber-300">(+{p.creditsAmount} cr)</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      {p.currency === "INR" ? "₹" : "$"}
                      {(p.amountSubunits / 100).toFixed(p.currency === "INR" ? 0 : 2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      <div>Ord: {p.externalOrderId}</div>
                      {p.externalPaymentId && (
                        <div className="text-emerald-300">Pay: {p.externalPaymentId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(p.createdAt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: CREDIT LEDGER */}
      {activeTab === "ledger" && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 bg-slate-950/80 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Balance After</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{t.user?.name}</div>
                    <div className="text-[11px] text-slate-400">{t.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px]">{t.type}</td>
                  <td
                    className={`px-4 py-3 font-mono font-bold ${
                      t.amount > 0 ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </td>
                  <td className="px-4 py-3 font-mono text-amber-300">
                    {t.balanceAfter}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "traffic" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
                Top Traffic Sources / Referrers
              </h3>
              {(data.topReferrers || []).length === 0 ? (
                <p className="text-xs text-slate-400">
                  Visitor sessions will appear here in real time as external learners arrive.
                </p>
              ) : (
                <div className="space-y-2">
                  {(data.topReferrers || []).map((r) => (
                    <div
                      key={r.source}
                      className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3.5 py-2 text-xs"
                    >
                      <span className="font-mono text-white">{r.source}</span>
                      <span className="font-bold text-cyan-300">{r.count} visits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                Visitor Countries (Edge Geo-IP)
              </h3>
              {(data.topCountries || []).length === 0 ? (
                <p className="text-xs text-slate-400">No country data recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {(data.topCountries || []).map((c) => (
                    <div
                      key={c.country}
                      className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3.5 py-2 text-xs"
                    >
                      <span className="font-bold text-white">{c.country}</span>
                      <span className="font-bold text-emerald-300">{c.count} visits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/75">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="border-b border-white/10 bg-slate-950/80 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Landing Path</th>
                  <th className="px-4 py-3">Referrer / Source</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Classmate Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data.recentVisits || []).map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-200">{v.path}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {v.referrerHost}
                      {v.utmSource ? ` (${v.utmSource})` : ""}
                    </td>
                    <td className="px-4 py-3 text-emerald-300 font-bold">{v.country}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-amber-300">
                      {v.refUserId || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
