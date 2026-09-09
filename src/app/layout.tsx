import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CLINIC, FEATURES, HOURS, SITE_URL } from "@/data/clinic";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { CookieBanner } from "@/components/CookieBanner";
import { SmoothScroll } from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/Transition";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${CLINIC.name} — Klinik Hewan di Denpasar`,
    template: `%s — ${CLINIC.name}`,
  },
  description:
    "Praktek dokter hewan di Denpasar Utara untuk anjing dan kucing. Lihat status buka, alamat, dan jam praktek, lalu buat janji temu lewat WhatsApp.",
  keywords: [
    "klinik hewan Denpasar",
    "dokter hewan Denpasar",
    "klinik hewan Denpasar Utara",
    "dokter hewan Ubung Kaja",
    "vaksinasi kucing Denpasar",
    "vaksinasi anjing Denpasar",
    "periksa hewan Denpasar",
    "klinik hewan Bali",
  ],
  applicationName: CLINIC.name,
  authors: [{ name: CLINIC.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: CLINIC.name,
    title: `${CLINIC.name} — Klinik Hewan di Denpasar`,
    description:
      "Praktek dokter hewan di Denpasar Utara untuk anjing dan kucing. Status buka, alamat, dan janji temu lewat WhatsApp.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 675,
        alt: `${CLINIC.name} — ${CLINIC.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${CLINIC.name} — Klinik Hewan di Denpasar`,
    description:
      "Praktek dokter hewan di Denpasar Utara untuk anjing dan kucing.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* ---------------------------------------------------------------------------
 * VeterinaryCare structured data.
 *
 * This matters more than usual here: the clinic has a strong Google Business
 * Profile and almost no other trace online, so this is the first machine-
 * readable description of it that exists.
 *
 * It states only what the clinic publishes about itself. No rating, no review
 * count, no price range, no service list, no staff — those are omitted rather
 * than guessed. Opening hours are emitted only when they are configured.
 * ------------------------------------------------------------------------- */
function structuredData() {
  const a = CLINIC.address;
  const hours = HOURS;

  const openingHoursSpecification = hours
    ? ([0, 1, 2, 3, 4, 5, 6] as const)
        .flatMap((day) => {
          const intervals = hours[day];
          if (!intervals || intervals.length === 0) return [];
          return intervals.map((iv) => ({
            "@type": "OpeningHoursSpecification" as const,
            dayOfWeek: `https://schema.org/${
              ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]
            }`,
            opens: iv.open,
            closes: iv.close,
          }));
        })
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    "@id": `${SITE_URL}/#clinic`,
    name: CLINIC.name,
    description: CLINIC.tagline,
    url: SITE_URL,
    telephone: CLINIC.phoneE164,
    image: `${SITE_URL}/og.png`,
    logo: `${SITE_URL}/icon-512.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.area,
      addressRegion: a.province,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CLINIC.coords.lat,
      longitude: CLINIC.coords.lng,
    },
    hasMap: CLINIC.mapsPlaceUrl,
    sameAs: [CLINIC.instagramUrl],
    areaServed: { "@type": "City", name: "Kota Denpasar" },
    ...(openingHoursSpecification?.length ? { openingHoursSpecification } : {}),
    // FEATURES.emergency ships false; nothing is claimed about after-hours care
    // unless the clinic has confirmed it.
    ...(FEATURES.emergency ? { availableService: "Layanan darurat" } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {/* The direction contract is emitted as a real HTML comment rather than a
            JSX comment, because JSX comments are stripped at build time and a
            contract the build erases is a contract nobody can audit. */}
        <div
          hidden
          dangerouslySetInnerHTML={{
            __html: `<!--
DIRECTION CONTRACT — seed 03629a2c
     THESIS: This page is a threshold, not a brochure. It answers "is it
     open, where is it, who do I call" before it says anything about
     itself. It refuses the pastel pet-care card grid.
     OWN-WORLD: Achromatic ground (true white / carbon black, no cream),
     modular square plates with hairlines, a split-gate spine, one accent
     — gemitir marigold, the flower of the canang sari set out on
     Balinese doorsteps each morning. Archivo Expanded / Archivo.
     STORY: Visitor lands mid-worry, reads one word (Buka / Tutup) at
     display scale, learns when it changes, taps WhatsApp, Telepon, or
     Rute without scrolling.
     FIRST VIEWPORT: Sticky sign rail. Gate plates flank a centre column.
     Status word is the largest thing on screen; address and hours below
     it; three action plates close it, WhatsApp filled in accent. Exactly
     100svh, no scroll-zoom.
     FORM: Poleng & candi bentar; position 7 of 7 on the ordered list;
     seed key 03629a2c.
     FINISH: unreviewed and undocumented is unfinished; this build ends
     with the finish review, the verdict, and DESIGN.md
-->`,
          }}
        />
        <script
          type="application/ld+json"
          // Content is built from local config only; nothing user-supplied.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
        <TransitionProvider>
          <SmoothScroll />
          <Header />
          <main id="konten" className="page-bottom-gap">
            {children}
          </main>
          <Footer />
          <FloatingActions />
          <CookieBanner />
        </TransitionProvider>
      </body>
    </html>
  );
}
