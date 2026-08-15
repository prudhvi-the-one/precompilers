import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/home", "/learn", "/practice", "/prove", "/career", "/profile"],
    },
    sitemap: "https://precompilers.com/sitemap.xml",
  };
}
