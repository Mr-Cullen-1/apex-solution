import type { MetadataRoute } from "next";
import { company } from "@/content/company";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.name,
    short_name: "Apex",
    description: company.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#003973",
    icons: [{ src: "/icon.png", sizes: "1254x1254", type: "image/png" }],
  };
}
