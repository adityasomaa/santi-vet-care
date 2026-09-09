"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ===========================================================================
 * SectionHeader — used by every section on the site, in the same order every
 * time: section label, headline, short description, call to action.
 *
 * Heading line budget (brief §49) is handled by measure, not by hard line
 * breaks: `.h-budget` caps the text at 17ch on phones, 26ch on tablets, and
 * lets desktop run on one line. A single hard-coded <br> cannot be right at
 * three widths at once, so there are none.
 * ========================================================================= */

export function SectionHeader({
  label,
  headline,
  description,
  cta,
  align = "start",
  loose = false,
  as: Heading = "h2",
}: {
  label: string;
  headline: string;
  description: string;
  cta?: ReactNode;
  align?: "start" | "center";
  /** Slightly wider measure, for headlines that read badly when very short. */
  loose?: boolean;
  as?: "h1" | "h2";
}) {
  const centered = align === "center";
  return (
    <header className={centered ? "flex flex-col items-center text-center" : ""}>
      <p className="type-label text-ink-3">{label}</p>
      <Heading
        className={`type-display mt-4 text-[clamp(1.75rem,6.2vw,3.25rem)] ${
          loose ? "h-budget-loose" : "h-budget"
        } ${centered ? "mx-auto" : ""}`}
      >
        {headline}
      </Heading>
      <p
        className={`mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-2 ${
          centered ? "mx-auto" : ""
        }`}
      >
        {description}
      </p>
      {cta && <div className="mt-7 flex flex-wrap gap-3">{cta}</div>}
    </header>
  );
}

export function Section({
  id,
  children,
  className = "",
  bleed = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-16 sm:py-20 lg:py-28 ${className}`}
      // The gate strips are absolutely positioned inside this element, so it
      // must establish a containing block without clipping: `overflow-hidden`
      // here would zero out every IntersectionObserver ratio inside it and
      // reveal animations would never fire (brief §64).
      style={bleed ? undefined : { position: "relative" }}
    >
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Reveal — a small, once-only entrance.
 *
 * Deliberately restrained. Motion intensity on this project is 2 of 5: someone
 * whose cat is being sick should not be waiting on a stagger to finish before
 * they can read a phone number. Content is visible by default if the observer
 * never fires, and skipped outright under prefers-reduced-motion.
 *
 * Never place this inside an `overflow-hidden` ancestor — the intersection
 * ratio stays at 0 and the content would stay hidden forever.
 * ------------------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);

    // Safety net: if the observer never fires for any reason (a clipping
    // ancestor added later, an odd embedded webview), show the content anyway.
    const fallback = window.setTimeout(() => setShown(true), 1200);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(14px)",
        transition: `opacity .5s var(--ease-out-soft) ${delay}ms, transform .5s var(--ease-out-soft) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
