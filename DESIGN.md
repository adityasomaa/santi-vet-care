# DESIGN.md — Santi Vet Care

Recorded from the built site, not from intention. Everything below is in the
code; where the code and this file disagree, the code is right and this file is
stale.

Direction contract and the alternatives weighed: [`DIRECTION.md`](DIRECTION.md).
Product truth and the do-not-invent list: [`PRODUCT.md`](PRODUCT.md).

---

## The world

**Candi bentar and poleng.** A split gate is a threshold that is either open to
you or not, and *saput poleng* is a visual system built on paired opposites.
The most important fact on this site is a binary — Buka or Tutup — so the form
and the content say the same thing.

The ritual object is never printed as literal checkered cloth. Four things
carry over, and they are the whole system:

1. **Paired opposition** — two states, two plate fills, never a spectrum.
2. **The modular square** — every plate is square-cornered; `border-radius` is
   `0` everywhere on the site. There are no pills and no rounded cards.
3. **An achromatic ground with exactly one signal colour.**
4. **The split-and-part threshold** — the gate mark, the page-transition
   curtain, and the hero artwork are all the same form at three scales.

If a new component needs a decision, ask which of those four it expresses.

---

## Colour

Tokens live in the `@theme` block of `src/app/globals.css`. Two deliberate
exceptions: the focus ring uses a 2px radius so it does not read as a plate,
and four overlay elements carry a blurred `rgba()` ambient shadow (cookie
banner, calendar, listbox, floating rail) because they float over content the
hairline system was never designed to separate them from.
`npm run audit:contrast` parses that block; **16/16 required pairs pass WCAG
AA**. Re-run it after any colour change — it is wired to fail the command.

| Token | Value | Role |
|---|---|---|
| `--color-paper` | `#fafaf8` | page ground — a true neutral near-white, **not cream** |
| `--color-paper-2` | `#efefea` | alternating section ground, plate fill |
| `--color-paper-3` | `#e4e4dd` | deepest neutral fill, used sparingly |
| `--color-ink` | `#141414` | body text, ink plates, the curtain |
| `--color-ink-2` | `#4a4a45` | secondary text |
| `--color-ink-3` | `#63635c` | meta text, disabled states |
| `--color-rule` | `#d8d8d1` | decorative hairlines only |
| `--color-rule-strong` | `#7c7c75` | **interactive** borders — 4.02:1, the 1.4.11 floor |
| `--color-accent` | `#f0a11a` | gemitir marigold — large fills, always with ink text |
| `--color-accent-deep` | `#7d4406` | accent as text or icon on a light ground |
| `--color-accent-soft` | `#fdf0d9` | accent tint ground |

**Strategy: restrained.** Neutrals plus one accent. Marigold is allowed in
exactly three roles and nowhere else:

1. **State** — the open/closed plate, a selected slot, a ticked symptom.
2. **The primary action** on a surface — one per surface.
3. **Error** — an erroring field, its 2px border, its tint, and its message.
   An error is a state, and this palette has no second hue to spend on it.

Section labels are `--color-ink-3`, not accent. They were accent during the
build and it diluted the signal to the point where nothing on the page stood
out — which is the one thing this world exists to prevent.

Two rules the audit enforces as *forbidden*, so a future token tweak cannot
quietly make them tempting:

- `--color-ink-2` on `--color-accent` (4.17:1) — on an accent fill, only
  `--color-ink` is allowed.
- A bare accent fill with no ink hairline. The accent is only 2.05:1 against
  the page, so **`.plate-accent` always carries a `--color-ink` border.** Never
  drop it.

Light ground only, `color-scheme: light`. The physical scene decided it:
someone outdoors in Denpasar at 10am, or in bed at 9pm with the screen at full
brightness. Glare beats ambience.

---

## Type

**Archivo** (Omnibus-Type, OFL 1.1), one variable file with both `wght` and
`wdth` axes, self-hosted as WOFF2 from `/public/fonts`. Nothing from a CDN.

Two registers, one voice:

