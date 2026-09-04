import type { MediaAsset } from "@/types/content";

export const media = {
  heroTechnician: {
    id: "hero-technician",
    src: "/images/apex-hero-technician.png",
    alt: "Technician in a navy uniform carefully inspecting residential comfort equipment",
    width: 1122,
    height: 1402,
    focalPoint: "62% 58%",
    temporary: true,
  },
  serviceDetail: {
    id: "service-detail",
    src: "/images/apex-service-detail.png",
    alt: "Gloved hands using a diagnostic instrument on residential HVAC equipment",
    width: 1536,
    height: 1024,
    focalPoint: "55% 50%",
    temporary: true,
  },
  homeInterior: {
    id: "home-interior",
    src: "/images/apex-home-interior.png",
    alt: "Comfortable modern Southwest living room with soft daylight and natural airflow",
    width: 1122,
    height: 1402,
    focalPoint: "58% 48%",
    temporary: true,
  },
  homeExterior: {
    id: "home-exterior",
    src: "/images/apex-home-exterior.png",
    alt: "Contemporary Phoenix Valley home with desert landscaping at blue hour",
    width: 1586,
    height: 992,
    focalPoint: "68% 52%",
    temporary: true,
  },
} satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof media;
