import type { MetadataRoute } from "next";
import { SEO_LANDING_PAGES } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ashuteacher.vercel.app";

  const coreRoutes = [
    "",
    "/explore",
    "/academy",
    "/classroom",
    "/research",
    "/courses",
    "/practice",
    "/pricing",
    "/library",
    "/legal",
  ];

  const coreEntries: MetadataRoute.Sitemap = coreRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "" || route === "/explore" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/explore" ? 0.95 : 0.85,
  }));

  const seoEntries: MetadataRoute.Sitemap = SEO_LANDING_PAGES.map((page) => ({
    url: `${baseUrl}/explore/${page.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...coreEntries, ...seoEntries];
}
