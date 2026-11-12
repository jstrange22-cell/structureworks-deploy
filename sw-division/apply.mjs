#!/usr/bin/env node
/* Apply the SW Roofing division patch to a snapshot of the LIVE site.
 *
 *   node sw-division/apply.mjs <live-snapshot-dir> <out-dir>
 *
 * Reads every .html file plus sitemap.xml from the snapshot, writes only changed and new
 * files to <out-dir> (same relative paths), copies the division's static assets
 * (css/sw-division.css, js/sw-division.js, js/vendor/*) into <out-dir>, and prints a report.
 * Fails loudly, writing nothing, if any anchor is missing or appears more than once. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './core.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const [, , snapDir, outDir] = process.argv;
if (!snapDir || !outDir) {
  console.error('usage: node sw-division/apply.mjs <live-snapshot-dir> <out-dir>');
  process.exit(2);
}

function walk(dir, base = dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['img', 'fonts', 'node_modules', '.git', 'uploads', 'projectworks'].includes(ent.name)) continue;
      walk(full, base, acc);
    } else if (/\.html$/.test(ent.name) || ent.name === 'sitemap.xml') {
      acc.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return acc;
}

const files = {};
for (const rel of walk(snapDir)) files[rel] = fs.readFileSync(path.join(snapDir, rel), 'utf8');

let result;
try {
  result = globalThis.SWDIV.applyAll(files);
} catch (err) {
  console.error('PATCH FAILED, nothing written:', err.message);
  process.exit(1);
}

for (const [rel, content] of Object.entries(result.out)) {
  const dest = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}
const webDir = path.join(here, 'web');
for (const rel of ['css/sw-division.css', 'js/sw-division.js', 'js/vendor/gsap.min.js', 'js/vendor/ScrollTrigger.min.js', 'js/vendor/lenis.min.js']) {
  const dest = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(webDir, rel), dest);
}
console.log(result.report.join('\n'));
console.log(`\n${Object.keys(result.out).length} HTML/XML files + 5 assets written to ${outDir}`);
