import type { MetadataRoute } from "next";
import { completedServicePaths } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...completedServicePaths.map((path) => ({
      url: new URL(path, baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "/services" ? 0.9 : 0.8,
    })),
  ];
}
