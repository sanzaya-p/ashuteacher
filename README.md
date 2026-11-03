# AshuTeacher — AI Interactive Classroom & Learning Studio

A full-stack EdTech web application built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Prisma + SQLite** (PostgreSQL-ready), and the official **`@google/genai`** SDK.

## Key Capabilities

- **Interactive Smart Blackboard (`/classroom`)**:
  - **4 Input Sources**: Topic, File Upload (PDF with page-range selector, images, `Ctrl+V` screenshot paste, TXT/Markdown), CORS-free Server URL Extractor (websites & remote PDFs), and Pasted Text.
  - **4 Teaching Modes**: Interactive Lesson, Educational Story, Step-by-Step Exam/Homework Solver (multimodal vision + text), and Formula Cheat Sheet.
  - **Real-Time Streaming**: Markdown, KaTeX math (`$...$` & `$$...$$`), and Mermaid diagrams rendered live on Chalkboard, Photon Dark, or Parchment themes.
  - **Synchronized Voice Narrator**: Multilingual browser voice synthesis (14+ languages including English, Hindi, Odia, Spanish, French, etc.) with LaTeX-to-speech conversion and active spoken-section highlighting.
  - **"Raise Hand" Live Doubt Chat & Notes**: Ask context-aware follow-up questions mid-lesson (via keyboard or voice microphone) and save personal study notes.
- **Course & Syllabus Architect (`/courses`)**: Generate structured multi-module learning paths, track chapter completion, and launch any chapter directly on the Blackboard.
- **Quiz & 3D Flashcard Arena (`/practice`)**: Schema-validated (`responseJsonSchema`) multiple-choice quizzes with step-by-step math explanations, score tracking, and 3D flip flashcards.
- **Saved Study Library (`/library`)**: Search, filter, favorite, and resume any past session.
- **Commercial Security**: Server-side Gemini SDK routes (`/api/*`) keep API keys out of client source code, with optional Bring-Your-Own-Key support in `/settings`.

## Quick Start

1. **Install dependencies & initialize database**:
   ```bash
   npm install
   npm run db:push
   ```

2. **Configure Gemini API Key**:
   - Copy `.env.example` to `.env` and set `GEMINI_API_KEY="your_key"`, **or**
   - Start the app and paste your key directly in **Settings** (`http://localhost:3000/settings`).

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## Deploying to Production

- For cloud deployment (Vercel, Railway, Render, Docker), change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` and set `DATABASE_URL` and `GEMINI_API_KEY` in your hosting environment variables.
