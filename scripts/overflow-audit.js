/* ===========================================================================
 * Horizontal overflow audit (brief §62).
 *
 * Finds every element whose box extends past the document's right edge — the
 * things that make a page scroll sideways on a phone. Returns a list, so the
 * pass condition is "zero offenders", not "looks fine".
 *
 * Run it against the page in one of three ways:
 *   - paste into the browser console on each route
 *   - inject via the browser automation tool (what this build used)
 *   - keep it in a Playwright/Puppeteer run if one is added later
 *
 * The check ignores elements that are deliberately clipped or scrolled inside
 * their own container (overflow-x: auto/scroll/hidden/clip), because those do
 * not push the document sideways — the admin table is the intended example.
 * ========================================================================= */
(function auditHorizontalOverflow() {
  const docWidth = document.documentElement.clientWidth;
  const offenders = [];

  const isScrollContainer = (el) => {
    const ox = getComputedStyle(el).overflowX;
    return ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip";
  };

  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    // Fixed overlays are positioned against the viewport, not the document.
    if (cs.position === "fixed") continue;

    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    /* Two ways an element pushes the page sideways, and both must be checked.
       A box wider than the document is the obvious one. The subtle one is an
       element whose box fits but whose inline content spills out of it —
       `text-wrap: nowrap` on a long heading does exactly this, and a
       bounding-rect check alone will report the page as clean while the
       document scrolls 600px to the right. */
    const spills = el.scrollWidth > el.clientWidth + 1 && !isScrollContainer(el);
    const right = r.right + window.scrollX;
    const overhangs = right > docWidth + 1;
    if (!spills && !overhangs) continue;

    // If any ancestor clips or scrolls horizontally, this element is contained.
    let contained = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (isScrollContainer(p)) {
        contained = true;
        break;
      }
    }
    if (contained) continue;

    offenders.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().slice(0, 90),
      text: (el.textContent || "").trim().slice(0, 50),
      reason: overhangs ? "box extends past the document" : "content spills out of its box",
      overflowPx: overhangs
        ? Math.round(right - docWidth)
        : el.scrollWidth - el.clientWidth,
    });
  }

  return {
    viewport: window.innerWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: docWidth,
    pageScrollsSideways:
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    offenderCount: offenders.length,
    offenders: offenders.slice(0, 12),
  };
})();
