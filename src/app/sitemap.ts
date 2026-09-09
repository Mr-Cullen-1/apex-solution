import type { MetadataRoute } from "next";
import { completedServicePaths } from "@/content/services";
import { completedPublicPaths } from "@/content/routes";
import { siteUrl as baseUrl } from "@/content/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...completedPublicPaths.map((path) => ({ url: new URL(path, baseUrl).toString(), lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...completedServicePaths.map((path) => ({
      url: new URL(path, baseUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "/services" ? 0.9 : 0.8,
    })),
  ];
}
