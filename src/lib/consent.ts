"use client";

/* ===========================================================================
 * Cookie / storage consent.
 *
 * This banner is not decoration. Each switch changes what the site actually
 * does, and the effect is visible without opening developer tools:
 *
 *   perlu (necessary)    Always on. Two things only: the consent choice
 *                        itself, and the mobile menu / overlay state that
 *                        lives in memory. Nothing to opt out of.
 *
 *   preferensi           When ON, appointments made in the demo are written to
 *                        this browser, so a booked slot is still locked after
 *                        a refresh and still shows up in the admin view.
 *                        When OFF, the same appointments are held in memory
 *                        for this tab only and are gone on reload. The
 *                        WhatsApp message the form sends is unaffected either
 *                        way — that is the part that actually reaches the
 *                        clinic.
 *
 *   analitik             When ON, an analytics script may be loaded. When OFF,
 *                        none is requested at all. No analytics provider is
 *                        wired up at the moment, so this currently gates
 *                        nothing that exists; the switch is here so that
 *                        adding one later cannot skip the question.
 *
 * There is no "accept all or leave" wall, and declining is one click, not a
 * trip through a settings panel.
 * ========================================================================= */

export type Consent = {
  preferensi: boolean;
  analitik: boolean;
  /** ISO timestamp of the decision, so a stale policy can re-ask later. */
  decidedAt: string;
  version: number;
};

export const CONSENT_VERSION = 1;
const KEY = "svc.consent.v1";

export const DEFAULT_CONSENT: Consent = {
  preferensi: false,
  analitik: false,
  decidedAt: "",
  version: CONSENT_VERSION,
};

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(next: Omit<Consent, "decidedAt" | "version">): void {
  if (typeof window === "undefined") return;
  const value: Consent = {
    ...next,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* If we cannot even store the choice, we behave as if nothing was
       accepted, which is the conservative outcome. */
  }
  // If preference storage was just switched off, remove what it had kept.
  if (!value.preferensi) {
    try {
      window.localStorage.removeItem("svc.bookings.v1");
      window.localStorage.removeItem("svc.blocks.v1");
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent("svc:consent-changed", { detail: value }));
}

/** True when the visitor has allowed appointments to persist in this browser. */
export function mayPersist(): boolean {
  return readConsent()?.preferensi === true;
}
