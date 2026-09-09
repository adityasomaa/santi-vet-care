"use client";

import type { Service } from "@/data/clinic";
import { Art } from "@/components/Art";
import { TransitionLink } from "@/components/Transition";

/* Each service carries its own 1:1 composition, so the cards can be told apart
   at a glance without reading the label. No prices anywhere — the brief is
   explicit, and "mulai dari" with a number is exactly what it forbids. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="plate flex flex-col">
      <Art name={service.art} ratio="1/1" className="border-b border-rule" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="type-label text-accent-deep">{service.group}</p>
        <h3 className="type-display mt-2.5 text-[1.375rem]">{service.label}</h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
          {service.blurb}
        </p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
          {service.when}
        </p>
        <div className="mt-5 flex-1" />
        <TransitionLink
          href={`/janji-temu?layanan=${service.id}`}
          className="plate-interactive inline-flex min-h-12 items-center justify-center px-4 py-2.5 text-sm font-semibold hover:bg-paper-2"
        >
          Buat janji temu
        </TransitionLink>
      </div>
    </article>
  );
}
