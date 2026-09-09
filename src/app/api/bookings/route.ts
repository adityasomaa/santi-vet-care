import { NextResponse } from "next/server";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { dateIsSelectable, slotsForDate } from "@/lib/hours";

/* ===========================================================================
 * Server-side validation for the appointment form.
 *
 * The browser already checked this payload. That check is a courtesy to the
 * person typing; it is not a control. Anything can POST here, so everything is
 * re-derived from scratch: the schema runs again, and the date and time are
 * re-checked against the clinic's real schedule and the server's real clock
 * rather than against whatever the client claims.
 *
 * This route does not persist yet — there is no database behind this site.
 * It validates and returns. When a database arrives, the write goes here and
 * remoteStore in src/lib/bookings.ts is pointed at it.
 *
 * Error responses are deliberately plain. Field-level messages are safe to
 * show; stack traces and internal detail never leave the server.
 * ========================================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Crude per-instance rate limit. Enough to stop a script hammering the route;
 *  a real deployment behind several instances wants a shared store. */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

function rateLimited(ip: string): boolean {
  const at = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => at - t < WINDOW_MS);
  recent.push(at);
  HITS.set(ip, recent);
  if (HITS.size > 5000) HITS.clear(); // keep the map from growing unbounded
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { errors: { _: "Terlalu banyak permintaan. Coba lagi sebentar lagi." } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { _: "Permintaan tidak terbaca." } },
      { status: 400 },
    );
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: fieldErrors(parsed) }, { status: 422 });
  }

  const data = parsed.data;

  // Honeypot. A real visitor never sees this field.
  if (data.website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Submitted faster than a person could fill nine fields.
  if (typeof data.elapsedMs === "number" && data.elapsedMs < 2500) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Re-check the schedule against the server's own clock, not the client's.
  const serverNow = new Date();

  if (!dateIsSelectable(data.date, serverNow)) {
    return NextResponse.json(
      { errors: { date: "Tanggal ini tidak tersedia. Silakan pilih tanggal lain." } },
      { status: 422 },
    );
  }

  const slot = slotsForDate(data.date, serverNow).find((s) => s.time === data.time);
  if (!slot) {
    return NextResponse.json(
      { errors: { time: "Waktu ini tidak ada dalam jadwal praktek." } },
      { status: 422 },
    );
  }
  if (slot.past) {
    return NextResponse.json(
      { errors: { time: "Waktu ini sudah lewat. Silakan pilih waktu lain." } },
      { status: 422 },
    );
  }

  /* ---------------------------------------------------------------------
   * The seam. When a database exists, write the record here, inside a
   * transaction that re-reads the slot's remaining capacity, so two people
   * submitting the same slot at the same moment cannot both succeed.
   *
   *   const booking = await db.bookings.create({ ... })
   *   return NextResponse.json({ ok: true, id: booking.id })
   * ------------------------------------------------------------------- */

  return NextResponse.json({ ok: true, persisted: false }, { status: 200 });
}

export async function GET() {
  return NextResponse.json(
    { errors: { _: "Metode tidak didukung." } },
    { status: 405 },
  );
}
