import { z } from "zod";
import { SPECIES, SERVICES, SYMPTOMS } from "@/data/clinic";

/* ===========================================================================
 * One schema, used in two places:
 *   - the browser, to show errors as the visitor types
 *   - the server route, which re-validates from scratch and trusts nothing
 *
 * The client check is a courtesy. The server check is the actual rule.
 * ========================================================================= */

const enabledSpeciesIds = SPECIES.filter((s) => s.enabled).map((s) => s.id);
const enabledServiceIds = SERVICES.filter((s) => s.enabled).map((s) => s.id);
const symptomIds = SYMPTOMS.map((s) => s.id);

/** Indonesian mobile numbers, written the many ways people actually write
 *  them: 08.., +628.., 628.., with spaces or dashes. */
const PHONE = /^(\+?62|0)8[1-9][0-9]{6,11}$/;

export const bookingSchema = z
  .object({
    ownerName: z
      .string()
      .trim()
      .min(2, "Nama pemilik minimal 2 huruf.")
      .max(80, "Nama pemilik terlalu panjang."),

    ownerPhone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s\-().]/g, ""))
      .refine((v) => PHONE.test(v), "Nomor WhatsApp belum benar. Contoh: 081234567890."),

    speciesId: z
      .string()
      .refine((v) => enabledSpeciesIds.includes(v), "Pilih jenis hewan."),

    petName: z
      .string()
      .trim()
      .min(1, "Isi nama hewan.")
      .max(60, "Nama hewan terlalu panjang."),

    petAge: z
      .string()
      .trim()
      .min(1, "Isi perkiraan umur.")
      .max(40, "Perkiraan umur terlalu panjang."),

    serviceId: z
      .string()
      .refine((v) => enabledServiceIds.includes(v), "Pilih jenis layanan."),

    symptomIds: z
      .array(z.string().refine((v) => symptomIds.includes(v)))
      .max(symptomIds.length)
      .default([]),

    notes: z.string().trim().max(1000, "Keterangan maksimal 1000 karakter.").default(""),

    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal."),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Pilih waktu."),

    /* Honeypot. A real person never sees this field, so anything in it is a
       bot. Rendered with .visually-gone (clip), not a negative offset. */
    website: z.string().max(0).optional().default(""),

    /* Milliseconds between the form mounting and being submitted. A submission
       faster than a human could type is refused. */
    elapsedMs: z.number().int().nonnegative().optional(),
  })
  .superRefine((v, ctx) => {
    const service = SERVICES.find((s) => s.id === v.serviceId);
    if (
      service &&
      service.species.length > 0 &&
      !service.species.includes(v.speciesId)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["serviceId"],
        message: "Layanan ini tidak berlaku untuk jenis hewan yang dipilih.",
      });
    }
  });

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingParsed = z.output<typeof bookingSchema>;

/** Flatten zod issues into { field: message } for rendering next to inputs. */
export function fieldErrors(
  result: z.ZodSafeParseResult<BookingParsed>,
): Record<string, string> {
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
