"use client";

import { usePathname } from "next/navigation";
import { CLINIC, FEATURES, fullAddress } from "@/data/clinic";
import { NAV } from "@/lib/nav";
import { Wordmark } from "@/components/Wordmark";
import { TransitionLink } from "@/components/Transition";
import { LinkPlate, WhatsAppLink, CallLink } from "@/components/Actions";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { SectionHeader } from "@/components/Section";
import { weeklySchedule } from "@/lib/hours";

/* ===========================================================================
 * Every page ends with a call to action.
 *
 * The footer CTA swaps its own target when the visitor is already standing on
 * the page it would send them to — sending someone to the page they are
 * reading is a dead end, and on a site whose whole job is "what do I do next",
 * a dead end at the bottom of every page is a real cost.
 * ========================================================================= */

const CTA_ORDER = [
  {
    href: "/janji-temu",
    label: "Buat janji temu",
    headline: "Siap membuat janji temu?",
    description:
      "Isi keterangan hewan Anda dan pilih waktu kunjungan. Keterangannya langsung terkirim ke WhatsApp klinik.",
  },
  {
    href: "/lokasi",
    label: "Lihat lokasi & rute",
    headline: "Perlu tahu jalannya lebih dulu?",
    description:
      "Alamat lengkap, patokan jalan, dan tombol yang langsung membuka rute di Google Maps.",
  },
  {
    href: "/layanan",
    label: "Lihat layanan",
    headline: "Ingin tahu layanan yang tersedia?",
    description:
      "Daftar layanan beserta penjelasan singkat tentang apa yang dikerjakan dan kapan biasanya dibutuhkan.",
  },
] as const;

export function Footer() {
  const pathname = usePathname();
  const cta = CTA_ORDER.find((c) => c.href !== pathname) ?? CTA_ORDER[0];
  const schedule = weeklySchedule();

  return (
    <footer className="hairline-t mt-4 bg-paper-2">
      {/* Closing CTA */}
      <div className="shell py-16 sm:py-20">
        <SectionHeader
          label="Langkah berikutnya"
          headline={cta.headline}
          description={cta.description}
          loose
          cta={
            <>
              <LinkPlate href={cta.href} weight="primary">
                {cta.label}
              </LinkPlate>
              <WhatsAppLink
                label="WhatsApp (CTA footer)"
                weight="outline"
                body="Halo Santi Vet Care, saya ingin bertanya."
              >
                Tanya lewat WhatsApp
              </WhatsAppLink>
            </>
          }
        />
      </div>

      <div className="hairline-t">
        <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark withTagline />
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-ink-2">
              Praktek dokter hewan di Denpasar Utara untuk anjing dan kucing.
            </p>
            <OpenStatusPlate size="sm" className="mt-5" />
          </div>

          <nav aria-label="Peta situs">
            <h2 className="type-label text-ink-3">Halaman</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    className="text-[0.9375rem] text-ink-2 hover:text-ink hover:underline underline-offset-4"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="type-label text-ink-3">Kontak</h2>
            <address className="mt-4 not-italic">
              <p className="max-w-[30ch] text-[0.9375rem] leading-relaxed text-ink-2">
                {fullAddress()}
              </p>
              <p className="mt-3">
                <a
                  href={`tel:${CLINIC.phoneE164}`}
                  className="text-[0.9375rem] font-semibold tabular-nums hover:text-accent-deep"
                >
                  {CLINIC.phoneDisplay}
                </a>
              </p>
              <p className="mt-2">
                <a
                  href={CLINIC.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9375rem] text-ink-2 hover:text-ink"
                >
                  Instagram @{CLINIC.instagramHandle}
                </a>
              </p>
            </address>
            <div className="mt-5 flex flex-col gap-2.5">
              <WhatsAppLink
                label="WhatsApp (footer)"
                weight="outline"
                className="!min-h-12 !text-sm"
                body="Halo Santi Vet Care, saya ingin bertanya."
              />
              <CallLink weight="outline" className="!min-h-12 !text-sm">
                {CLINIC.phoneDisplay}
              </CallLink>
            </div>
          </div>

          <div>
            {schedule.length > 0 ? (
              <>
                <h2 className="type-label text-ink-3">Jam praktek</h2>
                <dl className="mt-4 flex flex-col gap-2">
                  {schedule.map((row) => (
                    <div key={row.days} className="flex justify-between gap-4">
                      <dt className="text-[0.9375rem] text-ink-2">{row.days}</dt>
                      <dd className="text-[0.9375rem] font-medium tabular-nums">
                        {row.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-ink-3">
                  Waktu {CLINIC.timezoneLabel}.
                </p>
              </>
            ) : (
              <>
                <h2 className="type-label text-ink-3">Jam praktek</h2>
                <p className="mt-4 max-w-[30ch] text-[0.9375rem] leading-relaxed text-ink-2">
                  Silakan tanyakan jam praktek terbaru lewat WhatsApp.
                </p>
              </>
            )}
            {FEATURES.emergency && FEATURES.emergencyNote && (
              <p className="mt-4 max-w-[30ch] text-[0.9375rem] leading-relaxed text-ink-2">
                {FEATURES.emergencyNote}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="hairline-t">
        <div className="shell flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-3">
            © {new Date().getFullYear()} {CLINIC.name}.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <TransitionLink
                href="/privasi"
                className="text-sm text-ink-2 hover:text-ink hover:underline underline-offset-4"
              >
                Kebijakan Privasi
              </TransitionLink>
            </li>
            <li>
              <TransitionLink
                href="/ketentuan"
                className="text-sm text-ink-2 hover:text-ink hover:underline underline-offset-4"
              >
                Ketentuan Layanan
              </TransitionLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
