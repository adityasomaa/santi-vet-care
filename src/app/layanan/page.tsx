import type { Metadata } from "next";
import { ENABLED_SERVICES, SERVICES } from "@/data/clinic";
import { Section, SectionHeader, Reveal } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { LinkPlate, WhatsAppLink } from "@/components/Actions";
import { SpeciesNote } from "@/components/SpeciesNote";

export const metadata: Metadata = {
  title: "Layanan Klinik Hewan",
  description:
    "Daftar layanan di Santi Vet Care Denpasar: pemeriksaan, konsultasi, dan vaksinasi untuk anjing dan kucing. Biaya dibicarakan langsung dengan klinik.",
  alternates: { canonical: "/layanan" },
};

/* Services are grouped so the page can be scanned rather than read.
 *
 * Only services with `enabled: true` in src/data/clinic.ts appear here. The
 * ones still switched off are not dimmed, not labelled "coming soon", and not
 * reachable — they are simply absent, because listing a service the clinic has
 * not confirmed sends someone across town for something that may not exist. */
export default function ServicesPage() {
  const groups = Array.from(new Set(ENABLED_SERVICES.map((s) => s.group)));
  const hiddenCount = SERVICES.length - ENABLED_SERVICES.length;

  return (
    <>
      <Section className="pt-12 sm:pt-16">
        <div className="shell">
          <SectionHeader
            as="h1"
            label="Layanan"
            headline="Layanan klinik hewan di Denpasar Utara"
            description="Setiap layanan dijelaskan singkat: apa yang dikerjakan, dan kapan pemilik hewan biasanya membutuhkannya. Untuk biaya dan ketersediaan, hubungi klinik lewat WhatsApp."
            loose
            cta={
              <>
                <LinkPlate href="/janji-temu" weight="primary">
                  Buat janji temu
                </LinkPlate>
                <WhatsAppLink
                  label="Tanya layanan (halaman layanan)"
                  weight="outline"
                  body="Halo Santi Vet Care, saya ingin bertanya tentang layanan."
                >
                  Tanya lewat WhatsApp
                </WhatsAppLink>
              </>
            }
          />
          <div className="mt-8">
            <SpeciesNote />
          </div>
        </div>
      </Section>

      {ENABLED_SERVICES.length === 0 ? (
        <Section className="hairline-t">
          <div className="shell">
            <p className="plate max-w-[56ch] bg-paper-2 p-6 text-[1.0625rem] leading-relaxed text-ink-2">
              Daftar layanan belum tersedia di situs ini. Silakan hubungi klinik
              lewat WhatsApp untuk menanyakan layanan yang Anda butuhkan.
            </p>
            <div className="mt-6">
              <WhatsAppLink
                label="Tanya layanan (daftar kosong)"
                weight="primary"
                body="Halo Santi Vet Care, saya ingin menanyakan layanan yang tersedia."
              />
            </div>
          </div>
        </Section>
      ) : (
        groups.map((group, gi) => {
          const items = ENABLED_SERVICES.filter((s) => s.group === group);
          return (
            <Section
              key={group}
              className={gi % 2 === 0 ? "hairline-t" : "hairline-t bg-paper-2"}
            >
              <div className="shell">
                <h2 className="type-display text-[clamp(1.5rem,4.4vw,2.25rem)]">
                  {group}
                </h2>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((service, i) => (
                    <Reveal key={service.id} delay={i * 70}>
                      <ServiceCard service={service} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </Section>
          );
        })
      )}

      {hiddenCount > 0 && (
        <Section className="hairline-t">
          <div className="shell">
            <div className="plate flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <p className="max-w-[54ch] text-[1.0625rem] leading-relaxed text-ink-2">
                Tidak menemukan layanan yang Anda cari? Daftar di atas belum
                tentu memuat seluruh layanan klinik. Silakan tanyakan langsung.
              </p>
              <WhatsAppLink
                label="Tanya layanan lain"
                weight="primary"
                className="shrink-0"
                body="Halo Santi Vet Care, saya ingin menanyakan layanan tertentu."
              >
                Tanya layanan lain
              </WhatsAppLink>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