- `.type-display` — `font-stretch: 118%`, weight 700, line-height 0.94,
  `text-wrap: balance`. The signboard register. Headings and the status plate.
- `.type-label` — `font-stretch: 108%`, weight 600, 11px, `0.14em` tracking,
  uppercase. Section labels and small state text. **Never a form label.**
- `.type-field-label` — 14px, weight 600, normal case, no tracking. Every input
  on the appointment form. The signboard micro-register is unreadable as a
  field label on the one surface someone fills in one-handed under stress.
- Body — the normal width at 15–17px. Deliberately unremarkable under a
  nine-field form.

### Heading line budget

Enforced by measure per breakpoint (`.h-budget`, `.h-budget-loose`), never by a
hard-coded `<br>`, which cannot be correct at three widths at once.

| Width | Measure | Budget |
|---|---|---|
| < 48rem | 17ch | at most 3 lines |
| ≥ 48rem | 24ch | at most 2 lines |
| ≥ 80rem | 30ch | 1–2 lines |

**`text-wrap: nowrap` is banned on headings.** It keeps a heading on one line by
letting the text spill out of its own box, which does not shrink the element but
does make the whole document scroll sideways. This was a real defect during the
build; the overflow audit now catches it.

The corollary: **hero headlines must be short.** A display-scale headline inside
a two-column hero has roughly fifteen characters of line. "Klinik hewan di
Denpasar" fits. Anything longer lands on four lines at 1440. Keywords belong in
the title tag and the lead paragraph, where length is free.

---

## Components

- **`.plate`** — the atom. Square corners, one hairline. Never rounded. The
  focus ring is the single exception, at 2px.
- **`.plate-ink`** — ink fill, paper text. Strong secondary action.
- **`.plate-accent`** — accent fill, ink text, **ink hairline**. The one action
  that matters on a given surface.
- **`.plate-interactive`** — paper fill, `--color-rule-strong` border. Buttons,
  fields, options. Anything you can click uses this, not `.plate`.
- **`.gate`** — the split-gate spine. Two poleng strips flanking a section.
  Applied to the hero.

Three button weights exist (`primary`, `solid`, `outline`) and no others. A
stock component dropped into this vocabulary is a lapse; the listbox, calendar,
slot grid, and checkboxes are all built in plate language.

**Rows of plates use `flex-auto`, never `flex-1`.** `flex-1` sets the basis to
zero and splits the row evenly regardless of label width, which squeezed the
phone number 9px out of its own button at 1440. `flex-auto` still fills the row
but bases each plate on its own content, so no label is ever narrower than the
text inside it.

Icons are drawn inline at the site's own line weight (2px, round caps) rather
than pulled from an icon set.

---

## Motion

Knobs for this project: **DESIGN_VARIANCE 2 · MOTION_INTENSITY 2 · VISUAL_DENSITY 3.**

Motion is deliberately thin. Someone whose cat is being sick should not wait on
a stagger before they can read a phone number.

- **Two loaders, one gate.** A cold load parts the gate (460ms). A page
  transition closes it, swaps the content, scrolls to top, and parts it again
  (280ms close / 340ms open).
- **Sequence, always:** page closes → content changes → scroll to top → page
  opens.
- **Never trust `requestAnimationFrame` alone.** rAF stops in a backgrounded
  tab. Every wait races a `setTimeout` against rAF; the timeout is the
  guarantee, rAF is the smooth path.
- **The curtain has a watchdog.** If a navigation does not land within
  `CLOSE_MS + 1200ms`, the gate opens anyway. A stuck black panel is the worst
  possible failure here — it hides the phone number from someone panicking.
- **`Reveal`** is a single 500ms fade-and-rise, once. It is visible by default
  if the observer never fires, has a 1200ms safety timer, and is skipped
  entirely under `prefers-reduced-motion`.
- Never place `Reveal` inside an `overflow-hidden` ancestor — the intersection
  ratio stays 0 and the content never appears.
- **The hero artwork does not scale on scroll.** A zooming hero is a stunt that
  costs paint time and gives this visitor nothing.

