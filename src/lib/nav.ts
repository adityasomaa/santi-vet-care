/** The five pages in the navigation. `/admin` is intentionally absent: it is a
 *  demo surface, excluded from the sitemap and marked noindex. */
export const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Layanan" },
  { href: "/janji-temu", label: "Janji Temu" },
  { href: "/lokasi", label: "Lokasi" },
  { href: "/kontak", label: "Kontak" },
] as const;

export type NavItem = (typeof NAV)[number];
