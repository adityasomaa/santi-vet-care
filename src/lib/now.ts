/* ===========================================================================
 * The one place the current time enters the application.
 *
 * Everything time-dependent (the open/closed plate, past-slot filtering,
 * calendar bounds) reads through here, so a fake clock can be injected in one
 * move for verification without touching the machine's system time.
 *
 * Two injection channels, both client-side only:
 *
 *   1. URL      ?now=2026-09-08T21:30:00+08:00
 *   2. Console  window.__SVC_NOW__ = "2026-09-13T10:00:00+08:00"
 *
 * Neither is honoured on the server, so a crawler or a shared link can never
 * cause a wrong open/closed state to be rendered into HTML and cached.
 * ========================================================================= */

declare global {
  interface Window {
    __SVC_NOW__?: string;
  }
}

export function now(): Date {
  if (typeof window === "undefined") return new Date();

  const override =
    window.__SVC_NOW__ ??
    new URLSearchParams(window.location.search).get("now") ??
    null;

  if (override) {
    const d = new Date(override);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** True when a fake clock is active, so the UI can say so out loud rather
 *  than quietly lying to whoever is testing. */
export function clockIsOverridden(): boolean {
  if (typeof window === "undefined") return false;
  const v =
    window.__SVC_NOW__ ??
    new URLSearchParams(window.location.search).get("now") ??
    null;
  return Boolean(v && !Number.isNaN(new Date(v).getTime()));
}
