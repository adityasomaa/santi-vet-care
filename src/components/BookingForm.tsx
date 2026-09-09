"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BOOKING,
  CLINIC,
  ENABLED_SERVICES,
  ENABLED_SPECIES,
  SYMPTOMS,
  servicesForSpecies,
} from "@/data/clinic";
import { firstBookableDate, formatDateLong, slotsForDate } from "@/lib/hours";
import { now } from "@/lib/now";
import { store, unavailableTimes } from "@/lib/bookings";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { bookingWhatsappHref } from "@/lib/whatsapp";
import { ActionPlate, WhatsAppLink } from "@/components/Actions";
import { Listbox } from "@/components/Listbox";
import { DatePicker } from "@/components/DatePicker";
import { EmergencyLane } from "@/components/Emergency";
import { hoursAreConfigured } from "@/lib/hours";

/* ===========================================================================
 * Appointment form.
 *
 * What actually happens when this is submitted:
 *
 *   1. The browser validates, for fast feedback.
 *   2. The same schema is re-run on the server at /api/bookings, which trusts
 *      nothing the browser sent.
 *   3. A record is written through the storage adapter, so the slot locks.
 *   4. WhatsApp opens with every field laid out one per line, plus the URL of
 *      this page. The clinic reads it and knows everything without asking.
 *
 * Step 4 is the one that actually reaches the clinic today. Steps 1-3 exist so
 * the experience is honest end to end and so a real backend can be dropped in
 * without touching this file.
 * ========================================================================= */

type Errors = Record<string, string>;

