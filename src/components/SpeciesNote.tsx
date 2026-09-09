"use client";

import { ENABLED_SPECIES, FEATURES } from "@/data/clinic";
import { WhatsAppLink } from "@/components/Actions";

/* ===========================================================================
 * Which animals are treated.
 *
 * Dogs and cats are stated because the clinic's own Instagram bio shows them.
 * Everything else — rabbits, birds, reptiles, exotics — is NOT claimed, in
 * either direction. We do not say they are treated and we do not say they are
 * refused. The honest form of an unknown is a question, so this block asks one
 * and points at WhatsApp.
 *
 * Once the clinic confirms, set FEATURES.otherSpeciesConfirmed to true and
 * enable the relevant entries in SPECIES; this note then simply lists them.
 * ========================================================================= */

export function SpeciesNote() {
  const labels = ENABLED_SPECIES.map((s) => s.label);
  const listed =
    labels.length > 1
      ? `${labels.slice(0, -1).join(", ")} dan ${labels[labels.length - 1]}`
      : (labels[0] ?? "");

  if (FEATURES.otherSpeciesConfirmed) {
    return (
      <p className="plate bg-paper-2 p-5 text-[0.9375rem] leading-relaxed text-ink-2">
        Jenis hewan yang ditangani: {listed.toLowerCase()}.
      </p>
    );
  }

  return (
    <div className="plate flex flex-col gap-4 bg-paper-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink-2">
        Halaman ini menyebut layanan untuk {listed.toLowerCase()}. Untuk jenis
        hewan lain, silakan tanyakan lebih dulu ke klinik.
      </p>
      <WhatsAppLink
        label="Tanya jenis hewan"
        weight="outline"
        className="shrink-0 !min-h-12 !text-sm"
        body="Halo Santi Vet Care, apakah klinik menangani jenis hewan selain anjing dan kucing?"
      >
        Tanya jenis hewan
      </WhatsAppLink>
    </div>
  );
}
