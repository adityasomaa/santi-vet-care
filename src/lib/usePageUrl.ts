"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/data/clinic";

/* ===========================================================================
 * The URL to stamp into an outgoing WhatsApp message.
 *
 * The server cannot know window.location, so reading it during render produces
 * a different href on the server than in the browser and React reports a
 * hydration mismatch (and, worse, refuses to patch the attribute up).
 *
 * So: render the canonical URL first, which is correct and stable on both
 * sides, then upgrade to the live URL after mount. The live one is preferable
 * because it keeps query strings — a message sent from
 * /janji-temu?layanan=vaksinasi should say so.
 * ========================================================================= */
export function usePageUrl(): string {
  const pathname = usePathname();
  const [url, setUrl] = useState(() => `${SITE_URL}${pathname}`);

  useEffect(() => {
    setUrl(window.location.href);
  }, [pathname]);

  return url;
}
