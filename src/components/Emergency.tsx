"use client";

import { FEATURES } from "@/data/clinic";
import { CallLink, WhatsAppLink } from "@/components/Actions";

/* ===========================================================================
 * The emergency lane.
 *
 * This entire block is gated on FEATURES.emergency, which ships as `false`.
 *
 * When the flag is off, this component returns null and every caller renders
 * nothing — no heading, no divider, no empty container, no route. There is no
 * URL you can type to reach a leftover emergency page, because there is no
 * emergency page: the lane only ever exists inline, inside these callers.
 *
 * The reason the default is off is not caution for its own sake. Nobody has
 * confirmed that Santi Vet Care takes calls outside practice hours. Somebody
 * reading otherwise at two in the morning would drive to a shut door.
 * ========================================================================= */

export function emergencyEnabled(): boolean {
  return FEATURES.emergency === true;
}

export function EmergencyLane({
  variant = "block",
}: {
  /** "block" is the full lane above the booking form; "inline" is the compact
   *  one used on the contact page. */
  variant?: "block" | "inline";
}) {
  if (!emergencyEnabled()) return null;

  return (
    <aside
      className="plate border-l-[6px] border-l-ink bg-accent-soft p-6 sm:p-8"
      aria-labelledby="emergency-heading"
    >
      <p className="type-label text-accent-deep">Kondisi mendesak</p>
      <h2
        id="emergency-heading"
        className="type-display mt-3 text-[clamp(1.375rem,4.4vw,1.875rem)] h-budget-loose"
      >
        Jangan mengisi formulir. Hubungi langsung.
      </h2>
      <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-ink-2">
        Kalau kondisi hewan Anda mendesak, lewati formulir di bawah dan hubungi
        klinik sekarang lewat WhatsApp atau telepon.
        {FEATURES.emergencyNote ? ` ${FEATURES.emergencyNote}` : ""}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <WhatsAppLink
          label="WhatsApp darurat"
          emergency
          weight="primary"
          className="flex-1"
          body="Halo Santi Vet Care, kondisi hewan saya mendesak."
        />
        <CallLink
          label="Telepon sekarang"
          emergency
          weight="solid"
          className="flex-1"
        />
      </div>
      {variant === "block" && (
        <p className="mt-5 text-sm text-ink-3">
          Formulir janji temu di bawah ditujukan untuk kunjungan terjadwal.
        </p>
      )}
    </aside>
  );
}
