# PRODUCT.md — Santi Vet Care

> Written from the client brief (2026-09-08). Items marked **[ASSUMED]** were inferred
> from the brief, not confirmed by the clinic. Items marked **[VERIFIED]** were checked
> against a source the clinic publishes itself.

## What this is
A first website for Santi Vet Care, a veterinary practice in North Denpasar, Bali.
Before this, the clinic's only public footprint was a Google Business Profile and an
Instagram account. **[VERIFIED 2026-09-08]** — the Google Maps listing offers
"Tambahkan situs web" (Add a website), i.e. no website is attached.

## Who it is for
Pet owners in and around Denpasar who need a vet **now**. The defining trait of this
audience is state, not demographics: a large share arrive mid-worry, one-handed, on a
phone, with a sick animal in the other arm. A smaller share are planning ahead
(vaccination, sterilisation, grooming, boarding).

## What success looks like
Seconds from landing to knowing (a) is it open right now, (b) where is it, (c) how do I
reach a human. Every other metric is downstream of that. Beauty that costs a second of
that budget is a defect.

## Primary job
Get the visitor to a human via WhatsApp or phone, or into a structured appointment
request that arrives at the clinic already answering the questions the clinic would
otherwise have to ask back.

## Hard constraints (from brief — these are not preferences)
- Medical category. Nothing invented: no prices, no vet names, no credentials, no
  facilities, no treated-species list beyond dogs and cats, no ratings, no testimonials,
  no patient counts, no founding year, no medical advice, no dosages, no vaccine
  schedules, no outcome promises.
- Emergency / 24h service is a config flag, default **off**. When off, zero residue.
- No payment gateway. No real backend yet — local persistence behind an adapter.
- Every image is a deterministic generated SVG, 16:9 or 1:1 only.

## Truth inventory
| Fact | Value | Source |
|---|---|---|
| Name | Santi Vet Care | Google Business Profile, Instagram |
| Tagline | "Praktek Dokter Hewan Bersama" | the clinic's own Instagram logo |
| Address | Jl. Sari Dana IV No. 20, Ubung Kaja, Denpasar Utara, Kota Denpasar, Bali 80116 | Google Business Profile |
| Coordinates | -8.6271081, 115.1915156 | Google Maps place URL |
| Plus Code | 95FR+5J Ubung Kaja, Kota Denpasar | Google Business Profile |
| Phone / WhatsApp | 0812-3707-2009 | Google Business Profile (matches brief) |
| Instagram | @santivetcare | brief, verified live |
| Hours | Mon-Sat 09:00-17:00 WITA, Sun closed | Google Business Profile |
| Species | dogs and cats | **[ASSUMED]** per brief; everything else is a config slot |

### Known conflict — carried, not resolved
The Instagram bio states Mon-Sat 09:00-20:00 and open Sunday. The Google Business
Profile states Mon-Sat 09:00-17:00 and closed Sunday. Client chose the Google Business
Profile values on 2026-09-08 because being wrong in the "closed" direction is the safer
failure. **Still needs clinic confirmation.**

## Modes by surface
- Home, Layanan, Lokasi, Kontak → **Persuade** (visitor decides and acts)
- Janji Temu → **Operate** (visitor completes a task under stress)
- Admin → **Operate** (demo only)
- Privacy / Terms → **Read**

## Design knobs (client-selected 2026-09-08)
DESIGN_VARIANCE 2 · MOTION_INTENSITY 2 · VISUAL_DENSITY 3
