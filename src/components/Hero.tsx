"use client";

import { CLINIC, fullAddress } from "@/data/clinic";
import { Art } from "@/components/Art";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { CallLink, LinkPlate, RouteMark, WhatsAppLink } from "@/components/Actions";
import { weeklySchedule } from "@/lib/hours";

/* ===========================================================================
 * The hero is exactly one screen and it is a threshold, not a banner.
 *
 * Everything a frightened person needs is here before any scrolling: is it
 * open, where is it, and three ways to act. The status word is the largest
 * thing on the screen — larger than the clinic's own name — because that is
 * the question they arrived with.
 *
 * 100svh, not 100vh: on phones the browser chrome hides on scroll, and vh
 * would make the whole hero resize underneath the reader mid-gesture.
 *
 * The artwork does not scale on scroll. A hero graphic that zooms is a stunt
 * that costs paint time and gives this visitor nothing.
 * ========================================================================= */

export function Hero() {
  const schedule = weeklySchedule();

  return (
    <section
      /* One screen means header + hero, not header + a full screen. The header
         is sticky and 4rem tall (4.5rem from lg), so a bare 100svh here would
         push the hero 64px past the fold and bury its last line. */
      className="gate relative flex min-h-[calc(100svh-4rem)] flex-col lg:min-h-[calc(100svh-4.5rem)]"
      style={{ ["--poleng-unit" as string]: "1.75rem" }}
      aria-labelledby="hero-title"
    >
      <div className="shell fab-clear flex flex-1 flex-col justify-center pt-8 lg:pt-14">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-16">
          {/* --------------------------------------------------- left column */}
          <div className="flex flex-col">
            <p className="type-label text-ink-3">{CLINIC.tagline}</p>

            {/* The status plate leads. Rendered only once the clock is read on
                the client, and not at all when hours are unconfigured. */}
            <div className="mt-5 lg:mt-6">
              <OpenStatusPlate />
            </div>

            {/* Short on purpose. A display-scale headline in a two-column hero
                has roughly fifteen characters of line, so anything longer than
                this lands on four lines at 1440 and breaks the line budget.
                The keywords that matter live in the title tag and the lead
                paragraph, where length costs nothing. */}
            <h1
              id="hero-title"
              className="type-display mt-6 text-[clamp(1.75rem,4.6vw,2.75rem)] h-budget lg:mt-7"
            >
              Klinik hewan di Denpasar
            </h1>

            <p className="mt-5 max-w-[46ch] text-base leading-[1.55] text-ink-2 lg:mt-6 lg:text-[1.0625rem] lg:leading-relaxed">
              {CLINIC.name} menangani anjing dan kucing di Ubung Kaja, Denpasar
              Utara. Hubungi klinik langsung, atau buat janji temu dengan
              keterangan hewan Anda.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:mt-8 lg:gap-3">
              <WhatsAppLink
                label="WhatsApp (hero)"
                weight="primary"
                className="sm:min-w-[13rem] sm:flex-1"
                body="Halo Santi Vet Care, saya ingin bertanya."
              />
              <CallLink weight="solid" className="sm:flex-1">
                {CLINIC.phoneDisplay}
              </CallLink>
              <a
                href={CLINIC.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="plate-interactive inline-flex min-h-14 items-center justify-center gap-3 px-5 py-3.5 text-[0.9375rem] font-semibold sm:flex-1"
              >
                <RouteMark />
                Rute ke klinik
              </a>
            </div>

            <address className="mt-6 flex flex-col gap-1 border-t border-rule pt-4 not-italic lg:mt-8 lg:pt-6">
              <p className="text-sm leading-snug text-ink-2 lg:text-[0.9375rem] lg:leading-relaxed">
                {fullAddress()}
              </p>
              {schedule.length > 0 && (
                <p className="text-sm text-ink-3 lg:text-[0.9375rem]">
                  {schedule
                    .map((r) => `${r.days} ${r.hours}`)
                    .join(" · ")}{" "}
                  {CLINIC.timezoneLabel}
                </p>
              )}
            </address>
          </div>

          {/* -------------------------------------------------- right column */}
          <div className="hidden lg:block">
            <Art name="hero-gate" ratio="16/9" priority className="border border-rule" />
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-rule pt-4">
              <p className="type-label text-ink-3">Janji temu</p>
              <LinkPlate
                href="/janji-temu"
                weight="outline"
                className="!min-h-12 !px-4 !py-2.5 !text-sm"
              >
                Pilih tanggal & waktu
              </LinkPlate>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
