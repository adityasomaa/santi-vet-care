import type { MetadataRoute } from "next";
import { CLINIC } from "@/data/clinic";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${CLINIC.name} - Klinik Hewan Denpasar`,
    short_name: CLINIC.name,
    description: CLINIC.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#fafaf8",
    lang: "id",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
