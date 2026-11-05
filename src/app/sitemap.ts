import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ashuteacher.vercel.app";

  const routes = [
    "",
    "/academy",
    "/classroom",
    "/research",
    "/courses",
    "/practice",
    "/pricing",
    "/library",
    "/legal",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
