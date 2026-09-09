# Santi Vet Care

First website for **Santi Vet Care**, a veterinary practice in Ubung Kaja, North
Denpasar, Bali.

**Live:** https://santi-vet-care.onyxcreative.asia
**Vercel:** https://santi-vet-care.vercel.app

> A note on the alias, because the first attempt looked like a failure and was
> not. Adding `santi-vet-care.vercel.app` as an explicit *project domain*
> returned HTTP 409 ("already assigned to another project") — Vercel had already
> reserved it as this project's own automatic alias, so it could not be added a
> second time. It resolves to this site. `santivetcare.vercel.app` was claimed
> during that attempt and is kept as a secondary alias; Vercel's team-suffixed
> `santi-vet-care-onyx-creative-asia.vercel.app` also resolves.
>
> None of those is the canonical URL. Every canonical tag, Open Graph URL,
> sitemap entry, robots directive and structured-data field points at
> `santi-vet-care.onyxcreative.asia`, which is the final domain.
>
> Deployment Protection is **off** (`ssoProtection: null`), verified through the
> API after switching it off in the dashboard. It cannot be disabled through
> Composio — see the note at the end of this file.

---

## What was verified before anything was written

The brief asked for the clinic's existing web presence to be re-checked before
claiming they had none. Checked on **8 September 2026**:

