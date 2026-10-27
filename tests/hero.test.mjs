import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

import {
  HERO_LOCATION,
  plateOpacities,
  plateWeights,
  solarAltitude,
} from '../lib/sun.ts';

// The paper-craft hero (design/hero/README.md): plates cross-faded by the real
// sun, sprites on code-drawn threads, a 12 s loop, and a hard byte budget.
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const hero = read('../components/paper-hero.tsx');
const page = read('../app/page.tsx');
const styles = read('../app/globals.css');
const readme = read('../design/hero/README.md');
const exportDir = new URL('../dist/client/', import.meta.url);

// Every served hero file, each referenced by the component either literally
// or as a numbered template (`/hero/tray-${n}.webp`).
const heroImages = readdirSync(new URL('../public/hero/', import.meta.url))
  .filter((name) => name.endsWith('.webp'))
  .map((name) => `/hero/${name}`);
const referenced = (ref) =>
  hero.includes(ref) || hero.includes(ref.replace(/-\d+\.webp$/, '-${'));

test('every hero image the component references is served from the export', () => {
  assert.ok(heroImages.length >= 18, `only ${heroImages.length} hero images`);
  for (const ref of heroImages) {
    assert.ok(referenced(ref), `served but unused: ${ref}`);
  }
  // And the other way round: every literal or templated reference has files.
  for (const [, name] of hero.matchAll(/\/hero\/([a-z0-9-]+\.webp)/g)) {
    assert.ok(heroImages.includes(`/hero/${name}`), `referenced but missing: ${name}`);
  }
  for (const [, prefix] of hero.matchAll(/\/hero\/([a-z]+)-\$\{/g)) {
    assert.ok(
      heroImages.some((ref) => ref.startsWith(`/hero/${prefix}-`)),
      `no files for template ${prefix}-`,
    );
  }
  if (!existsSync(exportDir)) return; // build-dependent; CI builds first
  for (const ref of heroImages) {
    assert.ok(
      existsSync(new URL(`.${ref}`, exportDir)),
      `asset missing from export: ${ref}`,
    );
  }
});

test('the hero payload stays small: plates under 40 KB each, all images under 300 KB', () => {
  let total = 0;
  for (const ref of heroImages) {
    const size = statSync(new URL(`../public${ref}`, import.meta.url)).size;
    total += size;
    if (ref.includes('plate-')) {
      assert.ok(size <= 40_000, `${ref} is ${size} bytes`);
    }
  }
  assert.ok(total <= 300_000, `hero images total ${total} bytes`);
});

test('only the morning plate is fetched with priority; the other plates mount after first paint and fade in once loaded', () => {
  // The first paint needs one plate. The others mount after the page has
  // painted and cross-fade in by sun altitude.
  const morning = hero.match(/<img[^>]*plate-morning[^>]*>/s)?.[0];
  assert.ok(morning, 'morning plate is not an <img>');
  assert.match(morning, /fetchPriority="high"/);
  assert.doesNotMatch(morning, /loading="lazy"/);
  for (const plate of ['plate-midday', 'plate-afternoon']) {
    const tag = hero.match(new RegExp(`<img[^>]*${plate}[^>]*>`, 's'))?.[0];
    assert.ok(tag, `${plate} is not an <img>`);
    assert.match(tag, /loading="lazy"/);
  }
  assert.match(hero, /afterFirstPaint|requestIdleCallback/);
  assert.match(hero, /onLoad=\{markLoaded\('midday'\)\}/);
  assert.match(hero, /onLoad=\{markLoaded\('afternoon'\)\}/);
});

test('every hero image has explicit dimensions, so the hero never shifts layout', () => {
  const tags = hero.match(/<img\b[^>]*>/gs) ?? [];
  assert.ok(tags.length >= 9, `only ${tags.length} <img> tags`);
  for (const tag of tags) {
    assert.match(tag, /\bwidth=/, `no width: ${tag}`);
    assert.match(tag, /\bheight=/, `no height: ${tag}`);
    assert.match(tag, /\balt=""/, `decorative image without empty alt: ${tag}`);
  }
  assert.match(styles, /\.paper-hero-stage\s*\{[^}]*aspect-ratio:\s*2400\s*\/\s*1355/s);
});

test('the loop is 12 s, first motion inside 2 s, defined once in CSS and once in TS', () => {
  assert.match(hero, /export const HERO_LOOP_MS = 12000;/);
  assert.match(styles, /--hero-loop:\s*12s;/);
  // The figure raises the card at 0 % and the sling lifts before 2 s (16.7 %).
  const pose = styles.match(/@keyframes hero-pose-card\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(pose, 'missing hero-pose-card keyframes');
  assert.match(pose, /(^|\n)\s*0%[^}]*opacity:\s*1/);
  const lift = styles.match(/@keyframes hero-sling-lift\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(lift, 'missing hero-sling-lift keyframes');
  const liftStarts = [...lift.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
  assert.ok(liftStarts.some((p) => p > 0 && p <= 16.7), 'sling lift starts after 2 s');
  // Pose swaps are stepped, never faded.
  assert.match(styles, /\.hero-figure\s+img\s*\{[^}]*steps\(1/s);
});

test('sheets peel one at a time into the trays and the folder comes back down', () => {
  assert.ok(hero.includes('/hero/sheet-${sheet.n}.webp'));
  assert.ok(hero.includes('/hero/tray-${tray.n}.webp'));
  for (let i = 1; i <= 5; i += 1) {
    assert.match(hero, new RegExp(`\\{ n: ${i}, x: \\d+, y: \\d+`), `tray ${i}`);
  }
  assert.match(hero, /\/hero\/sheet-6\.webp/);
  assert.match(styles, /@keyframes hero-sheet-flight/);
  assert.match(styles, /@keyframes hero-tray-settle/);
  assert.match(styles, /@keyframes hero-folder-return/);
  assert.match(styles, /@keyframes hero-arm-glow/);
  // The thread, the knot and the arms are drawn in code, not in the images.
  assert.match(hero, /<svg[^>]*className="hero-threads"/s);
  assert.match(hero, /<line\b/);
});

test('the paper tag on the sling is real text in both languages', () => {
  assert.match(hero, /className="hero-sling-tag"/);
  assert.match(page, /slingTag:\s*'for Anna'/);
  assert.match(page, /slingTag:\s*'voor Anna'/);
  assert.match(hero, /\{tag\}/);
});

test('headline, sub and actions are verbatim in English and Dutch', () => {
  for (const line of [
    'Anna does the work nobody should waste time on.',
    'Ask her in Teams or Slack. She connects to the systems your work lives in, asks before she acts, and reports back.',
    'Request early access',
    'Contact Anamata',
    'Early access, 2026',
    'Anna doet het werk waar niemand tijd aan zou moeten verspillen.',
    'Vraag het haar in Teams of Slack. Ze verbindt met de systemen waar jouw werk in staat, vraagt voordat ze handelt en koppelt terug.',
    'Vraag vroege toegang aan',
    'Neem contact op',
    'Vroege toegang, 2026',
  ]) {
    assert.ok(page.includes(line), `missing hero line: ${line}`);
  }
  assert.doesNotMatch(page, /Book a demo|Plan een demo/);
  assert.doesNotMatch(page, /hours? saved|uur bespaard|uren bespaard|€/i);
});

test('three true facts, no claims about hours, prices or certifications', () => {
  for (const fact of [
    'Works inside Microsoft Teams and Slack',
    'Connects over OAuth to the systems you already use',
    'Asks before she acts, within the rights you grant',
    'Werkt in Microsoft Teams en Slack',
    'Koppelt via OAuth met de systemen die je al gebruikt',
    'Vraagt voordat ze handelt, binnen de rechten die jij geeft',
  ]) {
    assert.ok(page.includes(fact), `missing hero fact: ${fact}`);
  }
  assert.doesNotMatch(page, /ISO 27001|SOC ?2|EU-only|data isolation/i);
});

test('the stage always reaches the right edge on tablets and phones, and the copy sits on paper', () => {
  // Box 820 px wide, 57vw tall: the height-fit stage must still cover the box.
  const boxWidth = 820;
  const boxHeight = Math.min(620, Math.max(320, 0.57 * boxWidth));
  const stageWidth = boxHeight * (2400 / 1355);
  const shift = Math.max(-0.64 * stageWidth, 0.5 * boxWidth - stageWidth);
  assert.ok(0.5 * boxWidth + stageWidth + shift >= boxWidth, 'bare wall at the right edge');
  assert.match(styles, /translateX\(max\(-64%, calc\(50cqw - 100%\)\)\)/);
  assert.match(styles, /translateX\(max\(-66%, calc\(50cqw - 100%\)\)\)/);
  assert.match(styles, /\.hero::before\s*\{[^}]*linear-gradient/s);
  assert.match(styles, /\.hero-sling-tag\s*\{[^}]*rotate:\s*-8deg/s);
  assert.doesNotMatch(styles, /\.hero-sling-tag\s*\{[^}]*transform:\s*rotate/s);
});

test('reduced motion shows one still frame with the folder on the desk', () => {
  const reduced = styles.match(
    /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
  )?.[1];
  assert.ok(reduced, 'missing reduced-motion block');
  assert.match(reduced, /\.hero-sheet\s*\{[^}]*display:\s*none/s);
  assert.match(reduced, /\.hero-folder\s*\{[^}]*(display:\s*none|opacity:\s*0)/s);
  assert.match(reduced, /\.hero-figure img\[data-pose='3'\]\s*\{[^}]*opacity:\s*1/s);
  assert.match(reduced, /\.hero-figure img\[data-pose='1'\],\s*\.hero-figure img\[data-pose='2'\]\s*\{[^}]*opacity:\s*0/s);
});

test('the hero plays only while in view and starts when it enters', () => {
  assert.match(page, /heroHasEntered/);
  // Nearly half the stage must be on screen before the opening beat plays.
  assert.match(page, /useElementVisibility<HTMLDivElement>\(0\.45\)/);
  assert.match(hero, /data-playing=/);
  assert.match(styles, /\.paper-hero-stage\[data-playing='false'\] \*\s*\{[^}]*animation-play-state:\s*paused/s);
});

test('lower sections render lazily and the shell stays small', () => {
  assert.match(styles, /content-visibility:\s*auto/);
  assert.match(styles, /contain-intrinsic-size/);
  if (!existsSync(exportDir)) return;
  const index = statSync(new URL('index.html', exportDir)).size;
  assert.ok(index <= 90_000, `index.html is ${index} bytes`);
});

test('the sun drives the plates: high in June, low in December, dawn and dusk on the side plates', () => {
  const { latitude, longitude } = HERO_LOCATION;
  assert.ok(latitude > 50 && latitude < 54 && longitude > 3 && longitude < 8);

  const juneNoon = solarAltitude(new Date('2026-06-21T11:40:00Z'), latitude, longitude);
  assert.ok(juneNoon > 59 && juneNoon < 63, `June noon altitude ${juneNoon}`);
  const decemberNoon = solarAltitude(new Date('2026-12-21T11:40:00Z'), latitude, longitude);
  assert.ok(decemberNoon > 13 && decemberNoon < 16, `December noon altitude ${decemberNoon}`);
  const night = solarAltitude(new Date('2026-06-21T00:00:00Z'), latitude, longitude);
  assert.ok(night < 0, `midnight altitude ${night}`);

  for (const when of [
    '2026-06-21T11:40:00Z',
    '2026-12-21T11:40:00Z',
    '2026-06-21T04:00:00Z',
    '2026-06-21T19:30:00Z',
    '2026-03-20T00:00:00Z',
  ]) {
    const w = plateWeights(new Date(when), latitude, longitude);
    const sum = w.morning + w.midday + w.afternoon;
    assert.ok(Math.abs(sum - 1) < 1e-9, `${when}: weights sum to ${sum}`);
    for (const value of Object.values(w)) assert.ok(value >= 0 && value <= 1);
  }
  // Noon is the midday plate in every season; dawn and dusk sit on their plates.
  assert.ok(plateWeights(new Date('2026-06-21T11:40:00Z'), latitude, longitude).midday > 0.95);
  assert.ok(plateWeights(new Date('2026-12-21T11:40:00Z'), latitude, longitude).midday > 0.9);
  assert.ok(plateWeights(new Date('2026-06-21T04:00:00Z'), latitude, longitude).morning > 0.8);
  assert.ok(plateWeights(new Date('2026-06-21T19:30:00Z'), latitude, longitude).afternoon > 0.8);
  assert.equal(plateWeights(new Date('2026-06-21T00:00:00Z'), latitude, longitude).midday, 0);
});

test('the plates stay opaque while they cross-fade: the room never goes translucent', () => {
  // Stacked source-over: morning is the opaque base, the two above derive
  // their opacity from the weights so the blend equals the weighted mix.
  const half = plateOpacities({ morning: 0.5, midday: 0.5, afternoon: 0 });
  assert.deepEqual(half, { morning: 1, midday: 0.5, afternoon: 0 });
  const dusk = plateOpacities({ morning: 0, midday: 0.3, afternoon: 0.7 });
  assert.equal(dusk.morning, 1);
  assert.ok(Math.abs(dusk.midday - 1) < 1e-9, `midday ${dusk.midday}`);
  assert.ok(Math.abs(dusk.afternoon - 0.7) < 1e-9);
  const night = plateOpacities({ morning: 0, midday: 0, afternoon: 1 });
  assert.deepEqual(night, { morning: 1, midday: 1, afternoon: 1 });
  assert.match(hero, /plateOpacities\(/);
  assert.match(styles, /\.hero-plate\[data-plate='morning'\]\s*\{[^}]*opacity:\s*1;/s);
});

test('the generation record keeps the served and source assets apart', () => {
  assert.match(readme, /design\/hero\/source/);
  assert.ok(existsSync(new URL('../design/hero/source/sling.webp', import.meta.url)));
});
