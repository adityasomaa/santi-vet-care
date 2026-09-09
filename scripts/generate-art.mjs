#!/usr/bin/env node
/* ===========================================================================
 * Deterministic placeholder artwork generator.
 *
 *   npm run gen:art     ->  public/art/*.svg
 *
 * Rules this generator obeys, from the brief:
 *
 *  - Deterministic. Same seed, same file, byte for byte. Delete public/art and
 *    re-run to reproduce every asset. No stock imagery, no picsum.
 *  - Two orientations only: 16:9 and 1:1. Nothing else, ever. The aspect is
 *    also locked at the component level so the wrapper holds its space before
 *    the file loads and the layout cannot jump.
 *  - No grain, no noise, no speckle texture. Depth comes from flat fields,
 *    hairlines, arcs, and contrast.
 *  - Nothing pretends to be a photograph of a real clinic, a real animal, or a
 *    person's face.
 *  - No animal is ever drawn sick, injured, bleeding, or on a drip. Someone
 *    opening this site is frightened already.
 *
 * The shape language is the site's own world: the candi bentar split gate, the
 * modular square, calm arcs, and very simplified dog and cat silhouettes.
 * ========================================================================= */

import { mkdirSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "art");

/* Tokens mirror src/app/globals.css. Kept as literals so the generator has no
   build-time dependency on the stylesheet. */
const C = {
  paper: "#fafaf8",
  paper2: "#efefea",
  paper3: "#e4e4dd",
  ink: "#141414",
  ink3: "#63635c",
  rule: "#d8d8d1",
  accent: "#f0a11a",
  accentDeep: "#7d4406",
  accentSoft: "#fdf0d9",
};

/* ---------------------------------------------------- deterministic random */
function rng(seedText) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
}
const n = (v) => Math.round(v * 1000) / 1000;

/* --------------------------------------------------------------- primitives */

/** The candi bentar: one form cleaved in two, with a gap you pass through. */
function gate(cx, cy, w, h, gap, fill, opacity = 1) {
  const half = (w - gap) / 2;
  const bottom = cy + h / 2;
  const base = h * 0.13; // the plinth both leaves stand on

  /* Each leaf is a tiered pylon: a wide plinth, then setbacks stepping in and
     up along the outer edge, with a straight inner edge facing the gap. That
     stepped profile is what makes a candi bentar read as one form cleaved
     down the middle rather than as two rounded shapes. */
  const STEPS = [
    [1.0, 0.0],
    [0.9, 0.22],
    [0.76, 0.44],
    [0.6, 0.63],
    [0.44, 0.79],
    [0.3, 0.91],
  ];

  const leaf = (xInner, dir) => {
    const xOut = (wf) => xInner + dir * half * wf;
    const yAt = (hf) => bottom - base - (h - base) * hf;
    const d = [`M ${n(xInner)} ${n(bottom)}`, `L ${n(xOut(1))} ${n(bottom)}`];
    for (let i = 0; i < STEPS.length; i++) {
      const [wf, hf] = STEPS[i];
      d.push(`L ${n(xOut(wf))} ${n(yAt(hf))}`); // riser
      const next = STEPS[i + 1];
      if (next) d.push(`L ${n(xOut(next[0]))} ${n(yAt(hf))}`); // tread
    }
    d.push(`L ${n(xInner)} ${n(yAt(STEPS[STEPS.length - 1][1]))}`);
    d.push("Z");
    return d.join(" ");
  };

  return (
    `<path d="${leaf(cx - gap / 2, -1)}" fill="${fill}" opacity="${opacity}"/>` +
    `<path d="${leaf(cx + gap / 2, 1)}" fill="${fill}" opacity="${opacity}"/>`
  );
}

/** Poleng grammar: alternating modular squares, never printed as literal
 *  ritual cloth — used as a rhythm strip. */
function polengStrip(x, y, w, h, unit, fill, opacity) {
  let out = "";
  const cols = Math.max(1, Math.round(w / unit));
  const rows = Math.max(1, Math.round(h / unit));
  const cw = w / cols;
  const ch = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2) continue;
      out += `<rect x="${n(x + c * cw)}" y="${n(y + r * ch)}" width="${n(cw)}" height="${n(ch)}" fill="${fill}" opacity="${opacity}"/>`;
    }
  }
  return out;
}

/** A dog's head, reduced to two ears and a muzzle line. Calm, upright, well. */
function dogGlyph(cx, cy, s, fill) {
  return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(s / 100)})" fill="${fill}">
    <path d="M-42 -18 q-6 -40 10 -46 q14 -5 24 26 Z"/>
    <path d="M42 -18 q6 -40 -10 -46 q-14 -5 -24 26 Z"/>
    <path d="M0 -34 q40 0 40 34 q0 38 -40 44 q-40 -6 -40 -44 q0 -34 40 -34 Z"/>
  </g>`;
}

/** A cat's head: two triangles and a round jaw. */
function catGlyph(cx, cy, s, fill) {
  return `<g transform="translate(${n(cx)} ${n(cy)}) scale(${n(s / 100)})" fill="${fill}">
    <path d="M-40 -20 L-34 -60 L-4 -36 Z"/>
    <path d="M40 -20 L34 -60 L4 -36 Z"/>
    <path d="M0 -38 q38 0 38 36 q0 36 -38 42 q-38 -6 -38 -42 q0 -36 38 -36 Z"/>
  </g>`;
}

function arcs(cx, cy, from, count, step, stroke, sw, opacity) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const r = from + i * step;
    out += `<path d="M ${n(cx - r)} ${n(cy)} a ${n(r)} ${n(r)} 0 0 1 ${n(r * 2)} 0" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
  }
  return out;
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true"><rect width="${w}" height="${h}" fill="${C.paper2}"/>${body}</svg>\n`;
}

