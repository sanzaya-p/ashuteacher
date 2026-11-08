# 🎓 AshuTeacher — Global AI Voice Blackboard, 195-Country Syllabus Academy & Research Lab

[![Live Web App](https://img.shields.io/badge/Launch_Live_App-ashuteacher.vercel.app-06b6d4?style=for-the-badge)](https://ashuteacher.vercel.app)
[![Download Android APK](https://img.shields.io/badge/Android_APK-Download_v2.0.0_(Free)-10b981?style=for-the-badge)](https://ashuteacher.vercel.app/downloads/AshuTeacher.apk)
[![Free Welcome Credits](https://img.shields.io/badge/Free_Trial-30_Free_Study_Credits-8b5cf6?style=for-the-badge)](https://ashuteacher.vercel.app/classroom)
[![GitHub Release](https://img.shields.io/badge/GitHub_Release-v2.0.0-f59e0b?style=for-the-badge)](https://github.com/sanzaya-p/ashuteacher/releases/latest)

> **Stop reading cold walls of chatbot text. Sit inside a real classroom — in your own mother tongue.**

**AshuTeacher** is an interactive **AI Voice Blackboard, Universal Syllabus Explorer (KG to Doctoral across 195+ Countries), Step-by-Step Exam Paper Solver, and Live Viva Defense Lab** built for school, university, open-distance-learning (**IGNOU, NIOS, State Open Universities**), and competitive exam (**UPSC, JEE, NEET, GATE, SAT, AP, Cambridge, MIT OCW**) learners worldwide.

Watch equations, formal proofs, diagrams, and worked numericals stream onto a live chalkboard while a synchronized voice teacher explains every line in **English, Hindi (हिन्दी), Odia (ଓଡ଼ିଆ), Sambalpuri, Santali (ᱚᱞ ᱪᱤᱠᱤ), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi, Gujarati, Kannada, Malayalam, Punjabi, Spanish, French, Arabic, Mandarin**, and **100+ regional & global languages** in authentic native script.

- 🌐 **Launch Web & iOS PWA Instantly:** https://ashuteacher.vercel.app
- 📲 **Direct Signed Android `.APK` Download:** https://ashuteacher.vercel.app/downloads/AshuTeacher.apk

---

## ✨ Flagship Capabilities (v2.0)

1. **🎙️ Interactive AI Voice Blackboard (`/classroom`)**
   - **4 Input Sources:** Any topic, PDF / Photo of an Exam Question Paper (`Ctrl+V` screenshot paste supported), Web URL Extractor, or Pasted Notes.
   - **4 Teaching Modes:** Full Blackboard Lecture, Unforgettable Story Mode, Step-by-Step Exam Paper Solver, and Formula Cheat Sheet.
   - **Synchronized Voice + Block Highlighting + "Raise Hand" Q&A:** Interrupt mid-lecture by voice or text just like a live professor's classroom.

2. **🌍 195+ Country Cascading Syllabus & Competitive Exam Academy (`/academy`)**
   - Drill down effortlessly: **Country → University / Board / Exam Body → Degree / Level → Programme → Course / Paper → Official Chapters** (e.g., *India → IGNOU → Master's → MCA → MCS-201 → Unit-by-Unit Master Lectures*, or *UPSC CSE → GS Papers*, *CBSE / ICSE*, *MIT / Stanford / Oxford*).
   - Adaptive pedagogy from **KG & Early Childhood Wonder Mode (Ages 4–7)** all the way to **Doctoral / MIT First-Principles Rigor**.

3. **🔬 6-Milestone Capstone, Thesis & Live AI Viva Defense Lab (`/research`)**
   - Architect undergraduate capstones, Master's dissertations, and Ph.D. research blueprints from Literature Gap to Methodology — then defend your work before a **Live AI Viva Voce Examiner Panel**.

4. **🧠 Active-Recall Quiz & 3D Spaced-Repetition Flashcard Arena (`/practice`)**
   - Turn any lecture, syllabus chapter, or PDF into timed LaTeX-rendered MCQ exams with step-by-step explanations and 3D flip flashcards.

5. **⚡ Zero-Subscription Study Wallet (`/pricing`)**
   - Start immediately with **30 Free Study Credits** on sign-up (no credit card required). Top up micro-packs only when you study — credits never expire.

---

## 🛠️ Tech Stack & Self-Hosting

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS
- **AI Engine:** Google Gemini Flash Multi-Model Failover + Global Neon PostgreSQL `LessonCache` & `CatalogCache`
- **Math & Diagrams:** KaTeX + Remark/Rehype + Multilingual Speech Synthesis
- **Mobile:** Installable PWA + Signed Android Trusted Web Activity (`.APK`)

```bash
npm install
npx prisma db push
npm run dev
```
