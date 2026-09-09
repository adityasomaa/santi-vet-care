import type { Metadata } from "next";
import { CLINIC, fullAddress } from "@/data/clinic";
import { Section, SectionHeader } from "@/components/Section";
import { CallLink, RouteMark, WhatsAppLink } from "@/components/Actions";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { ScheduleTable } from "@/components/ScheduleTable";

export const metadata: Metadata = {
  title: "Lokasi & Rute",
  description:
    "Alamat Santi Vet Care di Jl. Sari Dana IV No. 20, Ubung Kaja, Denpasar Utara. Buka rute langsung di Google Maps.",
  alternates: { canonical: "/lokasi" },
};

/* Someone carrying a sick animal will not read an address. They will press a
   button. So the route button is the largest thing on this page, and the map
   sits directly under it. */
export default function LocationPage() {
  const embed = `https://www.google.com/maps?q=${CLINIC.coords.lat},${CLINIC.coords.lng}&z=17&output=embed`;

  return (
    <>
      <Section className="pt-12 sm:pt-16">
        <div className="shell">
          <SectionHeader
            as="h1"
            label="Lokasi"
            headline="Jalan menuju klinik"
            description={`${fullAddress()}. Tombol di bawah membuka rute di Google Maps dari posisi Anda saat ini.`}
            loose
            cta={
              <>
                <a
                  href={CLINIC.mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plate-accent inline-flex min-h-16 items-center justify-center gap-3 px-7 py-4 text-base font-bold"
                >
                  <RouteMark />
                  Buka rute di Google Maps
                </a>
                <CallLink weight="solid">{CLINIC.phoneDisplay}</CallLink>
              </>
            }
          />
          <div className="mt-8">
            <OpenStatusPlate size="sm" />
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="shell">
          {/* 16:9, ratio locked by the wrapper so the layout holds its space
              before the iframe loads. */}
          <div
            className="w-full border border-rule bg-paper-2"
            style={{ aspectRatio: "16/9" }}
          >
            <iframe
              title={`Peta lokasi ${CLINIC.name}`}
              src={embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </Section>

      <Section className="hairline-t bg-paper-2">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="type-display text-[clamp(1.5rem,4.4vw,2.125rem)]">
              Alamat
            </h2>
            <address className="mt-5 flex flex-col gap-4 not-italic">
              <p className="max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink-2">
                {fullAddress()}
              </p>
              <p className="text-[0.9375rem] text-ink-3">
                Plus Code: <span className="tabular-nums">{CLINIC.plusCode}</span>
              </p>
              <p>
                <a
                  href={`tel:${CLINIC.phoneE164}`}
                  className="text-[1.0625rem] font-semibold tabular-nums hover:text-accent-deep"
                >
                  {CLINIC.phoneDisplay}
                </a>
              </p>
            </address>

            {/* Landmarks are only rendered when the clinic has supplied real
                ones. An invented "seberang warung biru" would send someone the
                wrong way. */}
            {CLINIC.landmarks.length > 0 ? (
              <div className="mt-8">
                <h3 className="type-label text-ink-3">Patokan jalan</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {CLINIC.landmarks.map((l) => (
                    <li
                      key={l}
                      className="text-[0.9375rem] leading-relaxed text-ink-2"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="plate mt-8 bg-paper p-5">
                <h3 className="type-label text-ink-3">Patokan jalan</h3>
                <p className="mt-3 max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-2">
                  Patokan jalan belum tersedia di situs ini. Kalau Anda kesulitan
                  menemukan lokasinya, hubungi klinik lewat WhatsApp.
                </p>
                <div className="mt-4">
                  <WhatsAppLink
                    label="Tanya arah ke klinik"
                    weight="outline"
                    className="!min-h-12 !text-sm"
                    body="Halo Santi Vet Care, saya sedang menuju klinik dan ingin menanyakan patokan jalannya."
                  >
                    Tanya arah
                  </WhatsAppLink>
                </div>
              </div>
            )}
          </div>

          <ScheduleTable />
        </div>
      </Section>
    </>
  );
}
