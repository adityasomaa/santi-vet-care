"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/* ===========================================================================
 * Lenis smooth scrolling, deliberately narrow in scope.
 *
 * It runs on pointer-driven desktop widths only. It is switched off for:
 *
 *   - tablet and phone widths, where the OS already owns momentum scrolling
 *     and hijacking it makes the page feel broken and laggy under a thumb
 *   - anyone who asked for reduced motion
 *   - the admin route, which is a working tool, not a showcase
 *   - any moment a calendar, modal, or the mobile menu is open, because Lenis
 *     would otherwise keep driving the page behind the overlay
 * ========================================================================= */

let lenis: Lenis | null = null;
let lockCount = 0;

/** Called by any overlay that takes over the viewport. Reference-counted, so
 *  two overlapping overlays cannot leave scrolling stuck off. */
export function setScrollLocked(locked: boolean): void {
  lockCount = Math.max(0, lockCount + (locked ? 1 : -1));
  const shouldLock = lockCount > 0;

  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("lenis-stopped", shouldLock);
    document.body.style.overflow = shouldLock ? "hidden" : "";
  }
  if (lenis) {
    if (shouldLock) lenis.stop();
    else lenis.start();
  }
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const enabled =
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !pathname.startsWith("/admin");

    if (!enabled) {
      document.documentElement.classList.remove("lenis-active");
      return;
    }

    document.documentElement.classList.add("lenis-active");
    const instance = new Lenis({
      duration: 0.85,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 0,
    });
    lenis = instance;
    if (lockCount > 0) instance.stop();

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      if (lenis === instance) lenis = null;
      document.documentElement.classList.remove("lenis-active");
    };
  }, [pathname]);

  return null;
}
