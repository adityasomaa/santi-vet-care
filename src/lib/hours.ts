import {
  BOOKING,
  CLINIC,
  CLOSED_DATES,
  DAY_NAMES_ID,
  HOURS,
  type Interval,
} from "@/data/clinic";

/* ===========================================================================
 * Opening-hours engine.
 *
 * Two rules govern this file:
 *
 *  1. Everything is derived from a real instant (Date.now()), never from
 *     accumulated animation frames. A tab left in the background for six hours
 *     and then refocused must show the correct answer on the first paint.
 *
 *  2. The clinic's wall clock is what matters, not the visitor's. A visitor in
 *     Jakarta at 16:30 WIB is looking at a clinic where it is already 17:30
 *     WITA and the door is shut. We take the true instant from the device and
 *     evaluate it in Asia/Makassar.
 * ========================================================================= */

export type OpenState =
  | {
      /** Operating hours have not been filled in. The indicator must be
       *  hidden entirely — never guessed. */
      status: "unknown";
    }
  | {
      status: "open";
      /** The one word the plate is built around. This is what someone reads
       *  from across a room while holding an animal. */
      word: string;
      /** Fuller phrase, for the compact variant and assistive tech. */
      label: string;
      /** e.g. "Tutup pukul 17.00" */
      detail: string;
      closesAt: Date;
    }
  | {
      status: "closed";
      word: string;
      label: string;
      /** e.g. "Buka lagi Senin pukul 09.00" — or a plain sentence when the
       *  next opening is further out than we will look. */
      detail: string;
      opensAt: Date | null;
    };

/* ------------------------------------------------------------------ zoning */

const partsFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  weekday: "short",
});

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type ZonedParts = {
  /** "YYYY-MM-DD" in the clinic's timezone */
  dateKey: string;
  /** 0 = Sunday */
  weekday: number;
  /** minutes since local midnight */
  minutes: number;
};

/** Break a real instant into the clinic's local calendar parts. */
export function zonedParts(instant: Date): ZonedParts {
  const p = partsFmt.formatToParts(instant);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  return {
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: hour * 60 + Number(get("minute")),
  };
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const formatClock = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
};

/**
 * Turn a clinic-local date key plus a minute offset back into a real instant.
 * Asia/Makassar has a fixed +08:00 offset and observes no daylight saving, so
 * a literal offset is exact here. If this site is ever reused for a clinic in
 * a DST zone, this function is the one that must change.
 */
export function instantFor(dateKey: string, minutes: number): Date {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return new Date(`${dateKey}T${h}:${m}:00+08:00`);
}

/** Weekday (0 = Sunday) of a clinic-local calendar date. The key is already a
 *  local calendar date, so it is read as UTC to avoid a second zone shift. */
export function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ---------------------------------------------------------------- schedule */

/** Intervals the clinic is open on a given clinic-local date, or [] if shut. */
export function intervalsOn(dateKey: string, weekday: number): Interval[] {
  if (!HOURS) return [];
  if (CLOSED_DATES.includes(dateKey)) return [];
  return HOURS[weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6] ?? [];
}

export function hoursAreConfigured(): boolean {
  return HOURS !== null;
}

/** Weekly schedule for display, with consecutive identical days merged. */
export function weeklySchedule(): { days: string; hours: string }[] {
  const hours = HOURS;
  if (!hours) return [];
  const rows = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const iv = hours[d as 0 | 1 | 2 | 3 | 4 | 5 | 6];
    return {
      day: DAY_NAMES_ID[d],
      hours:
        iv && iv.length
          ? iv
              .map(
                (i) =>
                  `${formatClock(toMinutes(i.open))}-${formatClock(toMinutes(i.close))}`,
              )
              .join(", ")
          : "Tutup",
    };
  });

  const merged: { days: string; hours: string }[] = [];
  for (const row of rows) {
    const last = merged[merged.length - 1];
    if (last && last.hours === row.hours) {
      last.days = `${last.days.split("-")[0]}-${row.day}`;
    } else {
      merged.push({ days: row.day, hours: row.hours });
    }
  }
  return merged;
}

/* ------------------------------------------------------------- open state */

export function getOpenState(now: Date): OpenState {
  if (!HOURS) return { status: "unknown" };

  const { dateKey, weekday, minutes } = zonedParts(now);

  for (const iv of intervalsOn(dateKey, weekday)) {
    const open = toMinutes(iv.open);
    const close = toMinutes(iv.close);
    if (minutes >= open && minutes < close) {
      return {
        status: "open",
        word: "Buka",
        label: "Buka sekarang",
        detail: `Tutup pukul ${formatClock(close)} ${CLINIC.timezoneLabel}`,
        closesAt: instantFor(dateKey, close),
      };
    }
  }

  // Shut right now. Find the next opening within a fortnight.
  for (let offset = 0; offset <= 14; offset++) {
    const key = addDays(dateKey, offset);
    const wd = weekdayOf(key);
    for (const iv of intervalsOn(key, wd)) {
      const open = toMinutes(iv.open);
      if (offset === 0 && open <= minutes) continue;
      const when =
        offset === 0
          ? "hari ini"
          : offset === 1
            ? "besok"
            : `${DAY_NAMES_ID[wd]}`;
      return {
        status: "closed",
        word: "Tutup",
        label: "Sedang tutup",
        detail: `Buka lagi ${when} pukul ${formatClock(open)} ${CLINIC.timezoneLabel}`,
        opensAt: instantFor(key, open),
      };
    }
  }

  return {
    status: "closed",
    word: "Tutup",
    label: "Sedang tutup",
    detail: "Jadwal buka berikutnya belum tersedia.",
    opensAt: null,
  };
}

/* ----------------------------------------------------------------- slots */

export type Slot = {
  /** "HH:MM" in clinic local time */
  time: string;
  label: string;
  /** true when this slot lies in the past or inside the minimum lead time */
  past: boolean;
};

/** Every slot the schedule produces for a date, before bookings are applied. */
export function slotsForDate(dateKey: string, now: Date): Slot[] {
  if (!HOURS) return [];
  const weekday = weekdayOf(dateKey);
  const earliest = now.getTime() + BOOKING.minLeadMinutes * 60_000;
  const out: Slot[] = [];

  for (const iv of intervalsOn(dateKey, weekday)) {
    const open = toMinutes(iv.open);
    const close = toMinutes(iv.close);
    for (let m = open; m + BOOKING.slotMinutes <= close; m += BOOKING.slotMinutes) {
      const at = instantFor(dateKey, m);
      out.push({
        time: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
        label: formatClock(m),
        past: at.getTime() < earliest,
      });
    }
  }
  return out;
}

/** Dates the calendar should refuse: before today, beyond the horizon, or
 *  days the clinic is shut. */
export function dateIsSelectable(dateKey: string, now: Date): boolean {
  if (!HOURS) return false;
  const today = zonedParts(now).dateKey;
  if (dateKey < today) return false;
  if (dateKey > addDays(today, BOOKING.maxAdvanceDays)) return false;
  return slotsForDate(dateKey, now).length > 0;
}

/** The first date at or after `from` that still has a selectable slot. */
export function firstBookableDate(now: Date): string | null {
  const today = zonedParts(now).dateKey;
  for (let i = 0; i <= BOOKING.maxAdvanceDays; i++) {
    const key = addDays(today, i);
    if (!dateIsSelectable(key, now)) continue;
    if (slotsForDate(key, now).some((s) => !s.past)) return key;
  }
  return null;
}

export const dateKeyPlus = addDays;

export function formatDateLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${DAY_NAMES_ID[wd]}, ${d} ${months[m - 1]} ${y}`;
}
