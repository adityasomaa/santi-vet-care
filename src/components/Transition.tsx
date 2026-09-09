"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GateMark } from "@/components/Wordmark";
import { CLINIC } from "@/data/clinic";

/* ===========================================================================
 * Two loaders, one gate.
 *
 *  1. The opening loader runs on a cold load and on arrival at the home page.
 *     The gate parts.
 *  2. The transition loader runs between pages. The gate closes, the content
 *     swaps behind it, the page scrolls to the top, the gate parts again.
 *
 * Sequence, in this order, always:
 *     page closes -> content changes -> scroll to top -> page opens
 *
 * Durations are deliberately short. This is the one project where a long
 * loader is actively harmful: someone whose dog is being sick will close the
 * tab rather than watch a curtain. Smooth beats slow.
 *
 * ---------------------------------------------------------------------------
 * requestAnimationFrame is never trusted to carry the sequence forward on its
 * own. rAF stops firing when the tab is backgrounded, which would leave the
 * curtain shut forever for anyone who switched apps mid-navigation. Every wait
 * races a setTimeout against rAF and continues on whichever lands first; the
 * timeout is the guarantee, rAF is only the smooth path.
 * ========================================================================= */

const CLOSE_MS = 280;
const OPEN_MS = 340;
const INTRO_MS = 460;

/** How long past a phase's own duration the curtain is allowed to remain in
 *  that phase before it is forced onward. See the watchdog below. */
const STUCK_GRACE_MS = 1200;

/** Resolves after `ms`, whether or not animation frames are being served. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    // The guarantee. Fires even in a backgrounded tab.
    const timer = window.setTimeout(finish, ms);
    // The smooth path, when frames are actually being served.
    const start = performance.now();
    const tick = () => {
      if (settled) return;
      if (performance.now() - start >= ms) finish();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

type Phase = "intro" | "idle" | "closing" | "opening";

const Ctx = createContext<{
  navigate: (href: string) => void;
  phase: Phase;
}>({ navigate: () => {}, phase: "idle" });

export const useTransition = () => useContext(Ctx);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("intro");
  const pending = useRef<string | null>(null);
  const lastPath = useRef(pathname);

  /* ---- opening loader, once per cold load ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      await wait(INTRO_MS);
      if (alive) setPhase("idle");
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ---- the route actually changed ---- */
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Content has swapped behind the closed gate. Reset the scroll position
    // before opening, so the new page starts at its top rather than inheriting
    // the previous page's offset.
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    let alive = true;
    (async () => {
      setPhase("opening");
      await wait(OPEN_MS);
      if (alive) setPhase("idle");
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      if (pending.current === href) return;
      pending.current = href;

      (async () => {
        setPhase("closing");
        await wait(CLOSE_MS);
        router.push(href);
        pending.current = null;
      })();
    },
    [pathname, router],
  );

  /* Watchdog.
   *
   * The curtain is only ever reopened by the pathname effect above, which
   * assumes the navigation lands. It does not always. A backgrounded tab
   * defers React's transition work, a prefetch can fail, a route can be slow —
   * and every one of those leaves a full-screen black panel over the page with
   * nothing scheduled to remove it.
   *
   * A stuck curtain is the worst possible failure on this particular site: it
   * hides the phone number from someone who is panicking. So the shut state is
   * given a hard deadline. If the route has not changed by then, the gate opens
   * anyway and the visitor gets the page they were already on, which is far
   * better than a black screen. */
  useEffect(() => {
    if (phase !== "closing") return;
    const timer = window.setTimeout(() => {
      setPhase((current) => (current === "closing" ? "opening" : current));
    }, CLOSE_MS + STUCK_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  /* Nothing may leave the curtain in the "opening" state either. */
  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => {
      setPhase((current) => (current === "opening" ? "idle" : current));
    }, OPEN_MS + STUCK_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  /* Back / forward buttons bypass navigate(). Snap the curtain shut for a beat
     so the swap is not a raw jump, then let the pathname effect open it. */
  useEffect(() => {
    const onPop = () => setPhase("closing");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const shut = phase === "closing" || phase === "intro";

  return (
    <Ctx.Provider value={{ navigate, phase }}>
      {children}
      <Curtain phase={phase} shut={shut} />
    </Ctx.Provider>
  );
}

/* ---------------------------------------------------------------------------
 * The curtain is the candi bentar: two stepped pylons that meet in the middle
 * to close and part to open. Same form as the site mark, at full scale.
 * ------------------------------------------------------------------------- */
function Curtain({ phase, shut }: { phase: Phase; shut: boolean }) {
  const hidden = phase === "idle";
  const intro = phase === "intro";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: "var(--z-overlay)",
        visibility: hidden ? "hidden" : "visible",
        transition: hidden ? "visibility 0s linear .05s" : "none",
      }}
    >
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className="absolute inset-y-0 w-[50.6%] bg-ink"
          style={{
            [side]: 0,
            transform: shut
              ? "translateX(0)"
              : `translateX(${side === "left" ? "-100.5%" : "100.5%"})`,
            transition: `transform ${shut ? CLOSE_MS : OPEN_MS}ms var(--ease-gate)`,
            willChange: "transform",
          }}
        />
      ))}

      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{
          opacity: shut ? 1 : 0,
          transition: `opacity ${shut ? 180 : 140}ms linear`,
        }}
      >
        <GateMark size={intro ? 40 : 28} className="text-accent" />
        {intro && (
          <span
            className="text-[0.6875rem] font-semibold tracking-[0.28em] text-paper-2 uppercase"
            style={{ fontStretch: "110%" }}
          >
            {CLINIC.name}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Use this instead of next/link anywhere inside the site, so navigation runs
 * through the gate. It stays a real <a> with a real href, so middle-click,
 * cmd-click, and "open in new tab" all behave normally, and it still works if
 * JavaScript never arrives.
 * ------------------------------------------------------------------------- */
export function TransitionLink({
  href,
  children,
  className = "",
  onNavigate,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { navigate } = useTransition();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }
        e.preventDefault();
        onNavigate?.();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