Lenis smooth scrolling runs on **pointer-driven desktop widths only**. It is off
on tablet and phone, off under reduced motion, off on `/admin`, and paused
whenever an overlay is open (reference-counted, so two overlapping overlays
cannot leave scrolling stuck off).

---

## Layers

One z-index scale, as tokens in `globals.css`. **Zero raw z-index values in the
codebase.** The order is load-bearing:

```
--z-content 1 < --z-header 100 < --z-fab 200 < --z-mobile-menu 300
  < --z-overlay 400 < --z-cookie 500 < --z-skip 600
```

- The floating rail sits below the mobile menu, so the menu can never be
  punched through.
- The cookie banner sits above the rail, and while it is visible it raises
  `--fab-reserve` so the two never overlap.
- Calendar and listbox panels are **portalled to `<body>`** so no ancestor's
  `overflow` can clip them.
- Every page carries `.page-bottom-gap`, reserving `--fab-reserve` plus the
  safe-area inset, so the rail always floats over empty space and never covers
  the last control. Only the rail's buttons accept pointer events.

---

## Imagery

Every graphic is a deterministic generated SVG (`npm run gen:art`).

- **Two orientations only: 16:9 and 1:1.** Locked in the `Art` component, not at
  call sites. The wrapper reserves space with `aspect-ratio` before load.
  If a composition seems to want another ratio, change the composition.
- **No grain, no noise, no speckle, anywhere.** Depth comes from flat fields,
  hairlines, arcs, and contrast.
- Each service has its own composition so cards are distinguishable at a glance
  without reading the label.
- **The dog glyph has rounded, hanging ears; the cat has triangles.** If the dog
  is drawn with triangular ears the two read identically — this was a real
  defect, caught and fixed.
- Nothing imitates a photograph of a real clinic, animal, or person.
- **No animal is ever drawn sick, injured, bleeding, or on a drip.**

---

## Accessibility

- Every shipped pair verified by script, not by eye.
- **State is never colour alone.** Open/closed/full/past all carry a text label;
  open and closed also differ in *shape* (solid disc vs. crossed ring).
- The listbox implements the real ARIA pattern: arrows, Home/End, type-ahead,
  Enter/Space, Escape, focus returned to the trigger.
- The calendar is a keyboard grid; unavailable dates are struck through and
  labelled, not just dimmed.
- The honeypot uses `clip-path`, not `left:-9999px` — a negative offset escapes
  any ancestor that is not positioned.

---

## One deliberate departure from the craft floor

The finish review flagged the section label above each headline as a "kicker",
which the Impeccable craft floor refuses. It stays, because the client brief
specifies the section anatomy directly: *judul section, headline, deskripsi
singkat, CTA*, in that order, via one shared `SectionHeader`. A brief-pinned
requirement outranks the generic floor. What did change is its colour — it no
longer spends the accent.

---

## Content rules that constrain design

These are not editorial preferences; they shape what the layout can contain.

- **No prices, ever.** No "mulai dari". Service cards therefore end with a CTA
  rather than a price, and there is no pricing table to design.
- **No ratings, reviews, testimonials, patient counts, or founding year.** Six
  of the eight reference sites use a review block. This one cannot, so social
  proof is simply absent rather than faked.
- **No vet names, degrees, registration numbers, or certifications.** The team
  block is unnamed role cards, explicitly marked as awaiting confirmation.
- **No medical advice, dosages, or schedules.** Service copy states what is done
  and when people usually need it, then stops.
- **No facility claims** until `FEATURES.facilitiesConfirmed` is true.
- **Unconfirmed services render nowhere** — not dimmed, not "coming soon",
  absent.
- **Emergency lane is behind a flag, defaulted off**, and leaves no residue when
  off. There is no emergency route to reach by URL, because the lane only ever
  exists inline.
- **When operating hours are not configured, the status indicator disappears
  entirely** and the booking form falls back to WhatsApp. A silent indicator is
  safe; a wrong one is not.
