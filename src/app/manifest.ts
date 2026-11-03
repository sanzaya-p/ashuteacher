import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AshuTeacher — AI Interactive Classroom",
    short_name: "AshuTeacher",
    description:
      "Full-fledged AI Teacher with interactive blackboard, live voice narration, exam paper solver, courses, quizzes & flashcards.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#06b6d4",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
