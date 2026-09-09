import { CLINIC } from "@/data/clinic";

/** The gate mark: the split threshold, reduced to two stepped pylons. Used
 *  beside the wordmark in the header and the footer. */
export function GateMark({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      fill="currentColor"
    >
      <path d="M1 29V26h4V20h2.5v-6H10V8.5h2.5V29H1Z" />
      <path d="M31 29V26h-4V20h-2.5v-6H22V8.5h-2.5V29H31Z" />
    </svg>
  );
}

export function Wordmark({
  className = "",
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <GateMark className="text-accent-deep" />
      <span className="flex flex-col leading-none">
        <span
          className="text-[0.9375rem] font-bold tracking-[0.02em] uppercase"
          style={{ fontStretch: "112%" }}
        >
          {CLINIC.name}
        </span>
        {withTagline && (
          <span className="mt-1 text-[0.6875rem] font-medium tracking-[0.08em] text-ink-3 uppercase">
            {CLINIC.tagline}
          </span>
        )}
      </span>
    </span>
  );
}
