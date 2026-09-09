import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/clinic";

/* /admin is deliberately absent: it is a demo surface and is also marked
   noindex in its own metadata. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/layanan", priority: 0.9, freq: "monthly" },
    { path: "/janji-temu", priority: 0.9, freq: "monthly" },
    { path: "/lokasi", priority: 0.8, freq: "monthly" },
    { path: "/kontak", priority: 0.8, freq: "monthly" },
    { path: "/privasi", priority: 0.2, freq: "yearly" },
    { path: "/ketentuan", priority: 0.2, freq: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
