import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AshuTeacher — AI Interactive Blackboard & Exam Solver",
    short_name: "AshuTeacher",
    description:
      "AI Teacher with interactive smart blackboard, live voice narration in 14+ languages, step-by-step exam paper solver, courses, quizzes & 3D flashcards.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#090d16",
    theme_color: "#06b6d4",
    categories: ["education", "books", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Live AI Blackboard",
        short_name: "Classroom",
        description: "Start an interactive voice lesson",
        url: "/classroom",
      },
      {
        name: "Exam Paper Solver",
        short_name: "Solve Paper",
        description: "Upload PDF or screenshot for step-by-step solutions",
        url: "/classroom?tab=upload&mode=paper_solver",
      },
      {
        name: "Quizzes & 3D Flashcards",
        short_name: "Practice",
        description: "Test yourself with AI quizzes and flashcards",
        url: "/practice",
      },
    ],
  };
}
