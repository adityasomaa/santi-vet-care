"use client";

import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/Transition";
import { ActionPlate } from "@/components/Actions";
import { readConsent, writeConsent, type Consent } from "@/lib/consent";

/* ===========================================================================
 * Consent banner.
 *
 * Layering, per the brief: this sits ABOVE the floating action rail so the
 * rail cannot punch through it, and BELOW the mobile menu so it can never
 * cover the navigation. On small screens the rail is pushed up out from under
 * it while the banner is visible, so neither element eats the other's taps.
 *
 * Every switch here changes real behaviour — see src/lib/consent.ts.
 * ========================================================================= */

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState({ preferensi: true, analitik: false });

  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      // Defer a beat so the banner is not part of the first paint.
      const t = window.setTimeout(() => setVisible(true), 700);
      return () => window.clearTimeout(t);
    }
    setDraft({ preferensi: existing.preferensi, analitik: existing.analitik });
  }, []);

  // While the banner is up, lift the floating rail so the two never overlap.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--fab-reserve",
      visible ? "13rem" : "5.5rem",
    );
    return () => {
      document.documentElement.style.setProperty("--fab-reserve", "5.5rem");
    };
  }, [visible]);

  const decide = (next: Pick<Consent, "preferensi" | "analitik">) => {
    writeConsent(next);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0"
      style={{ zIndex: "var(--z-cookie)" }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
    >
      <div className="shell pb-3">
        <div className="plate border-ink border-t-[3px] p-5 shadow-[0_-4px_28px_rgba(20,20,20,0.16)] sm:p-6">
          <h2 id="cookie-title" className="text-base font-bold">
            Penyimpanan di peramban Anda
          </h2>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-ink-2">
            Situs ini menyimpan sedikit data di peramban Anda. Yang wajib hanya
            pilihan Anda di kotak ini. Sisanya bisa Anda tolak, dan situs tetap
            berfungsi penuh.{" "}
            <TransitionLink
              href="/privasi"
              className="font-semibold text-accent-deep underline underline-offset-2"
            >
              Kebijakan privasi
            </TransitionLink>
          </p>

          {expanded && (
            <div className="mt-5 flex flex-col gap-3 border-t border-rule pt-5">
              <Row
                title="Diperlukan"
                body="Menyimpan pilihan Anda di kotak ini. Tidak bisa dimatikan."
                checked
                locked
              />
              <Row
                title="Preferensi"
                body="Mengingat janji temu yang Anda buat di peramban ini, sehingga slot yang sudah dipesan tetap terkunci setelah halaman dimuat ulang. Kalau dimatikan, janji temu hanya bertahan selama tab ini terbuka. Pesan WhatsApp tetap terkirim seperti biasa."
                checked={draft.preferensi}
                onChange={(v) => setDraft((d) => ({ ...d, preferensi: v }))}
              />
              <Row
                title="Analitik"
                body="Mengizinkan pemuatan skrip analitik. Saat ini belum ada penyedia analitik yang dipasang, jadi mematikannya tidak mengubah apa pun hari ini. Saklarnya ada supaya penambahan nanti tidak melewati izin Anda."
                checked={draft.analitik}
                onChange={(v) => setDraft((d) => ({ ...d, analitik: v }))}
              />
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ActionPlate
              weight="primary"
              className="sm:flex-1"
              onClick={() => decide({ preferensi: true, analitik: true })}
            >
              Terima semua
            </ActionPlate>
            <ActionPlate
              weight="outline"
              className="sm:flex-1"
              onClick={() => decide({ preferensi: false, analitik: false })}
            >
              Tolak yang opsional
            </ActionPlate>
            {expanded ? (
              <ActionPlate
                weight="solid"
                className="sm:flex-1"
                onClick={() => decide(draft)}
              >
                Simpan pilihan
              </ActionPlate>
            ) : (
              <ActionPlate
                weight="outline"
                className="sm:flex-1"
                onClick={() => setExpanded(true)}
              >
                Atur sendiri
              </ActionPlate>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  title,
  body,
  checked,
  locked = false,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex gap-3 ${locked ? "opacity-70" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent-deep)]"
      />
      <span>
        <span className="block text-sm font-semibold">
          {title}
          {locked && (
            <span className="ml-2 font-medium text-ink-3">selalu aktif</span>
          )}
        </span>
        <span className="mt-1 block max-w-[62ch] text-sm leading-relaxed text-ink-2">
          {body}
        </span>
      </span>
    </label>
  );
}