| Check | Result |
|---|---|
| Google Maps listing | No Website button. The listing offers "Tambahkan situs web" (Add a website), which only appears when none is attached. |
| Google search for the business name | No first-party site. Only directory aggregators (idalamat, cybo) and unrelated pages. |
| Instagram [@santivetcare](https://www.instagram.com/santivetcare/) bio | No link in bio. |
| Facebook | No page found for this business. |

They had no website. This is the first one.

---

## Where every fact on the site came from

Nothing on this site was invented. Each item below is traceable to something
the clinic publishes about itself. Third-party directories were **not** used as
a source, even where they had the data.

| Fact | Value | Source |
|---|---|---|
| Name | Santi Vet Care | Google Business Profile |
| Tagline | "Praktek Dokter Hewan Bersama" | Read off the clinic's own logo on Instagram |
| Address | Jl. Sari Dana IV No. 20, Ubung Kaja, Kec. Denpasar Utara, Kota Denpasar, Bali 80116 | Google Business Profile |
| Coordinates | −8.6271081, 115.1915156 | The clinic's Google Maps place URL |
| Plus Code | 95FR+5J Ubung Kaja | Google Business Profile |
| Phone / WhatsApp | 0812-3707-2009 | Google Business Profile (matches the number in the brief) |
| Instagram | @santivetcare | Verified live |
| Opening hours | Mon–Sat 09:00–17:00 WITA, Sunday closed | Google Business Profile — see the conflict below |
| Logo / site icon | The clinic's own Instagram profile image | Instagram, background removed |

### ⚠️ Unresolved conflict — needs the clinic to confirm

The clinic publishes two different sets of hours:

- **Google Business Profile:** Mon–Sat 09:00–17:00, **Sunday closed**
- **Instagram bio:** Mon–Sat 09:00–**20:00** WITA, **Sunday open**

The Google Business Profile values are live on the site, chosen deliberately:
being wrong in the "closes earlier" direction costs someone a wasted early
trip. Being wrong the other way sends someone with a sick animal to a clinic
that has already shut. The conflict is also recorded as a comment directly
above the hours in `src/data/clinic.ts`.

**Please confirm the real hours and update that one block.**

### Deliberately left empty

These are config slots, not oversights. Each is one word away from being
switched on once the clinic confirms it:

- **Emergency / after-hours service** — `FEATURES.emergency`, ships `false`
- **Facilities** (USG, X-ray, laboratory, operating room, hospitalisation) — `FEATURES.facilitiesConfirmed`, ships `false`, list empty
- **Species beyond dogs and cats** — `FEATURES.otherSpeciesConfirmed`, ships `false`
- **Street landmarks** on the Lokasi page — `CLINIC.landmarks`, ships `[]`
- **Veterinarian names, degrees, STRV/SIP numbers, certifications** — none anywhere on the site. The Kontak page shows unnamed role cards marked as awaiting confirmation.
- **Five of the eight services** (sterilisation, surgery, grooming, hospitalisation, boarding) — `enabled: false`. They imply facilities nobody has confirmed, so they render nowhere at all.
- **Prices** — there are none, anywhere, in any form. No "mulai dari".

There is also no rating, no review count, no patient count, no founding year,
no testimonial, and no medical advice on this site.

---

## Reference sites studied before designing

Eight real veterinary practice sites, mixed local and international, read for
structure rather than style. What each one contributed:

| Site | What was taken from it |
|---|---|
| [Small Door Veterinary](https://www.smalldoorvet.com/) (NYC) | The header carries a phone number *and* a booking CTA side by side, not one or the other — contact is never one click deep. |
| [Bond Vet](https://bondvet.com/) (US) | Services presented as four icon-led cards with one short line each, no expandable accordions to fight on a phone. |
| [Modern Animal](https://modernanimal.com/) (US) | Nine service categories at equal visual weight with "learn more" rather than nested detail — scanning beats reading for this audience. |
| [Bali Veterinary Clinic](https://balivetclinic.com/) | Contact numbers appear *above* service detail, and each location gets its own "Get Directions" link. Both patterns are used here. |
| [Sunset Vet Bali](https://www.sunsetvetbali.com/) | Booking links live in the top navigation, not only in the page body; a "common issues" list gives worried owners vocabulary. |
| [Klinik Hewan Kita](https://klinikhewankita.id/) (Jakarta) | The Indonesian pattern: green WhatsApp buttons are *the* conversion mechanism, repeated at every decision point. |
| [Klinik Hewan Graha Raya](https://klinikhewangraharaya.id/) (Tangerang) | Dual hero CTAs, one calm and one urgent, both going to WhatsApp — the shape our emergency lane borrows when the flag is on. |
| [Hewania](https://hewania.com/) (Jakarta) | Per-location address blocks each with their own WhatsApp link, and a services grid grouped by kind. |

**What the pattern showed, and what we did with it.** All eight put contact
above the fold, present services as a scannable grid, place location with a
directions button, and end with a CTA. None of the Indonesian ones has a real
booking form — WhatsApp is the whole funnel. So this site keeps the proven
structure and adds the one thing missing locally: a structured appointment form
whose output *is* a WhatsApp message. The differentiator is execution, not
layout novelty.

**Two patterns deliberately refused:** the review/rating block that six of the
eight sites use (we have no permission to quote the clinic's reviews), and the
health-article section (we will not write veterinary content).

---

## Design decisions

### Direction

Built on the **candi bentar** — the Balinese split gate — and the paired-opposite
grammar of **saput poleng**. The reasoning is in [`DIRECTION.md`](DIRECTION.md),
including the alternatives that were weighed and why they lost.

Short version: the single most important fact on this site is a binary —
**Buka / Tutup** — and poleng is a visual system built entirely on paired
opposites. A candi bentar is a threshold that is either open to you or not. The
world is achromatic, which leaves exactly one accent colour to carry state and
action, which is the right economy for someone reading in a panic.

The ritual object is not printed as literal checkered cloth. What carries over
is its grammar: paired opposition, the modular square, an achromatic ground with
one signal colour, and the split-and-part threshold form.

### Accent colour — and why this one

`--color-accent: #f0a11a`, a **gemitir (marigold) yellow-orange**.

- **Why this hue.** Gemitir is the flower in the *canang sari* offering set out
  on Balinese doorsteps every single morning. It is the local colour of daily
  care and attention, and it sits beside poleng constantly in real life, since
  offerings are placed at poleng-wrapped gates. It is warm and alert without
  being an emergency red, which matters in a category where frightening the
  reader is both easy and cheap.
- **Why not the obvious choices.** Teal and mint are the pet-care category
  default. Blue is generic medical. A green cross is regulated pharmacy
  iconography and would imply a credential the clinic has not claimed.
- **No overlap with other clients in Denpasar.** Bali Veterinary Clinic uses
  blue/teal; Sunset Vet Bali uses orange/teal with a photographic treatment.
  This palette is achromatic-plus-marigold with zero photography, and reads as
  nothing else in the city.

Accessibility is not assumed — `npm run audit:contrast` parses the token block
in `src/app/globals.css` and checks every shipped pair. **16/16 required pairs
pass WCAG AA.** Two combinations are recorded as *forbidden* so a future token
tweak cannot quietly make them tempting. Re-run it whenever the accent changes.

### Typography — and why not Neue Montreal

**Archivo** (Omnibus-Type, SIL Open Font License 1.1), one variable file
carrying both weight and width axes, self-hosted as WOFF2 from `/public/fonts`.
Nothing is pulled from a third-party CDN.

- Archivo was drawn for **high-performance print and signage** — headlines and
  small text that must survive being read fast and at a distance. That is
  literally this site's job.
- The `wdth` axis gives an **expanded** cut for the display plates and a normal
  cut for body copy, so the whole site speaks with one voice in two registers.
  That is what makes the status plate read like an enamel signboard without
  introducing a second typeface.
- It is a workhorse under a form. The appointment page is nine fields long and
  needs a face that is boring at 17px, which Archivo is.
- Neue Montreal is a fine face, but it is neutral-Swiss where this needed
  signage authority, has no width axis to exploit, and its licence would need
  checking for web use. Archivo is OFL, which permits web embedding outright.

### Image rules

Every graphic is a **deterministic generated SVG** — `npm run gen:art` rebuilds
all twelve byte-for-byte from `scripts/generate-art.mjs`. No stock, no picsum.

- **Two orientations only, 16:9 and 1:1.** Locked in the `Art` component, not
  at call sites, so a third ratio cannot creep in. The wrapper reserves its
  space with `aspect-ratio` before the file loads, so nothing shifts.
- **No grain, no noise, no speckle.** Depth comes from flat fields, hairlines,
  arcs and contrast.
- **Each service has its own composition** so cards can be told apart at a
  glance without reading the label.
- Nothing pretends to be a photo of a real clinic, a real animal, or a person.
- **No animal is ever drawn sick, injured, bleeding, or on a drip.** The reader
  is frightened already.

The OG card (`scripts/generate-og.py`) is the clinic's wordmark on the site's
own gate field — 1200×675, exactly 16:9. The site icon is the clinic's real
Instagram logo with its background removed to full transparency
(`scripts/make-icon.py`).

> **Ask the clinic for the original logo file.** Instagram only serves the
> avatar at 150×150, which is thin for a 180px touch icon. Drop the original
> into `_research/` and re-run `python scripts/make-icon.py`.

---

## What is real and what is still local

Be clear about this, because the admin page looks more finished than it is.

**Real:**
- Every page, all copy, all artwork, the full responsive layout
- Open/closed status, computed from a real instant in the clinic's timezone
- Slot generation, past-slot exclusion, minimum booking lead time
- Client **and** server validation of the appointment form (`/api/bookings`),
  including a re-check of the date and time against the server's own clock
- The WhatsApp message — this is the part that actually reaches the clinic

**Local only:**
- **Appointments are stored in the visitor's own browser**, nothing else. Two
  people on two phones cannot see each other's bookings, so the same slot can
  be double-booked. Clearing browser data erases everything. The clinic cannot
  see any of it.
- The **admin board at `/admin` is a demo**, labelled as such at the top of the
  page. It reads the same browser storage. There is no login. It is excluded
  from the sitemap and marked `noindex`.
- `/api/bookings` validates and returns. It does not persist.

**To make it real:** implement the six methods of `remoteStore` in
`src/lib/bookings.ts` and change the single export line at the bottom of that
file. No page, form, or component needs to change — everything talks to the
`BookingStore` interface, never to storage directly. Add the write inside
`/api/bookings` in a transaction that re-reads slot capacity, so two
simultaneous submissions cannot both win. **Authentication is mandatory before
`/admin` sees real patient data.**

### Payments

There is no payment gateway and no card details are collected anywhere.
Payment is settled at the clinic. This can be added later: implement the
`PaymentAdapter` interface in `src/lib/bookings.ts` — it currently ships as
`noPaymentAdapter`, which returns `null` to mean "settled at the clinic".

---

## Editing the site without touching code

Everything a non-developer needs is in **`src/data/clinic.ts`**, one commented
file. Two rules, both stated at the top of it:

1. Text lives between `"quotes"` — change what is inside them, keep the quotes.
2. `true` shows something, `false` hides it. Lowercase, no quotes.

Lines marked `// ❓ BELUM DIKONFIRMASI` are deliberately switched off until the
clinic confirms them.

The single most consequential setting:

```ts
// src/data/clinic.ts
export const HOURS: WeekHours | null = { ... }
```

Set it to `null` and the open/closed indicator disappears from the entire site
and the appointment form falls back to WhatsApp. A silent indicator is safe; a
wrong one is not.

---

## Running it

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Regenerates artwork, then builds |
| `npm run gen:art` | Rebuilds all twelve SVGs deterministically |
| `npm run audit:contrast` | WCAG check on every shipped colour pair |
| `python scripts/generate-og.py` | Rebuilds the Open Graph card |
| `python scripts/make-icon.py` | Rebuilds the site icons from the clinic logo |

`scripts/overflow-audit.js` is a browser snippet — paste it into the console on
any route to list horizontal-overflow offenders. The pass condition is zero.

### Testing the clock without changing your system time

The open/closed indicator and past-slot logic read through `src/lib/now.ts`, so
a fake clock can be injected two ways, client-side only:

```
?now=2026-09-13T10:00:00+08:00        # Sunday — clinic closed
```
```js
window.__SVC_NOW__ = "2026-09-09T21:00:00+08:00"   // after hours
```

When a fake clock is active the status plate says so, so nobody mistakes a test
for reality. Neither channel is honoured on the server, so a shared link can
never bake a wrong status into cached HTML.

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zod ·
Lenis · Motion.

`images.unoptimized = true` is set in `next.config.ts` **on purpose**. The
Vercel Image Optimization quota on this account is exhausted; with the
optimizer on, every image returns 402 and production renders blank. Leave it.

### Componentry

Components were reviewed at [componentry.dev](https://componentry.dev/docs).
Most of that catalogue — dither, ASCII, matrix rain, WebGL liquid, particle
typography, fisheye grids — is expressive work aimed at portfolio and agency
sites. On a clinic page read by someone whose animal is unwell, those effects
cost paint time and attention and return nothing, so they were dropped rather
than forced in, as the brief allows. What survived is the *idea* of a
character-level text reveal, reimplemented in the site's own plate vocabulary
with a single `aria-label` on the parent and `aria-hidden` on the pieces.

---

## Accessibility notes

- Every shipped colour pair verified against WCAG AA by script, not by eye.
- Open, closed, full, and past states all carry a **text label**, never colour
  alone; open and closed also differ in *shape*, not just fill.
- Custom listbox implements the full ARIA pattern: arrow keys, Home/End,
  type-ahead, Enter/Space, Escape, and focus returned to the trigger.
- The calendar is a keyboard grid (arrows, PageUp/PageDown, Home/End, Enter,
  Escape) and is portalled to `<body>` so no ancestor's overflow can clip it.
- One z-index scale as tokens in `globals.css`; zero raw z-index values in the
  codebase.
- The floating action rail reserves space beneath page content so it never
  covers the last control, and only its buttons accept pointer events.
- Motion respects `prefers-reduced-motion`. Content is visible by default if a
  reveal observer never fires.

---

## Licences

- **Archivo** — SIL Open Font License 1.1 (Omnibus-Type). Web embedding
  permitted; the WOFF2 files in `public/fonts` are subsets served from this
  origin.
- Artwork in `public/art` is generated by this repository's own scripts.
- The Santi Vet Care name and logo belong to the clinic.


---

---

## Verified on production, not on localhost

Everything below was checked against https://santi-vet-care.onyxcreative.asia
after the final deploy.

| Check | Result |
|---|---|
| All routes | 7 public pages + `/admin` + sitemap + robots + og.png all 200; an unknown path returns 404 |
| HTTPS on the custom subdomain | Valid certificate, 200 |
| Horizontal overflow at 375 / 768 / 1440 | **Zero offenders** across every route, including the admin table |
| Broken images / failed requests | None. Service artwork loads and each card is distinguishable at a glance |
| Hamburger menu | Opens, closes, traps scroll, lists all five pages, layers above the floating rail |
| Open/closed indicator | Verified in all three states by injecting a fake clock: open (Wed 10:00), closed with next opening (Wed 21:00), and Sunday. With `HOURS` set to `null` the indicator disappears entirely and the booking form falls back to WhatsApp |
| Appointment flow | Picked a service from the services page, confirmed it pre-filled, booked a slot, confirmed the slot then read **Penuh** and was unselectable, and confirmed past slots read **Lewat** |
| WhatsApp message | Contains owner name, phone, species, pet name, age, service, ticked symptoms, notes, date, time, and the exact source URL including its query string |
| Emergency flag | Switched on: the lane appears on the appointment and contact pages. Switched off: **zero** occurrences of the block in any rendered page, and no route exists to reach it |
| Admin demo | Slot blocking writes and clears; Reset Demo asks for confirmation, then empties bookings and blocks and shows the empty state |
| Copy audit | Grep across all eight live pages for prices, ratings, review counts, vet names, credentials, facilities, 24-hour claims, cure words and superlatives: **zero hits** |
| Typographic tells | Zero em-dashes and zero en-dashes in any visible text |
| Contrast | 16/16 required token pairs pass WCAG AA |
| Structured data | `VeterinaryCare` with full address, geo, and Mon-Sat opening hours; no rating, price, or staff claims |
| `/admin` | `noindex, nofollow, nocache`, disallowed in robots.txt, absent from the sitemap |
| Site icon | Transparent background confirmed on the deployed 512px file (all four corners alpha 0) |

### Not verified

Motion has been checked through the DOM, timings, and component state rather
than watched frame by frame. The in-app browser pane did not composite reliably
enough to judge the gate transition by eye. What that means concretely: the
transition sequence, its watchdog, the scroll reset, and the reduced-motion path
were all confirmed programmatically, and page-to-page navigation was exercised
repeatedly on the live site, but nobody has yet *watched* the curtain part.
Worth thirty seconds of your own eyes before you show the client.

---

## Two deployment gotchas worth writing down

**Vercel Deployment Protection cannot be turned off through Composio.**
`VERCEL_UPDATE_PROJECT2` accepts `ssoProtection: null`, reports success, and
changes nothing — the null is stripped before it reaches Vercel, and the project
still reads `all_except_custom_domains`. It has to be switched off in the
dashboard, under Settings → Deployment Protection, which asks you to type
`disable vercel authentication` to confirm. On a hobby plan the protection is
not actually enforced, so a 200 response is not proof it is off; check the
setting.

**`images.unoptimized = true` is load-bearing.** The Image Optimization quota on
this account is exhausted. With the optimizer on, every image returns 402 and
production renders blank. Do not remove it from `next.config.ts`.
