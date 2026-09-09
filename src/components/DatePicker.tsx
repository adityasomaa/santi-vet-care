"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { setScrollLocked } from "@/components/SmoothScroll";
import { BOOKING, DAY_NAMES_ID } from "@/data/clinic";
import { dateIsSelectable, dateKeyPlus, formatDateLong, zonedParts } from "@/lib/hours";
import { now } from "@/lib/now";

/* ===========================================================================
 * Date field.
 *
 * Not <input type="date">: the native control looks and behaves differently in
 * every browser, cannot show which days the clinic is shut, and on desktop
 * hides its picker behind a small icon rather than opening from the field.
 *
 * Behaviour the brief asks for:
 *   - clicking anywhere on the field opens the calendar, not just an icon
 *   - past dates are refused, and so are days with no slots at all
 *   - the panel is portalled to <body>, so no ancestor's overflow can clip it
 *   - full keyboard grid: arrows, Home/End, PageUp/PageDown, Enter, Escape
 * ========================================================================= */

const MONTHS = [
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

const key = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function DatePicker({
  label,
  value,
  onChange,
  error,
  required = false,
}: {
  label: string;
  value: string | null;
  onChange: (dateKey: string) => void;
  error?: string;
  required?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [clock, setClock] = useState<Date | null>(null);
  const [cursor, setCursor] = useState<string | null>(null); // focused day
  const [view, setView] = useState<{ y: number; m: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setClock(now());
  }, []);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (el) setRect(el.getBoundingClientRect());
  }, []);

  const openPanel = useCallback(() => {
    const t = now();
    setClock(t);
    const start = value ?? zonedParts(t).dateKey;
    const [y, m] = start.split("-").map(Number);
    setView({ y, m: m - 1 });
    setCursor(start);
    place();
    setOpen(true);
    setScrollLocked(true);
  }, [place, value]);

  const closePanel = useCallback((returnFocus = true) => {
    setOpen((was) => {
      if (was) setScrollLocked(false);
      return false;
    });
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  useEffect(() => {
    return () => {
      if (open) setScrollLocked(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) gridRef.current?.focus();
  }, [open, view]);

  const moveCursor = (days: number) => {
    if (!cursor) return;
    const next = dateKeyPlus(cursor, days);
    setCursor(next);
    const [y, m] = next.split("-").map(Number);
    setView({ y, m: m - 1 });
  };

  const onGridKey = (e: React.KeyboardEvent) => {
    if (!cursor || !clock) return;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveCursor(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveCursor(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveCursor(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveCursor(-7);
        break;
      case "PageDown":
        e.preventDefault();
        moveCursor(28);
        break;
      case "PageUp":
        e.preventDefault();
        moveCursor(-28);
        break;
      case "Home":
        e.preventDefault();
        moveCursor(-(new Date(`${cursor}T12:00:00Z`).getUTCDay()));
        break;
      case "End":
        e.preventDefault();
        moveCursor(6 - new Date(`${cursor}T12:00:00Z`).getUTCDay());
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (dateIsSelectable(cursor, clock)) {
          onChange(cursor);
          closePanel();
        }
        break;
      case "Escape":
        e.preventDefault();
        closePanel();
        break;
    }
  };

  const shiftMonth = (delta: number) => {
    setView((v) => {
      if (!v) return v;
      const d = new Date(Date.UTC(v.y, v.m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  };

  return (
    <div>
      <label htmlFor={id} className="type-label block text-ink-2">
        {label}
        {required && <span className="text-accent-deep"> *</span>}
      </label>

      {/* The whole field is the trigger, not a small icon inside it. */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closePanel() : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[1.0625rem] ${
          error ? "border border-accent-deep bg-paper" : "plate-interactive"
        }`}
      >
        <span className={value ? "font-medium" : "text-ink-3"}>
          {value ? formatDateLong(value) : "Pilih tanggal"}
        </span>
        <svg
          viewBox="0 0 20 20"
          width="18"
          height="18"
          aria-hidden="true"
          className="shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="2.5" y="4" width="15" height="13.5" />
          <path d="M2.5 8h15M6.5 2v3M13.5 2v3" strokeLinecap="round" />
        </svg>
      </button>

      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-accent-deep">
          {error}
        </p>
      )}

      {mounted &&
        open &&
        rect &&
        view &&
        clock &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-ink/25 sm:bg-transparent"
              style={{ zIndex: "var(--z-overlay)" }}
              onPointerDown={() => closePanel()}
            />
            <div
              role="dialog"
              aria-label={label}
              aria-modal="false"
              className="plate fixed border-ink p-4 shadow-[0_16px_48px_rgba(20,20,20,0.24)]"
              style={{
                zIndex: "var(--z-overlay)",
                left: clampLeft(rect),
                width: Math.min(Math.max(rect.width, 300), 340),
                top:
                  rect.bottom + 400 > window.innerHeight && rect.top > 400
                    ? undefined
                    : rect.bottom + 6,
                bottom:
                  rect.bottom + 400 > window.innerHeight && rect.top > 400
                    ? window.innerHeight - rect.top + 6
                    : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="plate-interactive inline-flex h-11 w-11 items-center justify-center"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Bulan sebelumnya"
                >
                  <Chevron dir="left" />
                </button>
                <p aria-live="polite" className="text-[0.9375rem] font-bold">
                  {MONTHS[view.m]} {view.y}
                </p>
                <button
                  type="button"
                  className="plate-interactive inline-flex h-11 w-11 items-center justify-center"
                  onClick={() => shiftMonth(1)}
                  aria-label="Bulan berikutnya"
                >
                  <Chevron dir="right" />
                </button>
              </div>

              <div
                ref={gridRef}
                tabIndex={0}
                role="grid"
                aria-label={`Kalender ${MONTHS[view.m]} ${view.y}`}
                onKeyDown={onGridKey}
                className="mt-4 focus:outline-none"
              >
                <div role="row" className="grid grid-cols-7">
                  {DAY_NAMES_ID.map((d) => (
                    <abbr
                      key={d}
                      role="columnheader"
                      title={d}
                      className="pb-2 text-center text-[0.6875rem] font-semibold tracking-[0.06em] text-ink-3 uppercase no-underline"
                    >
                      {d.slice(0, 2)}
                    </abbr>
                  ))}
                </div>

                {buildWeeks(view.y, view.m).map((week, wi) => (
                  <div role="row" key={wi} className="grid grid-cols-7">
                    {week.map((day, di) => {
                      if (day === null) {
                        return <div role="gridcell" key={di} className="h-11" />;
                      }
                      const k = key(view.y, view.m, day);
                      const selectable = dateIsSelectable(k, clock);
                      const isSelected = k === value;
                      const isCursor = k === cursor;
                      return (
                        <div role="gridcell" key={di}>
                          <button
                            type="button"
                            tabIndex={-1}
                            disabled={!selectable}
                            aria-selected={isSelected}
                            aria-label={`${formatDateLong(k)}${selectable ? "" : " — tidak tersedia"}`}
                            onClick={() => {
                              onChange(k);
                              closePanel();
                            }}
                            className={`h-11 w-full text-[0.9375rem] tabular-nums transition-colors ${
                              isSelected
                                ? "plate-accent font-bold"
                                : selectable
                                  ? `hover:bg-paper-2 ${isCursor ? "ring-2 ring-accent-deep ring-inset" : ""}`
                                  : "cursor-not-allowed text-ink-3 line-through opacity-45"
                            }`}
                          >
                            {day}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <p className="mt-3 border-t border-rule pt-3 text-xs leading-relaxed text-ink-3">
                Tanggal yang dicoret tidak tersedia: sudah lewat, di luar hari
                praktek, atau melebihi {BOOKING.maxAdvanceDays} hari ke depan.
              </p>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

function clampLeft(rect: DOMRect): number {
  const width = Math.min(Math.max(rect.width, 300), 340);
  const max = window.innerWidth - width - 12;
  return Math.max(12, Math.min(rect.left, max));
}

function buildWeeks(y: number, m: number): (number | null)[][] {
  const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: dir === "right" ? "rotate(180deg)" : undefined }}
    >
      <path d="m12 4-6 6 6 6" />
    </svg>
  );
}
