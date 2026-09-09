import type { Metadata } from "next";
import { CLINIC, ENABLED_SERVICES, FEATURES, fullAddress } from "@/data/clinic";
import { Hero } from "@/components/Hero";
import { Section, SectionHeader, Reveal } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { Art } from "@/components/Art";
import { LinkPlate, RouteMark, WhatsAppLink } from "@/components/Actions";
import { SpeciesNote } from "@/components/SpeciesNote";

export const metadata: Metadata = {
  title: "Klinik Hewan di Denpasar",
  description:
    "Praktek dokter hewan di Denpasar Utara untuk anjing dan kucing. Cek status buka, lihat alamat dan rute, lalu buat janji temu lewat WhatsApp.",
  alternates: { canonical: "/" },
};

/* The home page carries four things and stops: the threshold, what is offered,
   how to book, and where it is. No founder story, no manifesto — this visitor
   is not reading, they are deciding. */
export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ------------------------------------------------------- services */}
      <Section id="layanan" className="hairline-t">
        <div className="shell">
          <SectionHeader
            label="Layanan"
            headline="Apa yang bisa ditangani"
            description="Layanan yang tersedia di klinik, dengan penjelasan singkat tentang apa yang dikerjakan dan kapan biasanya dibutuhkan. Biaya dibicarakan langsung dengan klinik."
            cta={
              <>
                <LinkPlate href="/layanan" weight="primary">
                  Lihat semua layanan
                </LinkPlate>
                <WhatsAppLink
                  label="Tanya layanan (beranda)"
                  weight="outline"
                  body="Halo Santi Vet Care, saya ingin bertanya tentang layanan."
                >
                  Tanya lewat WhatsApp
                </WhatsAppLink>
              </>
            }
          />

          {ENABLED_SERVICES.length > 0 && (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ENABLED_SERVICES.slice(0, 3).map((service, i) => (
                <Reveal key={service.id} delay={i * 70}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-8">
            <SpeciesNote />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------- appointment */}
      <Section className="hairline-t bg-paper-2">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeader
            label="Janji temu"
            headline="Datang dengan keterangan yang sudah lengkap"
            description="Isi keterangan hewan Anda, centang keluhan yang Anda amati, lalu pilih tanggal dan waktu. Semuanya terkirim ke WhatsApp klinik dalam satu pesan yang rapi, jadi klinik tidak perlu bertanya ulang."
            loose
            cta={
              <LinkPlate href="/janji-temu" weight="primary">
                Buat janji temu
              </LinkPlate>
            }
          />
          <Reveal>
            <Art
              name="janji-slots"
              ratio="16/9"
              className="border border-rule"
            />
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------- location */}
      <Section className="hairline-t">
        <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="lg:order-2">
            <Art name="lokasi-lanes" ratio="16/9" className="border border-rule" />
          </Reveal>
          <div className="lg:order-1">
            <SectionHeader
              label="Lokasi"
              headline="Klinik ada di Ubung Kaja, Denpasar Utara"
              description={`${fullAddress()}. Tekan tombol rute dan Google Maps akan langsung membuka jalannya dari posisi Anda.`}
              loose
              cta={
                <>
                  <a
                    href={CLINIC.mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plate-accent inline-flex min-h-14 items-center justify-center gap-3 px-5 py-3.5 text-[0.9375rem] font-semibold"
                  >
                    <RouteMark />
                    Buka rute
                  </a>
                  <LinkPlate href="/lokasi" weight="outline">
                    Detail lokasi
                  </LinkPlate>
                </>
              }
            />
            {FEATURES.facilitiesConfirmed && FEATURES.facilities.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {FEATURES.facilities.map((f) => (
                  <li
                    key={f}
                    className="plate px-3.5 py-2 text-sm font-medium text-ink-2"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
