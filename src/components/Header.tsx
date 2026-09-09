"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { CLINIC } from "@/data/clinic";
import { Wordmark } from "@/components/Wordmark";
import { TransitionLink } from "@/components/Transition";
import { WhatsAppLink, PhoneMark } from "@/components/Actions";
import { OpenStatusPlate } from "@/components/OpenStatus";
import { telHref } from "@/lib/whatsapp";
import { setScrollLocked } from "@/components/SmoothScroll";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on route change.
  useEffect(() => setOpen(false), [pathname]);

  // While the sheet is open the page behind it must not scroll, and Lenis must
  // be paused or it will keep driving the body under the overlay.
  useEffect(() => {
    setScrollLocked(open);
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a
        href="#konten"
        className="sr-only-focusable fixed top-3 left-3 bg-ink px-4 py-3 text-sm font-semibold text-paper"
        style={{ zIndex: "var(--z-skip)" }}
      >
        Lompat ke konten utama
      </a>

      <header
        className="sticky top-0 border-b border-rule bg-paper/95 backdrop-blur-sm"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <TransitionLink
            href="/"
            className="-m-2 p-2"
            aria-label={`${CLINIC.name}, ke beranda`}
          >
            <Wordmark />
          </TransitionLink>

          <nav aria-label="Utama" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <TransitionLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-block px-3.5 py-2 text-[0.9375rem] font-medium transition-colors ${
                        active
                          ? "text-ink underline decoration-accent decoration-[3px] underline-offset-[7px]"
                          : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={telHref()}
              className="inline-flex min-h-11 items-center gap-2 px-3 text-[0.9375rem] font-semibold text-ink hover:text-accent-deep"
            >
              <PhoneMark />
              <span className="tabular-nums">{CLINIC.phoneDisplay}</span>
            </a>
            <WhatsAppLink
              label="WhatsApp (header)"
              weight="primary"
              className="!min-h-11 !px-4 !py-2.5 !text-sm"
              body="Halo Santi Vet Care, saya ingin bertanya."
            >
              WhatsApp
            </WhatsAppLink>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="plate-interactive -mr-1 inline-flex h-12 w-12 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="menu-seluler"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l14 14M19 5L5 19"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3.5 7h17M3.5 12h17M3.5 17h17"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile sheet. Sits above the floating action rail so the rail cannot
          punch through it, and below the calendar/modal layer. */}
      <div
        id="menu-seluler"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-0 lg:hidden"
        style={{ zIndex: "var(--z-mobile-menu)" }}
      >
        <button
          type="button"
          aria-label="Tutup menu"
          className="absolute inset-0 bg-ink/45"
          onClick={() => setOpen(false)}
        />
        <div className="absolute inset-x-0 top-0 max-h-[100svh] overflow-y-auto border-b border-ink bg-paper pb-8">
          <div className="shell flex h-16 items-center justify-between">
            <Wordmark />
            <button
              type="button"
              className="plate-interactive -mr-1 inline-flex h-12 w-12 items-center justify-center"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
            >
              <span className="sr-only">Tutup menu</span>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M5 5l14 14M19 5L5 19"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="shell">
            <OpenStatusPlate size="sm" className="border-t border-rule pt-5" />

            <nav aria-label="Utama (seluler)" className="mt-5">
              <ul className="flex flex-col">
                {NAV.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href} className="border-t border-rule">
                      <TransitionLink
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onNavigate={() => setOpen(false)}
                        className="flex min-h-14 items-center justify-between py-3 text-lg font-semibold"
                      >
                        <span>{item.label}</span>
                        {active && (
                          <span className="type-label text-accent-deep">
                            Halaman ini
                          </span>
                        )}
                      </TransitionLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              <WhatsAppLink
                label="WhatsApp (menu seluler)"
                weight="primary"
                body="Halo Santi Vet Care, saya ingin bertanya."
              />
              <a
                href={telHref()}
                className="plate-interactive inline-flex min-h-14 items-center justify-center gap-3 px-5 py-3.5 text-[0.9375rem] font-semibold"
              >
                <PhoneMark />
                <span className="tabular-nums">{CLINIC.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
