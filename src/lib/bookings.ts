"use client";

import { BOOKING } from "@/data/clinic";
import { mayPersist } from "@/lib/consent";

/* ===========================================================================
 * BOOKING STORE — ADAPTER LAYER
 * ===========================================================================
 *
 * Be honest about what this is.
 *
 * There is no backend yet. Every appointment made on this site is written to
 * the visitor's own browser (localStorage) and nowhere else. That is enough to
 * demonstrate the whole flow end to end — pick a slot, see it lock, see it in
 * the admin view — but it is NOT a real booking system:
 *
 *   - Two people on two phones cannot see each other's bookings, so the same
 *     slot can be taken twice.
 *   - Clearing browser data erases everything.
 *   - The clinic cannot see any of it.
 *
 * What actually reaches the clinic today is the WhatsApp message the form
 * composes. That is the real channel. The stored record is a local convenience.
 *
 * Every read and write goes through the BookingStore interface below. Swapping
 * in a database means writing one more object with the same six methods and
 * changing the single line at the bottom of this file. Nothing else in the
 * application touches storage directly.
 * ========================================================================= */

export type BookingStatus = "menunggu" | "ditangani" | "selesai";

export type Booking = {
  id: string;
  createdAt: string; // ISO
  ownerName: string;
  ownerPhone: string;
  speciesId: string;
  speciesLabel: string;
  petName: string;
  petAge: string;
  serviceId: string;
  serviceLabel: string;
  symptomIds: string[];
  symptomLabels: string[];
  notes: string;
  date: string; // "YYYY-MM-DD" clinic local
  time: string; // "HH:MM" clinic local
  status: BookingStatus;
};

/** A slot the clinic has taken off the board by hand (holiday, vet away). */
export type SlotBlock = {
  id: string;
  date: string;
  /** null blocks the entire day */
  time: string | null;
  reason: string;
};

export interface BookingStore {
  listBookings(): Promise<Booking[]>;
  createBooking(input: Omit<Booking, "id" | "createdAt" | "status">): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus): Promise<void>;
  listBlocks(): Promise<SlotBlock[]>;
  toggleBlock(date: string, time: string | null, reason?: string): Promise<void>;
  reset(): Promise<void>;
}

const KEY_BOOKINGS = "svc.bookings.v1";
const KEY_BLOCKS = "svc.blocks.v1";

/* Where records go when the visitor has NOT allowed preference storage: a
   plain object that lives as long as the tab does and is never written to
   disk. The flow still demonstrates end to end; it just does not survive a
   reload. See src/lib/consent.ts. */
const memory: Record<string, unknown[]> = {};

/** localStorage can throw outright in private modes and embedded webviews, so
 *  every access is guarded and degrades to an empty list rather than a crash. */
function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  if (!mayPersist()) return (memory[key] as T[]) ?? [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return (memory[key] as T[]) ?? [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  memory[key] = value;
  if (mayPersist()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Quota or a blocked store. The in-memory copy above still carries the
         session, and the WhatsApp message — the part that actually reaches the
         clinic — goes out regardless. */
    }
  }
  window.dispatchEvent(new CustomEvent("svc:store-changed"));
}

const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const localStore: BookingStore = {
  async listBookings() {
    return read<Booking>(KEY_BOOKINGS);
  },

  async createBooking(input) {
    const all = read<Booking>(KEY_BOOKINGS);
    const booking: Booking = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
      status: "menunggu",
    };
    write(KEY_BOOKINGS, [...all, booking]);
    return booking;
  },

  async updateStatus(id, status) {
    const all = read<Booking>(KEY_BOOKINGS);
    write(
      KEY_BOOKINGS,
      all.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  },

  async listBlocks() {
    return read<SlotBlock>(KEY_BLOCKS);
  },

  async toggleBlock(date, time, reason = "Ditutup oleh klinik") {
    const all = read<SlotBlock>(KEY_BLOCKS);
    const existing = all.find((b) => b.date === date && b.time === time);
    if (existing) {
      write(
        KEY_BLOCKS,
        all.filter((b) => b.id !== existing.id),
      );
    } else {
      write(KEY_BLOCKS, [...all, { id: newId(), date, time, reason }]);
    }
  },

  async reset() {
    if (typeof window === "undefined") return;
    delete memory[KEY_BOOKINGS];
    delete memory[KEY_BLOCKS];
    try {
      window.localStorage.removeItem(KEY_BOOKINGS);
      window.localStorage.removeItem(KEY_BLOCKS);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("svc:store-changed"));
  },
};

/* ---------------------------------------------------------------------------
 * EMPTY SKELETON — the seam a real database plugs into.
 *
 * Fill these six methods against your API and change the export at the bottom
 * of this file from `localStore` to `remoteStore`. No page, component, or form
 * needs to change: they all talk to the interface, never to localStorage.
 *
 * Suggested endpoints:
 *   GET    /api/bookings
 *   POST   /api/bookings
 *   PATCH  /api/bookings/:id
 *   GET    /api/blocks
 *   POST   /api/blocks
 *   DELETE /api/blocks
 *
 * Note that /api/bookings already exists and validates the payload server-side
 * (see src/app/api/bookings/route.ts). It currently validates and returns; it
 * does not persist. That is the one function left to write.
 * ------------------------------------------------------------------------- */
export const remoteStore: BookingStore = {
  async listBookings() {
    throw new Error("remoteStore.listBookings belum disambungkan ke database.");
  },
  async createBooking() {
    throw new Error("remoteStore.createBooking belum disambungkan ke database.");
  },
  async updateStatus() {
    throw new Error("remoteStore.updateStatus belum disambungkan ke database.");
  },
  async listBlocks() {
    throw new Error("remoteStore.listBlocks belum disambungkan ke database.");
  },
  async toggleBlock() {
    throw new Error("remoteStore.toggleBlock belum disambungkan ke database.");
  },
  async reset() {
    throw new Error("remoteStore.reset belum disambungkan ke database.");
  },
};

/* ---------------------------------------------------------------------------
 * PAYMENTS — deliberately empty.
 *
 * There is no payment gateway on this site and no card details are collected
 * anywhere. Payment is settled at the clinic. If that ever changes, implement
 * this interface rather than scattering gateway calls through the form.
 * ------------------------------------------------------------------------- */
export interface PaymentAdapter {
  /** Returns a redirect URL, or null when payment is handled at the clinic. */
  createCheckout(booking: Booking): Promise<string | null>;
}

export const noPaymentAdapter: PaymentAdapter = {
  async createCheckout() {
    return null; // settled at the clinic
  },
};

/* -------------------------------------------------- the one line to change */
export const store: BookingStore = localStore;

/* ------------------------------------------------------------ derived reads */

/** Slot keys that can no longer be chosen for a date: already booked to
 *  capacity, or blocked by the clinic. */
export async function unavailableTimes(date: string): Promise<Set<string>> {
  const [bookings, blocks] = await Promise.all([
    store.listBookings(),
    store.listBlocks(),
  ]);

  if (blocks.some((b) => b.date === date && b.time === null)) {
    return new Set(["*"]); // whole day off the board
  }

  const counts = new Map<string, number>();
  for (const b of bookings) {
    if (b.date !== date) continue;
    if (b.status === "selesai") continue;
    counts.set(b.time, (counts.get(b.time) ?? 0) + 1);
  }

  const out = new Set<string>();
  for (const [time, count] of counts) {
    if (count >= BOOKING.capacityPerSlot) out.add(time);
  }
  for (const b of blocks) {
    if (b.date === date && b.time) out.add(b.time);
  }
  return out;
}
