import type { CSSProperties } from "react";

/* ===========================================================================
 * Every image on this site goes through this component.
 *
 * Two orientations exist and no others: 16:9 and 1:1. The ratio is locked here
 * rather than at each call site, so a composition can never quietly introduce a
 * third shape. The wrapper holds its space with aspect-ratio before the file
 * loads, so nothing below it moves when the image arrives.
 *
 * If a layout ever seems to demand a different ratio, change the composition,
 * not the ratio.
 * ========================================================================= */

type Props = {
  /** file name in /public/art, without extension */
  name: string;
  ratio: "16/9" | "1/1";
  /** Empty string marks it decorative and hides it from assistive tech, which
   *  is correct for every generated placeholder here. */
  alt?: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
};

export function Art({
  name,
  ratio,
  alt = "",
  className = "",
  priority = false,
  style,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden bg-paper-2 ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      {/* Plain <img>: these are flat SVGs, so Next's optimizer would add
          nothing, and image optimization is disabled on this deployment
          anyway (see next.config.ts). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/art/${name}.svg`}
        alt={alt}
        aria-hidden={alt === "" ? true : undefined}
        width={ratio === "16/9" ? 1600 : 600}
        height={ratio === "16/9" ? 900 : 600}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}
