# 🎓 AshuTeacher — AI Voice Blackboard & Step-by-Step Exam Solver

[![Live Web App](https://img.shields.io/badge/Live_Web_App-ashuteacher.vercel.app-06b6d4?style=for-the-badge)](https://ashuteacher.vercel.app)
[![Download Android APK](https://img.shields.io/badge/Android_APK-Download_v1.0.0-10b981?style=for-the-badge)](https://github.com/sanzaya-p/ashuteacher/releases/latest)
[![Free Credits](https://img.shields.io/badge/Sign--Up_Bonus-30_Free_Credits-8b5cf6?style=for-the-badge)](https://ashuteacher.vercel.app/classroom)

**AshuTeacher** is an interactive **AI Voice Blackboard & Exam Paper Solver** built for school, board exam (**CBSE, ICSE, State Boards**), **JEE / NEET**, and college students across India and worldwide.

Instead of reading dry walls of chatbot text, watch formulas, derivations, and diagrams streamed onto a smart chalkboard while a synchronized voice teacher explains every line in **English, Hindi, Odia, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi**, and more.

- 🌐 **Launch Web & iOS App:** https://ashuteacher.vercel.app
- 📲 **Direct Android `.APK` Download:** https://ashuteacher.vercel.app/downloads/AshuTeacher.apk

---

## ✨ Key Features

- **Interactive Smart Blackboard (`/classroom`)**:
  - **4 Input Sources**: Topic search, PDF / Exam Photo Upload (`Ctrl+V` screenshot paste supported), URL Extractor, and Pasted Notes.
  - **4 Teaching Modes**: Interactive Lesson, Story Mode, Step-by-Step Exam Paper Solver, and Formula Cheat Sheet.
  - **Live Voice Teacher & Paragraph Highlighting**: Speaks equations naturally in **14+ Indian & global languages** while highlighting each block on the board.
  - **"Raise Hand" Mid-Lesson Q&A**: Interrupt anytime via microphone or text to clear doubts on the spot.
- **Course & Syllabus Architect (`/courses`)**: Build structured multi-module study roadmaps and launch chapters on the Blackboard in 1 tap.
- **Quiz & 3D Flashcard Arena (`/practice`)**: Auto-generate MCQ tests with detailed explanations and 3D spaced-repetition flashcards.
- **Pay-Per-Use Study Wallet (`/pricing`)**: Start immediately with **30 Free Study Credits** on sign-up — no recurring subscription lock-in.

---

## 🚀 Self-Hosting / Local Development

1. **Install dependencies & push database schema**:
   ```bash
   npm install
   npm run db:push
   ```
2. **Add your free Gemini API key** in `.env` (`GEMINI_API_KEY=...`) or via `/settings`.
3. **Run locally**:
   ```bash
   npm run dev
   ```
