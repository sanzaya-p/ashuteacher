import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Policies, Terms, Privacy, Refunds & Contact",
  description:
    "Terms and Conditions, Privacy Policy, Cancellation & Refund Policy, Digital Delivery Policy, and Contact Details for AshuTeacher EdTech platform.",
};

export default function LegalPoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12 space-y-10 text-slate-200">
      <header className="border-b border-white/10 pb-6">
        <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-3">
          AshuTeacher EdTech Policies
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Terms, Privacy, Refund &amp; Contact Policies
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Category: Education &amp; E-Learning Digital Platform • Website:{" "}
          <a
            href="https://ashuteacher.vercel.app"
            className="text-cyan-400 underline"
          >
            https://ashuteacher.vercel.app
          </a>
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
          <a href="#terms" className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10">
            Terms &amp; Conditions
          </a>
          <a href="#privacy" className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10">
            Privacy Policy
          </a>
          <a href="#refunds" className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10">
            Cancellation &amp; Refund Policy
          </a>
          <a href="#delivery" className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10">
            Shipping &amp; Digital Delivery
          </a>
          <a href="#contact" className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10">
            Contact Us
          </a>
        </div>
      </header>

      <section id="terms" className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">1. Terms &amp; Conditions</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          AshuTeacher operates an online educational learning studio (&ldquo;Education / E-Learning&rdquo;) offering interactive AI-assisted blackboard lessons, exam preparation practice quizzes, syllabus builders, and digital study flashcards. By creating an account or purchasing prepaid digital Study Credit packs (INR 99, INR 299, or INR 699), you agree to use the platform solely for lawful personal academic learning and study preparation.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Purchased Study Credits are credited directly to your registered AshuTeacher account, do not expire, and are non-transferable between accounts. If an automated lesson generation encounters a technical upstream error before output is delivered, our system automatically refunds the deducted credit back to your Study Wallet.
        </p>
      </section>

      <section id="privacy" className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">2. Privacy Policy</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          We collect only the minimum personal information required to maintain your learning account: your name, email address, encrypted password hash, study history, and credit transaction ledger. Payment card, UPI, and net-banking credentials are processed directly by PCI-DSS compliant payment gateways (such as Razorpay) and are never stored on AshuTeacher servers.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          We never sell or rent student personal data to third-party advertisers. You may request export or deletion of your account data at any time by contacting our support email below.
        </p>
      </section>

      <section id="refunds" className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">3. Cancellation &amp; Refund Policy</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          AshuTeacher operates on a prepaid pay-per-use credit pack model with <strong>no recurring auto-debit subscriptions</strong>, so no recurring cancellation is required.
        </p>
        <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1.5">
          <li>
            <strong>Unused Credit Packs:</strong> If you purchase a Study Credit pack by mistake and have not consumed any credits from that pack, you may request a 100% full refund within <strong>7 days</strong> of purchase.
          </li>
          <li>
            <strong>Duplicate / Failed Transactions:</strong> Any duplicate payment or payment debited without Study Credits being added is refunded 100% automatically or within <strong>5–7 business days</strong> to the original payment source (UPI / card / bank account).
          </li>
        </ul>
      </section>

      <section id="delivery" className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">4. Shipping &amp; Digital Delivery Policy</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          AshuTeacher provides <strong>100% digital educational software services</strong>. No physical goods are shipped. Upon successful payment verification via Razorpay or global checkout, your purchased Study Credits are delivered <strong>instantly (within seconds)</strong> to your online Study Wallet on{" "}
          <Link href="/pricing" className="text-cyan-400 underline">
            ashuteacher.vercel.app/pricing
          </Link>
          .
        </p>
      </section>

      <section id="contact" className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h2 className="text-xl font-bold text-white">5. Contact Us &amp; Grievance Support</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          For billing queries, refund requests, or student technical support, please reach out to us:
        </p>
        <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm space-y-1">
          <p>
            <strong>Platform / Brand:</strong> AshuTeacher (Education &amp; E-Learning)
          </p>
          <p>
            <strong>Support Email:</strong>{" "}
            <a href="mailto:sanzaya@msn.com" className="text-cyan-400 underline">
              sanzaya@msn.com
            </a>
          </p>
          <p>
            <strong>Response Time:</strong> Within 24–48 business hours
          </p>
        </div>
      </section>
    </div>
  );
}
