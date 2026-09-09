"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CLINIC } from "@/data/clinic";
import { formatDateLong, slotsForDate, zonedParts } from "@/lib/hours";
import { now } from "@/lib/now";
import {
  store,
  type Booking,
  type BookingStatus,
  type SlotBlock,
} from "@/lib/bookings";
import { ActionPlate } from "@/components/Actions";
import { DatePicker } from "@/components/DatePicker";
import { Listbox } from "@/components/Listbox";

/* ===========================================================================
 * Admin board — a demonstration, and labelled as one at the top of the page.
 *
 * What is real: the interactions. Statuses change, slots can be blocked, the
 * appointment list filters by date, and Reset Demo puts everything back.
 *
 * What is not real: the data source. Everything here reads from the same
 * browser storage the visitor's own booking form writes to (see
 * src/lib/bookings.ts). This board shows appointments made in THIS browser and
 * nothing else. It is not connected to the clinic, there is no login, and
 * anyone who reaches the URL sees it — which is exactly why it holds no real
 * patient data.
 * ========================================================================= */

const STATUSES: { value: BookingStatus; label: string }[] = [
  { value: "menunggu", label: "Menunggu" },
  { value: "ditangani", label: "Ditangani" },
  { value: "selesai", label: "Selesai" },
];

export function AdminBoard() {
  const [clock, setClock] = useState<Date | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<SlotBlock[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const t = now();
    setClock(t);
    setDate(zonedParts(t).dateKey);
  }, []);

  const load = useCallback(async () => {
    const [b, bl] = await Promise.all([store.listBookings(), store.listBlocks()]);
    setBookings(b);
    setBlocks(bl);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("svc:store-changed", load);
    return () => window.removeEventListener("svc:store-changed", load);
  }, [load]);

  const forDate = useMemo(
    () =>
      bookings
        .filter((b) => b.date === date)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [bookings, date],
  );

  const slots = useMemo(
    () => (clock && date ? slotsForDate(date, clock) : []),
    [clock, date],
  );

  const dayBlocked = blocks.some((b) => b.date === date && b.time === null);
  const blockedTimes = new Set(
    blocks.filter((b) => b.date === date && b.time).map((b) => b.time as string),
  );

  return (
    <div className="shell py-12">
      {/* The demo banner is the first thing on the page and is not dismissible.
          Nobody should mistake this for the clinic's real system. */}
      <div className="plate border-ink border-t-[6px] bg-accent-soft p-5 sm:p-6">
        <p className="type-label text-accent-deep">Halaman demo</p>
        <h1 className="type-display mt-3 text-[clamp(1.5rem,4.6vw,2.125rem)] h-budget-loose">
          Papan janji temu — demonstrasi
        </h1>
        <p className="mt-4 max-w-[64ch] text-[1.0625rem] leading-relaxed text-ink-2">
          Halaman ini memperagakan cara klinik akan mengelola janji temu. Datanya
          diambil dari penyimpanan peramban ini saja — bukan dari server klinik,
          tanpa login, dan tidak berisi data pasien sungguhan. Janji temu yang
          dibuat di perangkat lain tidak akan muncul di sini.
        </p>
      </div>

      {/* ----------------------------------------------------------- filter */}
      <div className="mt-10 grid gap-5 sm:grid-cols-[minmax(0,20rem)_auto] sm:items-end">
        <DatePicker
          label="Tanggal"
          value={date}
          onChange={setDate}
          required={false}
        />
        <div className="flex flex-wrap gap-3">
          <ActionPlate
            weight={dayBlocked ? "primary" : "outline"}
            onClick={() => date && store.toggleBlock(date, null, "Libur")}
          >
            {dayBlocked ? "Buka kembali hari ini" : "Tutup seharian"}
          </ActionPlate>
          {confirmReset ? (
            <>
              <ActionPlate
                weight="solid"
                onClick={async () => {
                  await store.reset();
                  setConfirmReset(false);
                }}
              >
                Ya, hapus semua
              </ActionPlate>
              <ActionPlate weight="outline" onClick={() => setConfirmReset(false)}>
                Batal
              </ActionPlate>
            </>
          ) : (
            <ActionPlate weight="outline" onClick={() => setConfirmReset(true)}>
              Reset demo
            </ActionPlate>
          )}
        </div>
      </div>

      {date && (
        <p className="mt-4 text-[0.9375rem] text-ink-3">
          Menampilkan {formatDateLong(date)} · {forDate.length} janji temu ·
          waktu {CLINIC.timezoneLabel}
        </p>
      )}

      {/* ------------------------------------------------------ slot blocks */}
      <section className="mt-10">
        <h2 className="type-display text-[1.375rem]">Ketersediaan slot</h2>
        <p className="mt-2 max-w-[64ch] text-[0.9375rem] leading-relaxed text-ink-2">
          Tekan sebuah slot untuk menutupnya, misalnya karena dokter
          berhalangan. Slot yang ditutup tidak lagi bisa dipilih di formulir
          janji temu.
        </p>

        {dayBlocked ? (
          <p className="plate mt-5 bg-paper-2 p-5 text-[0.9375rem] text-ink-2">
            Seluruh hari ini sedang ditutup.
          </p>
        ) : slots.length === 0 ? (
          <p className="plate mt-5 bg-paper-2 p-5 text-[0.9375rem] text-ink-2">
            Tidak ada jadwal praktek pada tanggal ini.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
            {slots.map((s) => {
              const blocked = blockedTimes.has(s.time);
              const booked = forDate.some(
                (b) => b.time === s.time && b.status !== "selesai",
              );
              return (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => date && store.toggleBlock(date, s.time)}
                  className={`flex min-h-14 flex-col items-center justify-center px-2 py-2 text-[0.9375rem] font-semibold tabular-nums ${
                    blocked
                      ? "plate-ink"
                      : booked
                        ? "plate-accent"
                        : "plate-interactive hover:bg-paper-2"
                  }`}
                >
                  <span>{s.label}</span>
                  <span className="mt-0.5 text-[0.625rem] font-semibold tracking-[0.08em] uppercase">
                    {blocked ? "Ditutup" : booked ? "Terisi" : s.past ? "Lewat" : "Kosong"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- bookings */}
      <section className="mt-14">
        <h2 className="type-display text-[1.375rem]">Janji temu</h2>

        {forDate.length === 0 ? (
          <p className="plate mt-5 bg-paper-2 p-5 text-[0.9375rem] text-ink-2">
            Belum ada janji temu pada tanggal ini.
          </p>
        ) : (
          /* The table scrolls inside its own container. A wide table is the
             single most common source of horizontal overflow on a page like
             this, and it must never push the document sideways. */
          <div className="mt-5 w-full overflow-x-auto border border-rule">
            <table className="w-full min-w-[62rem] border-collapse text-left">
              <thead>
                <tr className="bg-paper-2">
                  {[
                    "Waktu",
                    "Pemilik",
                    "Kontak",
                    "Hewan",
                    "Layanan",
                    "Keluhan",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="type-label border-b border-rule px-4 py-3 text-ink-2"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forDate.map((b) => (
                  <tr key={b.id} className="border-b border-rule align-top">
                    <td className="px-4 py-4 text-[0.9375rem] font-semibold tabular-nums">
                      {b.time.replace(":", ".")}
                    </td>
                    <td className="px-4 py-4 text-[0.9375rem]">{b.ownerName}</td>
                    <td className="px-4 py-4 text-[0.9375rem]">
                      <a
                        href={`https://wa.me/${b.ownerPhone.replace(/^0/, "62").replace(/^\+/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tabular-nums text-accent-deep underline underline-offset-2"
                      >
                        {b.ownerPhone}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-[0.9375rem]">
                      {b.petName}
                      <span className="block text-ink-3">
                        {b.speciesLabel} · {b.petAge}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[0.9375rem]">{b.serviceLabel}</td>
                    <td className="max-w-[18rem] px-4 py-4 text-[0.9375rem] text-ink-2">
                      {b.symptomLabels.length > 0 && (
                        <span className="block">{b.symptomLabels.join(", ")}</span>
                      )}
                      {b.notes && (
                        <span className="mt-1 block text-ink-3">{b.notes}</span>
                      )}
                      {b.symptomLabels.length === 0 && !b.notes && (
                        <span className="text-ink-3">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-[11rem]">
                        <Listbox
                          label="Status"
                          value={b.status}
                          options={STATUSES}
                          onChange={(v) =>
                            store.updateStatus(b.id, v as BookingStatus)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-12 max-w-[64ch] text-sm leading-relaxed text-ink-3">
        Untuk menjadikan papan ini nyata, isi <code>remoteStore</code> di{" "}
        <code>src/lib/bookings.ts</code> dan ganti satu baris ekspor di bagian
        bawah file tersebut. Halaman ini tidak perlu diubah. Autentikasi juga
        wajib ditambahkan sebelum papan ini memuat data sungguhan.
      </p>
    </div>
  );
}
