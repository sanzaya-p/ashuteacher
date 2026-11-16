import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://ashuteacher.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/classroom$", "/explore", "/academy", "/research", "/courses", "/practice", "/pricing", "/library", "/legal"],
      disallow: [
        "/api/",
        "/admin",
        "/settings",
        "/icon",
        "/apple-icon",
        "/classroom?*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
