"use client";

import { useEffect, useState } from "react";
import { getOpenState, hoursAreConfigured, type OpenState } from "@/lib/hours";
import { clockIsOverridden, now } from "@/lib/now";

/* ===========================================================================
 * Live open / closed plate.
 *
 * Three behaviours the brief singles out:
 *
 *  1. Computed from a real instant, never from accumulated frames. The tick
 *     below re-reads the clock; it does not add to a counter. A tab left in the
 *     background for eight hours shows the right answer the moment it is
 *     focused again, because `visibilitychange` forces a fresh read.
 *
 *  2. When operating hours have not been filled in, this renders NOTHING. No
 *     placeholder, no "hubungi kami", no guess. An indicator that is silent is
 *     safe; one that is wrong is not.
 *
 *  3. Status is never carried by colour alone. The state is spelled out in
 *     words ("Buka sekarang" / "Sedang tutup"), and the two states differ in
 *     fill, not just hue.
 *
 * Rendering is deferred until after mount, because the server has no idea what
 * time it is where the visitor is and a hydration mismatch here would flash the
 * wrong answer.
 * ========================================================================= */

export function useOpenState(): OpenState | null {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    if (!hoursAreConfigured()) {
      setState({ status: "unknown" });
      return;
    }

    const read = () => setState(getOpenState(now()));
    read();

    // 30s is fine: the plate only ever changes on a minute boundary.
    const id = window.setInterval(read, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", read);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", read);
    };
  }, []);

  return state;
}

export function OpenStatusPlate({
  size = "lg",
  className = "",
}: {
  size?: "lg" | "sm";
  className?: string;
}) {
  const state = useOpenState();
  const [faked, setFaked] = useState(false);
  useEffect(() => setFaked(clockIsOverridden()), []);

  // Not mounted yet, or hours are not configured: render nothing at all.
  if (!state || state.status === "unknown") return null;

  const open = state.status === "open";

  if (size === "sm") {
    return (
      <p
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm ${className}`}
        role="status"
      >
        <span
          className={`inline-flex items-center gap-2 font-semibold ${
            open ? "text-ink" : "text-ink-2"
          }`}
        >
          <StateMark open={open} />
          {state.label}
        </span>
        <span className="text-ink-3">{state.detail}</span>
      </p>
    );
  }

  return (
    <div className={className} role="status">
      {/* The status word is the largest thing on the page — larger than the
          clinic's own name and larger than the headline — because it is the
          question the visitor arrived with. The fuller phrase is still
          announced to assistive tech via aria-label. */}
      <div
        className={`inline-flex items-baseline gap-4 px-5 py-3 sm:px-6 sm:py-4 ${
          open ? "plate-accent" : "plate-ink"
        }`}
        aria-label={state.label}
      >
        <StateMark open={open} />
        <span
          aria-hidden="true"
          className="type-display text-[clamp(2.125rem,7.5vw,3.5rem)] uppercase"
        >
          {state.word}
        </span>
      </div>
      <p className="mt-3 text-[1.0625rem] font-medium text-ink-2">
        <span className="sr-only">{state.label}. </span>
        {state.detail}
      </p>
      {faked && (
        <p className="mt-1 text-xs font-semibold text-accent-deep">
          Jam disimulasikan untuk pengujian (parameter ?now=).
        </p>
      )}
    </div>
  );
}

/**
 * The two states differ in shape as well as fill: open is a solid disc, closed
 * is a ring with a bar through it. Colour is never the only signal.
 */
function StateMark({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="18"
      height="18"
      aria-hidden="true"
      className="shrink-0 self-center"
    >
      {open ? (
        <circle cx="8" cy="8" r="6" fill="currentColor" />
      ) : (
        <>
          <circle
            cx="8"
            cy="8"
            r="5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="4"
            y1="12"
            x2="12"
            y2="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
