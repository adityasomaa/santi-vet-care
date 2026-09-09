import type { Metadata } from "next";
import { CLINIC, FEATURES, TEAM_SLOTS, fullAddress } from "@/data/clinic";
import { Section, SectionHeader } from "@/components/Section";
import { CallLink, LinkPlate, RouteMark, WhatsAppLink } from "@/components/Actions";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { ScheduleTable } from "@/components/ScheduleTable";
import { EmergencyLane } from "@/components/Emergency";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Santi Vet Care Denpasar lewat WhatsApp atau telepon di 0812-3707-2009. Alamat, jam praktek, dan Instagram klinik.",
  alternates: { canonical: "/kontak" },
};

export default function ContactPage() {
  return (
    <>
      <Section className="pt-12 sm:pt-16">
        <div className="shell">
          <SectionHeader
            as="h1"
            label="Kontak"
            headline="Cara menghubungi klinik"
            description="WhatsApp adalah jalur tercepat. Untuk hal yang perlu segera dibicarakan, telepon langsung ke nomor yang sama."
            loose
            cta={
              <>
                <WhatsAppLink
                  label="WhatsApp (halaman kontak)"
                  weight="primary"
                  body="Halo Santi Vet Care, saya ingin bertanya."
                />
                <CallLink weight="solid">{CLINIC.phoneDisplay}</CallLink>
              </>
            }
          />
          <div className="mt-8">
            <OpenStatusPlate size="sm" />
          </div>
        </div>
      </Section>

      <Section className="!pt-10">
        <div className="shell">
          <EmergencyLane variant="inline" />
        </div>
      </Section>

      <Section className="hairline-t bg-paper-2 !pt-16">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="type-display text-[clamp(1.5rem,4.4vw,2.125rem)]">
              Alamat & saluran
            </h2>
            <address className="mt-6 flex flex-col gap-5 not-italic">
              <div>
                <p className="type-label text-ink-3">Alamat</p>
                <p className="mt-2 max-w-[34ch] text-[1.0625rem] leading-relaxed text-ink-2">
                  {fullAddress()}
                </p>
              </div>
              <div>
                <p className="type-label text-ink-3">Telepon & WhatsApp</p>
                <p className="mt-2">
                  <a
                    href={`tel:${CLINIC.phoneE164}`}
                    className="text-[1.0625rem] font-semibold tabular-nums hover:text-accent-deep"
                  >
                    {CLINIC.phoneDisplay}
                  </a>
                </p>
              </div>
              <div>
                <p className="type-label text-ink-3">Instagram</p>
                <p className="mt-2">
                  <a
                    href={CLINIC.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[1.0625rem] text-ink-2 hover:text-ink hover:underline underline-offset-4"
                  >
                    @{CLINIC.instagramHandle}
                  </a>
                </p>
              </div>
            </address>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={CLINIC.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="plate-interactive inline-flex min-h-14 items-center justify-center gap-3 px-5 py-3.5 text-[0.9375rem] font-semibold sm:flex-1"
              >
                <RouteMark />
                Rute ke klinik
              </a>
              <LinkPlate href="/janji-temu" weight="outline" className="sm:flex-1">
                Buat janji temu
              </LinkPlate>
            </div>
          </div>

          <ScheduleTable />
        </div>
      </Section>

      {/* Role cards, deliberately without names.
          No veterinarian name, title, STRV/SIP number, or certification appears
          anywhere on this site. Nothing has been supplied by the clinic in
          writing, and inventing credentials in a medical category is not a
          risk worth taking for a fuller-looking page. */}
      {FEATURES.showTeamSlots && TEAM_SLOTS.length > 0 && (
        <Section className="hairline-t">
          <div className="shell">
            <SectionHeader
              label="Tim klinik"
              headline="Peran yang ada di klinik"
              description="Nama, gelar, dan nomor registrasi tenaga medis belum kami tampilkan karena belum dikonfirmasi pihak klinik. Kartu di bawah ini menandai posisinya saja."
              loose
              cta={
                <WhatsAppLink
                  label="Tanya tim klinik"
                  weight="outline"
                  body="Halo Santi Vet Care, saya ingin menanyakan jadwal dokter hewan."
                >
                  Tanya lewat WhatsApp
                </WhatsAppLink>
              }
            />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM_SLOTS.map((slot) => (
                <li key={slot.role} className="plate p-6">
                  <p className="type-label text-accent-deep">Belum diisi</p>
                  <h3 className="type-display mt-3 text-[1.25rem]">{slot.role}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
                    {slot.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}
    </>
  );
}
