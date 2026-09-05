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
    alt: "Comfortable modern living room with soft daylight and natural airflow",
    width: 1122,
    height: 1402,
    focalPoint: "58% 48%",
    temporary: true,
  },
  homeExterior: {
    id: "home-exterior",
    src: "/images/apex-home-exterior.png",
    alt: "Contemporary home with low-water landscaping at blue hour",
    width: 1586,
    height: 992,
    focalPoint: "68% 52%",
    temporary: true,
  },
  applianceService: {
    id: "appliance-service",
    src: "/images/apex-appliance-service.png",
    alt: "Technician diagnosing a built-in refrigerator in a Northeast home kitchen",
    width: 1536,
    height: 1024,
    focalPoint: "64% 50%",
    temporary: true,
  },
  northeastHvac: {
    id: "northeast-hvac",
    src: "/images/apex-northeast-hvac.png",
    alt: "Technician inspecting outdoor HVAC equipment beside a Northeast home",
    width: 1586,
    height: 992,
    focalPoint: "36% 50%",
    temporary: true,
  },
} satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof media;
