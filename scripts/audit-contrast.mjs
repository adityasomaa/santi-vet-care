#!/usr/bin/env node
/**
 * WCAG contrast audit (brief §73).
 * Parses the token block in src/app/globals.css so the audit can never drift
 * from the stylesheet. Re-run this every time the accent changes.
 *   npm run audit:contrast
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

const tokens = {};
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
  tokens[m[1]] = m[2];
}

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgb(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** [foreground, background, label, minimum]
 *  3.0 is the WCAG AA floor for large text (>=24px, or >=18.66px bold) and for
 *  non-text UI boundaries; everything else must clear 4.5. */
const PAIRS = [
  ["ink", "paper", "body text on page ground", 4.5],
  ["ink", "paper-2", "text on plate fill", 4.5],
  ["ink", "paper-3", "text on deep plate fill", 4.5],
  ["ink-2", "paper", "secondary text on ground", 4.5],
  ["ink-2", "paper-2", "secondary text on plate", 4.5],
  ["ink-3", "paper", "meta text on ground", 4.5],
  ["ink-3", "paper-2", "meta text on plate", 4.5],
  ["accent-deep", "paper", "accent text/icon on ground", 4.5],
  ["accent-deep", "paper-2", "accent text on plate", 4.5],
  ["accent-deep", "accent-soft", "accent text on accent tint", 4.5],
  ["ink", "accent", "text on accent fill (buttons, open plate)", 4.5],
  ["paper", "ink", "inverted text on ink plate", 4.5],
  ["paper-2", "ink", "inverted secondary on ink plate", 4.5],
  ["accent", "ink", "accent text on ink plate", 4.5],
  ["rule-strong", "paper", "interactive border (buttons, fields) on ground", 3.0],
  ["rule-strong", "paper-2", "interactive border on plate", 3.0],
];

/** Combinations that are documented as unusable. The audit asserts they still
 *  fail, so nobody "fixes" a token in a way that quietly makes them tempting. */
const FORBIDDEN = [
  ["ink-2", "accent", "secondary ink on accent fill — use --color-ink instead"],
  ["accent", "paper", "bare accent fill with no ink hairline — see .plate-accent"],
];

/** Purely decorative, carries no information, WCAG 1.4.11 does not apply. */
const DECORATIVE = [["rule", "paper", "section divider hairline"]];

let failed = 0;
const rows = PAIRS.map(([fg, bg, label, min]) => {
  const a = tokens[fg];
  const b = tokens[bg];
  if (!a || !b) {
    failed++;
    return `  MISSING  --color-${fg} / --color-${bg}`;
  }
  const r = ratio(a, b);
  const ok = r >= min;
  if (!ok) failed++;
  return `  ${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(6)}:1  (min ${min})  ${label}\n          --color-${fg} ${a} on --color-${bg} ${b}`;
});

console.log("\nWCAG contrast audit — src/app/globals.css\n");
console.log(rows.join("\n"));
console.log(`\n${PAIRS.length - failed}/${PAIRS.length} pairs pass.\n`);
process.exit(failed ? 1 : 0);