export function BookingForm() {
  const params = useSearchParams();
  const mountedAt = useRef(Date.now());

  const [clock, setClock] = useState<Date | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [speciesId, setSpeciesId] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [symptomIds, setSymptomIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { href: string; date: string; time: string }>(
    null,
  );
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => setClock(now()), []);

  /* Pre-fill the service when arriving from a service card (brief §78). */
  useEffect(() => {
    const wanted = params.get("layanan");
    if (wanted && ENABLED_SERVICES.some((s) => s.id === wanted)) {
      setServiceId(wanted);
    }
  }, [params]);

  /* Default to the first date that still has a free slot. */
  useEffect(() => {
    if (!clock || date) return;
    const first = firstBookableDate(clock);
    if (first) setDate(first);
  }, [clock, date]);

  /* Which slots are already spoken for on the chosen date. */
  useEffect(() => {
    if (!date) return;
    let alive = true;
    const load = () =>
      unavailableTimes(date).then((s) => {
        if (alive) setTaken(s);
      });
    load();
    window.addEventListener("svc:store-changed", load);
    return () => {
      alive = false;
      window.removeEventListener("svc:store-changed", load);
    };
  }, [date]);

  /* Cascade: changing the species must clear a service that no longer applies,
     rather than leaving an invalid combination selected (brief §68). */
  const availableServices = useMemo(
    () => servicesForSpecies(speciesId),
    [speciesId],
  );
  useEffect(() => {
    if (serviceId && !availableServices.some((s) => s.id === serviceId)) {
      setServiceId(null);
    }
  }, [availableServices, serviceId]);

  const slots = useMemo(
    () => (clock && date ? slotsForDate(date, clock) : []),
    [clock, date],
  );

  /* Drop a chosen time that has since become unavailable. */
  useEffect(() => {
    if (!time) return;
    const slot = slots.find((s) => s.time === time);
    if (!slot || slot.past || taken.has("*") || taken.has(time)) setTime(null);
  }, [slots, taken, time]);

  const species = ENABLED_SPECIES.find((s) => s.id === speciesId) ?? null;
  const service = ENABLED_SERVICES.find((s) => s.id === serviceId) ?? null;

  if (!hoursAreConfigured()) {
    return <NoHoursFallback />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ownerName,
      ownerPhone,
      speciesId: speciesId ?? "",
      petName,
      petAge,
      serviceId: serviceId ?? "",
      symptomIds,
      notes,
      date: date ?? "",
      time: time ?? "",
      website,
      elapsedMs: Date.now() - mountedAt.current,
    };

    const local = bookingSchema.safeParse(payload);
    if (!local.success) {
      setErrors(fieldErrors(local));
      setSubmitting(false);
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>("[data-field-error='true']")
          ?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
      return;
    }

    // The server is the authority. It re-validates from scratch.
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          errors?: Errors;
        } | null;
        setErrors(
          body?.errors ?? {
            _: "Permintaan belum bisa diproses. Silakan coba lagi, atau kirim lewat WhatsApp.",
          },
        );
        setSubmitting(false);
        return;
      }
    } catch {
      setErrors({
        _: "Koneksi terputus. Anda tetap bisa mengirim keterangan ini lewat WhatsApp.",
      });
      setSubmitting(false);
      return;
    }

    const symptomLabels = SYMPTOMS.filter((s) => symptomIds.includes(s.id)).map(
      (s) => s.label,
    );

    await store.createBooking({
      ownerName: local.data.ownerName,
      ownerPhone: local.data.ownerPhone,
      speciesId: local.data.speciesId,
      speciesLabel: species?.label ?? "",
      petName: local.data.petName,
      petAge: local.data.petAge,
      serviceId: local.data.serviceId,
      serviceLabel: service?.label ?? "",
      symptomIds: local.data.symptomIds,
      symptomLabels,
      notes: local.data.notes,
      date: local.data.date,
      time: local.data.time,
    });

    const href = bookingWhatsappHref(
      {
        ownerName: local.data.ownerName,
        ownerPhone: local.data.ownerPhone,
        speciesLabel: species?.label ?? "",
        petName: local.data.petName,
        petAge: local.data.petAge,
        serviceLabel: service?.label ?? "",
        symptomLabels,
        notes: local.data.notes,
        date: local.data.date,
        time: local.data.time,
      },
      window.location.href,
    );

    setErrors({});
    setDone({ href, date: local.data.date, time: local.data.time });
    setSubmitting(false);

    // Hand the visitor straight to WhatsApp. If the browser blocks the
    // programmatic open, the confirmation panel below carries the same link.
    window.open(href, "_blank", "noopener,noreferrer");
    requestAnimationFrame(() =>
      summaryRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  };

  if (done) {
    return (
      <div ref={summaryRef} className="plate border-ink border-t-[6px] p-6 sm:p-8">
        <p className="type-label text-accent-deep">Terkirim</p>
        <h2 className="type-display mt-3 text-[clamp(1.5rem,4.6vw,2.125rem)] h-budget-loose">
          Keterangan Anda sudah disiapkan
        </h2>
        <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-2">
          Permintaan untuk {formatDateLong(done.date)} pukul{" "}
          {done.time.replace(":", ".")} {CLINIC.timezoneLabel} sudah dicatat, dan
          jendela WhatsApp berisi seluruh isian Anda seharusnya sudah terbuka.
          Kalau belum, gunakan tombol di bawah.
        </p>
        <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-3">
          Janji temu baru berlaku setelah dikonfirmasi pihak klinik lewat
          WhatsApp.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={done.href}
            target="_blank"
            rel="noopener noreferrer"
            className="plate-accent inline-flex min-h-14 flex-1 items-center justify-center px-5 py-3.5 text-[0.9375rem] font-semibold"
          >
            Buka WhatsApp
          </a>
          <ActionPlate
            weight="outline"
            className="flex-1"
            onClick={() => {
              setDone(null);
              setTime(null);
            }}
          >
            Buat janji temu lain
          </ActionPlate>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k];

  return (
    <div className="flex flex-col gap-8">
      <EmergencyLane variant="block" />

      <form onSubmit={submit} noValidate className="flex flex-col gap-8">
        {errors._ && (
          <p
            role="alert"
            className="plate border-accent-deep bg-accent-soft p-4 text-[0.9375rem] font-medium text-accent-deep"
          >
            {errors._}
          </p>
        )}

        <Fieldset legend="Tentang Anda">
          <Field
            label="Nama pemilik"
            value={ownerName}
            onChange={setOwnerName}
            error={err("ownerName")}
            autoComplete="name"
            required
          />
          <Field
            label="Nomor WhatsApp"
            value={ownerPhone}
            onChange={setOwnerPhone}
            error={err("ownerPhone")}
            inputMode="tel"
            autoComplete="tel"
            placeholder="081234567890"
            required
          />
        </Fieldset>

        <Fieldset legend="Tentang hewan Anda">
          <Listbox
            label="Jenis hewan"
            required
            value={speciesId}
            onChange={setSpeciesId}
            options={ENABLED_SPECIES.map((s) => ({ value: s.id, label: s.label }))}
            error={err("speciesId")}
          />
          <Field
            label="Nama hewan"
            value={petName}
            onChange={setPetName}
            error={err("petName")}
            required
          />
          <Field
            label="Perkiraan umur"
            value={petAge}
            onChange={setPetAge}
            error={err("petAge")}
            placeholder="mis. 8 bulan, 3 tahun"
            required
          />
          <Listbox
            label="Jenis layanan"
            required
            value={serviceId}
            onChange={setServiceId}
            options={availableServices.map((s) => ({ value: s.id, label: s.label }))}
            error={err("serviceId")}
            emptyText="Belum ada layanan yang tersedia."
          />
        </Fieldset>

        <SymptomPicker
          selected={symptomIds}
          onToggle={(id) =>
            setSymptomIds((cur) =>
              cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
            )
          }
          notes={notes}
          onNotes={setNotes}
          error={err("notes")}
        />

        <Fieldset legend="Waktu kunjungan">
          <DatePicker
            label="Tanggal"
            value={date}
            onChange={(d) => {
              setDate(d);
              setTime(null);
            }}
            error={err("date")}
            required
          />
          <SlotPicker
            slots={slots}
            taken={taken}
            value={time}
            onChange={setTime}
            error={err("time")}
            date={date}
          />
        </Fieldset>

        {/* Honeypot. Clipped rather than pushed off-canvas with a negative
            offset, which would escape any ancestor that is not positioned. */}
        <div className="visually-gone" aria-hidden="true">
          <label htmlFor="website-hp">Jangan isi kolom ini</label>
          <input
            id="website-hp"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ActionPlate
            type="submit"
            weight="primary"
            className="sm:flex-1"
            disabled={submitting}
          >
            {submitting ? "Menyiapkan…" : "Kirim lewat WhatsApp"}
          </ActionPlate>
          <WhatsAppLink
            label="Tanya dulu (form janji temu)"
            weight="outline"
            className="sm:flex-1"
            body="Halo Santi Vet Care, saya ingin bertanya sebelum membuat janji temu."
          >
            Tanya dulu
          </WhatsAppLink>
        </div>

        <p className="max-w-[62ch] text-sm leading-relaxed text-ink-3">
          Mengirim formulir ini akan membuka WhatsApp berisi seluruh isian Anda.
          Janji temu berlaku setelah dikonfirmasi pihak klinik. Tidak ada
          pembayaran di situs ini; biaya diselesaikan di klinik.
        </p>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ pieces */

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="type-label mb-5 text-accent-deep">{legend}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  required = false,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = `f-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div data-field-error={error ? "true" : undefined}>
      <label htmlFor={id} className="type-label block text-ink-2">
        {label}
        {required && <span className="text-accent-deep"> *</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 min-h-14 w-full px-4 py-3 text-[1.0625rem] ${
          error ? "border border-accent-deep bg-paper" : "plate-interactive"
        }`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-accent-deep">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Symptom picker.
 *
 * This is a note-taking aid, nothing more. It never maps a symptom to a
 * condition, a severity, or an action — it collects checkboxes and passes them
 * on verbatim. A frightened owner writing "muntah" into an empty textarea at
 * midnight gives the clinic less to work with than four ticked boxes.
 * ------------------------------------------------------------------------- */
function SymptomPicker({
  selected,
  onToggle,
  notes,
  onNotes,
  error,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  notes: string;
  onNotes: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="type-label mb-2 text-accent-deep">Keluhan</legend>
      <p className="mb-5 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-2">
        Centang yang Anda amati, lalu tambahkan keterangan bebas di bawah.
        Bagian ini opsional dan bukan alat diagnosis — keterangannya diteruskan
        apa adanya supaya dokter hewan sudah punya gambaran sebelum Anda datang.
      </p>

      <div className="flex flex-wrap gap-2.5">
        {SYMPTOMS.map((s) => {
          const on = selected.includes(s.id);
          return (
            <label
              key={s.id}
              className={`inline-flex min-h-12 cursor-pointer items-center gap-2.5 px-4 py-2.5 text-[0.9375rem] font-medium transition-colors ${
                on ? "plate-accent" : "plate-interactive hover:bg-paper-2"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggle(s.id)}
                className="h-4.5 w-4.5 accent-[var(--color-ink)]"
              />
              {s.label}
            </label>
          );
        })}
      </div>

      <div className="mt-6" data-field-error={error ? "true" : undefined}>
        <label htmlFor="notes" className="type-label block text-ink-2">
          Keterangan tambahan
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          maxLength={1000}
          placeholder="Sejak kapan, apa yang berubah, dan hal lain yang menurut Anda perlu diketahui."
          aria-invalid={error ? true : undefined}
          className={`mt-2 w-full resize-y px-4 py-3 text-[1.0625rem] leading-relaxed ${
            error ? "border border-accent-deep bg-paper" : "plate-interactive"
          }`}
        />
        {error && (
          <p className="mt-2 text-sm font-medium text-accent-deep">{error}</p>
        )}
      </div>
    </fieldset>
  );
}

/* ---------------------------------------------------------------------------
 * Slot picker.
 *
 * Unavailable slots are never signalled by colour alone: a taken slot says
 * "Penuh", a slot that has gone by says "Lewat", and both are disabled.
 * ------------------------------------------------------------------------- */
function SlotPicker({
  slots,
  taken,
  value,
  onChange,
  error,
  date,
}: {
  slots: { time: string; label: string; past: boolean }[];
  taken: Set<string>;
  value: string | null;
  onChange: (t: string) => void;
  error?: string;
  date: string | null;
}) {
  const dayOff = taken.has("*");

  return (
    <div
      className="sm:col-span-2"
      data-field-error={error ? "true" : undefined}
    >
      <p className="type-label text-ink-2">
        Waktu<span className="text-accent-deep"> *</span>
      </p>

      {!date ? (
        <p className="mt-3 text-[0.9375rem] text-ink-3">Pilih tanggal dulu.</p>
      ) : dayOff ? (
        <p className="mt-3 text-[0.9375rem] text-ink-2">
          Tanggal ini sedang ditutup oleh klinik. Silakan pilih tanggal lain.
        </p>
      ) : slots.length === 0 ? (
        <p className="mt-3 text-[0.9375rem] text-ink-2">
          Tidak ada jadwal praktek pada tanggal ini.
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Pilihan waktu"
            className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2"
          >
            {slots.map((s) => {
              const isTaken = taken.has(s.time);
              const disabled = s.past || isTaken;
              const on = value === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => onChange(s.time)}
                  className={`flex min-h-14 flex-col items-center justify-center px-2 py-2 text-[0.9375rem] font-semibold tabular-nums transition-colors ${
                    on
                      ? "plate-accent"
                      : disabled
                        ? "plate cursor-not-allowed bg-paper-2 text-ink-3"
                        : "plate-interactive hover:bg-paper-2"
                  }`}
                >
                  <span className={disabled ? "line-through" : ""}>{s.label}</span>
                  {disabled && (
                    <span className="mt-0.5 text-[0.625rem] font-semibold tracking-[0.08em] uppercase">
                      {isTaken ? "Penuh" : "Lewat"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-ink-3">
            Pemesanan dibuka paling lambat {Math.round(BOOKING.minLeadMinutes / 60)}{" "}
            jam sebelum waktu kunjungan. Waktu {CLINIC.timezoneLabel}.
          </p>
        </>
      )}

      {error && <p className="mt-2 text-sm font-medium text-accent-deep">{error}</p>}
    </div>
  );
}

/** Shown when operating hours have not been filled in: no invented slots, no
 *  guessed calendar — just the channel that always works. */
function NoHoursFallback() {
  return (
    <div className="flex flex-col gap-8">
      <EmergencyLane variant="block" />
      <div className="plate border-ink border-t-[6px] p-6 sm:p-8">
        <p className="type-label text-accent-deep">Janji temu</p>
        <h2 className="type-display mt-3 text-[clamp(1.5rem,4.6vw,2.125rem)] h-budget-loose">
          Buat janji lewat WhatsApp
        </h2>
        <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-2">
          Jam praktek belum tersedia di situs ini, jadi pemilihan waktu belum
          bisa ditampilkan. Silakan hubungi klinik langsung untuk mengatur
          waktu kunjungan.
        </p>
        <div className="mt-6">
          <WhatsAppLink
            label="Janji temu (jam belum tersedia)"
            weight="primary"
            body="Halo Santi Vet Care, saya ingin membuat janji temu."
          />
        </div>
      </div>
    </div>
  );
}
