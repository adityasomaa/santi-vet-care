import type { ReactNode } from "react";

/** Reading measure and rhythm for the two legal pages. Kept local rather than
 *  pulled in as a typography plugin — two pages do not justify a dependency. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[68ch] [&_h2]:type-display [&_h2]:mt-12 [&_h2]:text-[clamp(1.25rem,3.4vw,1.625rem)] [&_h2:first-child]:mt-0 [&_h3]:mt-8 [&_h3]:text-[1.0625rem] [&_h3]:font-bold [&_li]:text-[1.0625rem] [&_li]:leading-relaxed [&_li]:text-ink-2 [&_p]:mt-4 [&_p]:text-[1.0625rem] [&_p]:leading-relaxed [&_p]:text-ink-2 [&_ul]:mt-4 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2.5 [&_ul]:pl-5">
      {children}
    </div>
  );
}
