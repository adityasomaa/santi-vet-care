import { CLINIC, FEATURES } from "@/data/clinic";
import { formatDateLong } from "@/lib/hours";

/* ===========================================================================
 * Every WhatsApp link on this site is built here.
 *
 * Two things are attached automatically to every message, so the clinic always
 * knows where a conversation started without having to ask:
 *   - the label of the button that was pressed
 *   - the full URL of the page it was pressed on
 * ========================================================================= */

export function whatsappNumber(emergency = false): string {
  if (emergency && FEATURES.emergency && FEATURES.emergencyWhatsappE164) {
    return FEATURES.emergencyWhatsappE164;
  }
  return CLINIC.whatsappE164;
}

export function telHref(emergency = false): string {
  if (emergency && FEATURES.emergency && FEATURES.emergencyPhoneE164) {
    return `tel:${FEATURES.emergencyPhoneE164}`;
  }
  return `tel:${CLINIC.phoneE164}`;
}

/** wa.me link. `body` is the message above the automatic footer. */
export function whatsappHref(opts: {
  body?: string;
  source?: string;
  pageUrl?: string;
  emergency?: boolean;
}): string {
  const lines: string[] = [];
  if (opts.body?.trim()) lines.push(opts.body.trim());

  const footer: string[] = [];
  if (opts.source) footer.push(`Dari tombol: ${opts.source}`);
  if (opts.pageUrl) footer.push(`Halaman: ${opts.pageUrl}`);

  const text = [lines.join("\n"), footer.join("\n")].filter(Boolean).join("\n\n");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${whatsappNumber(opts.emergency)}${q}`;
}

/* ------------------------------------------------------- appointment message */

export type BookingMessageInput = {
  ownerName: string;
  ownerPhone: string;
  speciesLabel: string;
  petName: string;
  petAge: string;
  serviceLabel: string;
  symptomLabels: string[];
  notes: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

/**
 * The appointment message, one field per line, so the clinic can read it at a
 * glance and does not have to ask anything back. Field order matches the order
 * of the form.
 */
export function bookingMessage(b: BookingMessageInput, pageUrl: string): string {
  const rows: [string, string][] = [
    ["Nama pemilik", b.ownerName],
    ["Nomor WhatsApp", b.ownerPhone],
    ["Jenis hewan", b.speciesLabel],
    ["Nama hewan", b.petName],
    ["Perkiraan umur", b.petAge],
    ["Jenis layanan", b.serviceLabel],
    [
      "Keluhan yang dicentang",
      b.symptomLabels.length ? b.symptomLabels.join(", ") : "tidak ada",
    ],
    ["Keterangan tambahan", b.notes.trim() || "tidak ada"],
    ["Tanggal", formatDateLong(b.date)],
    ["Waktu", `${b.time.replace(":", ".")} ${CLINIC.timezoneLabel}`],
  ];

  return [
    "Halo Santi Vet Care, saya ingin membuat janji temu.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Dikirim dari: ${pageUrl}`,
  ].join("\n");
}

export function bookingWhatsappHref(
  b: BookingMessageInput,
  pageUrl: string,
): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(
    bookingMessage(b, pageUrl),
  )}`;
}
