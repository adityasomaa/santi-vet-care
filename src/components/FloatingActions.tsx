"use client";

import { usePathname } from "next/navigation";
import { CLINIC } from "@/data/clinic";
import { telHref, whatsappHref } from "@/lib/whatsapp";
import { PhoneMark, RouteMark, WhatsAppMark } from "@/components/Actions";
import { usePageUrl } from "@/lib/usePageUrl";

/* ===========================================================================
 * The floating action rail.
 *
 * Contact has to stay one thumb away on every page, because the person using
 * this site is often standing up, holding an animal, in a hurry.
 *
 * Three things this rail must not do:
 *
 *  1. Cover the last control on a page. Every page carries `.page-bottom-gap`,
 *     which reserves --fab-reserve plus the safe-area inset underneath its
 *     content, so the rail always floats over empty space.
 *  2. Swallow clicks. The container is pointer-events-none; only the three
 *     plates themselves accept a pointer.
 *  3. Sit above the mobile menu or the cookie banner. Its layer is below both.
 *
 * It is hidden on the admin route, which is not a visitor surface.
 * ========================================================================= */

export function FloatingActions() {
  const pathname = usePathname();
  const pageUrl = usePageUrl();
  if (pathname.startsWith("/admin")) return null;

  const items = [
    {
      key: "wa",
      href: whatsappHref({
        body: "Halo Santi Vet Care, saya ingin bertanya.",
        source: "Tombol melayang WhatsApp",
        pageUrl,
      }),
      label: "WhatsApp",
      mark: <WhatsAppMark />,
      className: "plate-accent",
      external: true,
    },
    {
      key: "tel",
      href: telHref(),
      label: "Telepon",
      mark: <PhoneMark />,
      className: "plate-ink",
      external: false,
    },
    {
      key: "map",
      href: CLINIC.mapsDirectionsUrl,
      label: "Rute",
      mark: <RouteMark />,
      className: "plate-interactive",
      external: true,
    },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 lg:hidden"
      style={{ zIndex: "var(--z-fab)" }}
    >
      <div
        className="shell pb-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="pointer-events-auto grid grid-cols-3 gap-2">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.href}
              {...(it.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`${it.className} flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 shadow-[0_2px_16px_rgba(20,20,20,0.14)]`}
            >
              {it.mark}
              <span className="text-[0.6875rem] font-semibold tracking-[0.06em] uppercase">
                {it.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
