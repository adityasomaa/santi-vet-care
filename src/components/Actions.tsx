"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { telHref, whatsappHref } from "@/lib/whatsapp";
import { usePageUrl } from "@/lib/usePageUrl";

/* ===========================================================================
 * The button vocabulary for this world: square plates with a hairline, never
 * a rounded pill. Three weights only.
 *
 *   primary   accent fill, ink hairline   — the one action that matters here
 *   solid     ink fill                    — strong secondary
 *   outline   paper fill, strong hairline — everything else
 * ========================================================================= */

type Weight = "primary" | "solid" | "outline";

const WEIGHT: Record<Weight, string> = {
  primary: "plate-accent hover:brightness-[0.97]",
  solid: "plate-ink hover:bg-ink-2",
  outline: "plate-interactive text-ink hover:bg-paper-2",
};

const BASE =
  "inline-flex min-h-14 items-center justify-center gap-3 px-5 py-3.5 " +
  "text-[0.9375rem] font-semibold leading-tight transition-[background-color,filter] " +
  "duration-150 select-none";

export function ActionPlate({
  weight = "outline",
  className = "",
  children,
  ...rest
}: {
  weight?: Weight;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BASE} ${WEIGHT[weight]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkPlate({
  href,
  weight = "outline",
  className = "",
  children,
  external = false,
}: {
  href: string;
  weight?: Weight;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls = `${BASE} ${WEIGHT[weight]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------------------
 * WhatsAppLink — the single component behind every WhatsApp button on the site.
 *
 * It attaches, automatically and without the call site having to think about
 * it, the label of the button pressed and the full URL of the page it was
 * pressed on. The clinic therefore always knows where a chat started.
 * ------------------------------------------------------------------------- */
export function WhatsAppLink({
  label,
  body,
  weight = "primary",
  className = "",
  emergency = false,
  children,
}: {
  /** Where this button lives, e.g. "WhatsApp (hero)". Never rendered — it is
   *  sent to the clinic as "Dari tombol: <label>" so they can tell which
   *  button on which page started the chat. Visible text comes from
   *  `children`. */
  label: string;
  /** Optional opening line above the automatic footer. */
  body?: string;
  weight?: Weight;
  className?: string;
  emergency?: boolean;
  children?: ReactNode;
}) {
  const pageUrl = usePageUrl();

  return (
    <a
      href={whatsappHref({ body, source: label, pageUrl, emergency })}
      className={`${BASE} ${WEIGHT[weight]} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsAppMark />
      <span>{children ?? "WhatsApp"}</span>
    </a>
  );
}

export function CallLink({
  label = "Telepon",
  weight = "outline",
  className = "",
  emergency = false,
  children,
}: {
  /** Not rendered; kept for parity with WhatsAppLink. */
  label?: string;
  weight?: Weight;
  className?: string;
  emergency?: boolean;
  children?: ReactNode;
}) {
  return (
    <a href={telHref(emergency)} className={`${BASE} ${WEIGHT[weight]} ${className}`}>
      <PhoneMark />
      <span>{children ?? label}</span>
    </a>
  );
}

/* --------------------------------------------------------------------- marks */
/* Drawn in the site's own line weight rather than pulled from an icon set, so
   they sit in the same grammar as the plates. */

export function WhatsAppMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="currentColor"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.83c2.15 0 4.17.84 5.7 2.36a8.03 8.03 0 0 1 2.37 5.72c0 4.46-3.63 8.08-8.08 8.08a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1.81.83-3.03-.2-.31a8.02 8.02 0 0 1-1.24-4.29c0-4.45 3.63-8.07 8.08-8.07Zm-2.9 4.28c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.12 3.64.58.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.19-.46-.39-.4-.54-.41h-.46Z" />
    </svg>
  );
}

export function PhoneMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
    </svg>
  );
}

export function RouteMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
