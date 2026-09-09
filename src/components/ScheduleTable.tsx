"use client";

import { CLINIC } from "@/data/clinic";
import { weeklySchedule } from "@/lib/hours";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { WhatsAppLink } from "@/components/Actions";

/* The weekly schedule. Renders a plain "ask us" panel instead of a table when
   hours are not configured — never an invented timetable. */
export function ScheduleTable() {
  const rows = weeklySchedule();

  if (rows.length === 0) {
    return (
      <div>
        <h2 className="type-display text-[clamp(1.5rem,4.4vw,2.125rem)]">
          Jam praktek
        </h2>
        <p className="mt-5 max-w-[40ch] text-[1.0625rem] leading-relaxed text-ink-2">
          Jam praktek belum tersedia di situs ini. Silakan tanyakan langsung ke
          klinik sebelum datang.
        </p>
        <div className="mt-6">
          <WhatsAppLink
            label="Tanya jam praktek"
            weight="primary"
            body="Halo Santi Vet Care, saya ingin menanyakan jam praktek hari ini."
          >
            Tanya jam praktek
          </WhatsAppLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="type-display text-[clamp(1.5rem,4.4vw,2.125rem)]">
        Jam praktek
      </h2>

      <div className="mt-5">
        <OpenStatusPlate size="sm" />
      </div>

      <dl className="mt-6 border-t border-rule">
        {rows.map((row) => (
          <div
            key={row.days}
            className="flex items-baseline justify-between gap-6 border-b border-rule py-3.5"
          >
            <dt className="text-[1.0625rem] text-ink-2">{row.days}</dt>
            <dd
              className={`text-[1.0625rem] tabular-nums ${
                row.hours === "Tutup" ? "text-ink-3" : "font-semibold"
              }`}
            >
              {row.hours}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-ink-3">
        Semua waktu dalam {CLINIC.timezoneLabel}. Untuk memastikan ketersediaan
        dokter pada hari tertentu, hubungi klinik lebih dulu.
      </p>
    </div>
  );
}