/* ------------------------------------------------------------------ squares */
/* One composition per service so the cards can be told apart at a glance
   without reading the label (brief §43). */

const SQ = 600;

const squareArt = {
  "svc-pemeriksaan-umum": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     ${arcs(300, 372, 62, 4, 42, C.ink, 10, 0.16)}
     <circle cx="300" cy="372" r="26" fill="${C.accent}" stroke="${C.ink}" stroke-width="6"/>
     ${dogGlyph(300, 262, 132, C.ink)}`,

  "svc-konsultasi": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     <rect x="86" y="150" width="270" height="168" fill="${C.paper}" stroke="${C.ink}" stroke-width="7"/>
     <path d="M140 318 L140 386 L206 318 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
     <rect x="252" y="272" width="262" height="160" fill="${C.accent}" stroke="${C.ink}" stroke-width="7"/>
     <line x1="128" y1="200" x2="314" y2="200" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
     <line x1="128" y1="240" x2="266" y2="240" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
     <line x1="292" y1="322" x2="474" y2="322" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
     <line x1="292" y1="362" x2="410" y2="362" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>`,

  "svc-vaksinasi": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     ${gate(300, 322, 292, 300, 96, C.accent)}
     ${gate(300, 322, 292, 300, 96, C.ink, 0.0)}
     <path d="M300 176 L444 236 v128 q0 118 -144 158 q-144 -40 -144 -158 V236 Z" fill="none" stroke="${C.ink}" stroke-width="8"/>
     ${catGlyph(300, 360, 116, C.ink)}`,

  "svc-sterilisasi": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     <rect x="96" y="150" width="408" height="336" fill="${C.paper}" stroke="${C.ink}" stroke-width="7"/>
     <line x1="96" y1="222" x2="504" y2="222" stroke="${C.ink}" stroke-width="7"/>
     ${Array.from({ length: 12 }, (_, i) => {
       const col = i % 4;
       const row = Math.floor(i / 4);
       const x = 130 + col * 100;
       const y = 258 + row * 78;
       const marked = i === 6;
       return `<rect x="${x}" y="${y}" width="64" height="52" fill="${marked ? C.accent : C.paper3}" stroke="${C.ink}" stroke-width="${marked ? 7 : 0}"/>`;
     }).join("")}`,

  "svc-bedah": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     <circle cx="300" cy="330" r="164" fill="none" stroke="${C.ink}" stroke-width="7"/>
     <circle cx="300" cy="330" r="96" fill="${C.paper}" stroke="${C.ink}" stroke-width="7"/>
     <circle cx="300" cy="330" r="34" fill="${C.accent}" stroke="${C.ink}" stroke-width="7"/>
     <line x1="300" y1="106" x2="300" y2="200" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
     <line x1="300" y1="460" x2="300" y2="554" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
     <line x1="76" y1="330" x2="170" y2="330" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>
     <line x1="430" y1="330" x2="524" y2="330" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/>`,

  "svc-grooming": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     ${Array.from({ length: 7 }, (_, i) => {
       const x = 132 + i * 56;
       return `<path d="M${x} 188 v168 q0 30 -0 34" fill="none" stroke="${i === 3 ? C.accentDeep : C.ink}" stroke-width="9" stroke-linecap="round"/>`;
     }).join("")}
     <rect x="108" y="140" width="384" height="56" fill="${C.accent}" stroke="${C.ink}" stroke-width="7"/>
     ${arcs(300, 470, 54, 3, 38, C.ink, 9, 0.28)}`,

  "svc-rawat-inap": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     <path d="M300 132 L500 288 v212 H100 V288 Z" fill="${C.paper}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
     <rect x="196" y="352" width="208" height="148" fill="${C.accentSoft}" stroke="${C.ink}" stroke-width="7"/>
     ${catGlyph(300, 452, 96, C.ink)}
     <line x1="100" y1="500" x2="500" y2="500" stroke="${C.ink}" stroke-width="9"/>`,

  "svc-penitipan": () =>
    `${polengStrip(0, 0, SQ, 46, 46, C.ink, 0.07)}
     ${gate(300, 300, 348, 296, 118, C.ink, 0.14)}
     <path d="M156 430 h288 q-18 96 -144 96 q-126 0 -144 -96 Z" fill="${C.accent}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
     ${dogGlyph(300, 268, 118, C.ink)}`,
};

/* ------------------------------------------------------------------- 16 : 9 */

const W = 1600;
const H = 900;

const wideArt = {
  /* Hero: the split gate with a dog and a cat standing calmly on either side
     of the threshold. No scroll-zoom is applied to this in the page. */
  "hero-gate": () =>
    `<rect width="${W}" height="${H}" fill="${C.paper}"/>
     ${polengStrip(0, 0, W, 64, 64, C.ink, 0.05)}
     ${polengStrip(0, H - 64, W, 64, 64, C.ink, 0.05)}
     ${gate(800, 500, 760, 620, 260, C.accentSoft)}
     ${gate(800, 500, 760, 620, 260, C.ink, 0.0)}
     <path d="M800 190 v620" stroke="${C.rule}" stroke-width="3" stroke-dasharray="14 14"/>
     ${arcs(800, 690, 130, 4, 74, C.accentDeep, 6, 0.2)}
     ${dogGlyph(560, 560, 230, C.ink)}
     ${catGlyph(1040, 566, 216, C.ink)}
     <rect x="712" y="606" width="176" height="176" fill="${C.accent}" stroke="${C.ink}" stroke-width="8"/>
     <path d="M760 694 l30 32 l60 -66" fill="none" stroke="${C.ink}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`,

  /* Location: an abstract lane grid with one marked corner. Deliberately not a
     map of anywhere real — the real map is an embed on the Lokasi page. */
  "lokasi-lanes": () =>
    `<rect width="${W}" height="${H}" fill="${C.paper}"/>
     ${Array.from({ length: 9 }, (_, i) => {
       const y = 100 + i * 88;
       return `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.rule}" stroke-width="${i === 5 ? 10 : 3}"/>`;
     }).join("")}
     ${Array.from({ length: 12 }, (_, i) => {
       const x = 70 + i * 130;
       return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.rule}" stroke-width="${i === 7 ? 10 : 3}"/>`;
     }).join("")}
     <rect x="850" y="452" width="260" height="176" fill="${C.accentSoft}" stroke="${C.ink}" stroke-width="6"/>
     <path d="M980 300 q66 0 66 68 q0 58 -66 130 q-66 -72 -66 -130 q0 -68 66 -68 Z" fill="${C.accent}" stroke="${C.ink}" stroke-width="8" stroke-linejoin="round"/>
     <circle cx="980" cy="368" r="24" fill="${C.ink}"/>`,

  /* Appointment: a slot board, one slot taken. */
  "janji-slots": () =>
    `<rect width="${W}" height="${H}" fill="${C.paper}"/>
     ${polengStrip(0, 0, W, 56, 56, C.ink, 0.05)}
     ${Array.from({ length: 24 }, (_, i) => {
       const col = i % 6;
       const row = Math.floor(i / 6);
       const x = 180 + col * 210;
       const y = 200 + row * 148;
       const taken = i === 9;
       const past = i < 4;
       return (
         `<rect x="${x}" y="${y}" width="176" height="112" fill="${taken ? C.accent : past ? C.paper2 : C.paper}" stroke="${past ? C.rule : C.ink}" stroke-width="${taken ? 8 : 5}"/>` +
         (past
           ? `<line x1="${x + 30}" y1="${y + 56}" x2="${x + 146}" y2="${y + 56}" stroke="${C.ink3}" stroke-width="6"/>`
           : `<line x1="${x + 30}" y1="${y + 56}" x2="${x + 108}" y2="${y + 56}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`)
       );
     }).join("")}`,

  /* Open graph card. The wordmark is drawn as type by the OG route; this is
     the field it sits on. */
  "og-field": () =>
    `<rect width="${W}" height="${H}" fill="${C.paper}"/>
     ${polengStrip(0, 0, W, 72, 72, C.ink, 0.06)}
     ${polengStrip(0, H - 72, W, 72, 72, C.ink, 0.06)}
     ${gate(1280, 470, 460, 470, 150, C.accentSoft)}
     ${dogGlyph(1178, 500, 168, C.ink)}
     ${catGlyph(1388, 506, 158, C.ink)}`,
};

/* ------------------------------------------------------------------- write */

mkdirSync(OUT, { recursive: true });
if (existsSync(OUT)) {
  for (const f of readdirSync(OUT)) {
    if (f.endsWith(".svg")) unlinkSync(join(OUT, f));
  }
}

let count = 0;
for (const [name, make] of Object.entries(squareArt)) {
  // seeded for future variation; compositions above are hand-placed and stable
  rng(name);
  writeFileSync(join(OUT, `${name}.svg`), svg(SQ, SQ, make()), "utf8");
  count++;
}
for (const [name, make] of Object.entries(wideArt)) {
  rng(name);
  writeFileSync(join(OUT, `${name}.svg`), svg(W, H, make()), "utf8");
  count++;
}

console.log(`generated ${count} svg files into public/art`);
console.log(`  ${Object.keys(squareArt).length} square (1:1)`);
console.log(`  ${Object.keys(wideArt).length} wide (16:9)`);
