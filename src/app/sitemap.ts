import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://precompilers.com", priority: 1 },
    { url: "https://precompilers.com/privacy", priority: 0.3 },
    { url: "https://precompilers.com/terms", priority: 0.3 },
  ];
}
