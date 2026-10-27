import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

import {
  dominantPlate,
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
  assert.ok(heroImages.length >= 17, `only ${heroImages.length} hero images`);
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
  // The figure raises the card at 0 % and the card is on its way to Anna by 2 s.
  const pose = styles.match(/@keyframes hero-pose-card\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(pose, 'missing hero-pose-card keyframes');
  assert.match(pose, /(^|\n)\s*0%[^}]*opacity:\s*1/);
  const card = styles.match(/@keyframes hero-card-flight\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(card, 'missing hero-card-flight keyframes');
  const cardStops = [...card.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
  assert.ok(cardStops.some((p) => p > 0 && p <= 16.7), 'card leaves the hand after 2 s');
  const departures = [...hero.matchAll(/\{ n: \d, x: \d+, y: \d+, w: [0-9.]+, iw: \d+, ih: \d+, t: ([0-9.]+)/g)]
    .map((m) => Number(m[1]));
  assert.equal(departures.length, 5);
  // Pose swaps are stepped, never faded.
  assert.match(styles, /\.hero-figure\s+img\s*\{[^}]*steps\(1/s);
});

test('Anna reads from three systems (sheets rise into the knot) and writes to two (sheets come down)', () => {
  assert.ok(hero.includes('/hero/sheet-${sheet.n}.webp'));
  assert.ok(hero.includes('/hero/tray-${tray.n}.webp'));
  for (let i = 1; i <= 5; i += 1) {
    assert.match(hero, new RegExp(`\\{ n: ${i}, x: \\d+, y: \\d+`), `tray ${i}`);
  }
  // Nothing is on the desk but the mug and what comes back: no stack, no sling, no tag.
  assert.doesNotMatch(hero, /stack|sling/i);
  assert.doesNotMatch(styles, /hero-stack|hero-sling/);
  // Three reads, two writes; each sheet travels between its tray and the knot.
  const reads = [...hero.matchAll(/io: 'read'/g)].length;
  const writes = [...hero.matchAll(/io: 'write'/g)].length;
  assert.equal(reads, 3);
  assert.equal(writes, 2);
  assert.match(hero, /'--dx': KNOT\.x - tray\.x/);
  assert.match(hero, /data-io=\{tray\.io\}/);
  assert.match(styles, /@keyframes hero-sheet-read/);
  assert.match(styles, /@keyframes hero-sheet-write/);
  assert.match(styles, /\.hero-sheet\[data-io='read'\]\s*\{[^}]*hero-sheet-read/s);
  assert.match(styles, /\.hero-sheet\[data-io='write'\]\s*\{[^}]*hero-sheet-write/s);
  // A read sheet is absorbed at the knot: it ends small and invisible there.
  const read = styles.match(/@keyframes hero-sheet-read\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.match(read, /scale\(0\.[0-9]+\)/);
  // Only the written-to trays settle, after their sheet lands.
  assert.match(hero, /tray\.io === 'write' \? `\$\{tray\.t \+ FLIGHT\}s` : 'none'/);
  assert.match(styles, /@keyframes hero-tray-settle/);
  // Each arm lights from the knot outward before its sheet moves.
  assert.match(hero, /className="hero-arm-pulse"[^>]*pathLength=\{100\}/s);
  assert.match(hero, /'--t': `\$\{tray\.t - ARM_LEAD\}s`/);
  assert.match(styles, /@keyframes hero-arm-pulse/);
  assert.match(styles, /\.hero-arm-pulse\s*\{[^}]*stroke:\s*var\(--coral\)/s);
  // The folder comes down from the knot to the desk.
  assert.match(hero, /'--dx': DESK\.x - KNOT\.x/);
  assert.match(hero, /'--dy': DESK\.y - KNOT\.y/);
  assert.match(styles, /@keyframes hero-folder-return/);
  // The thread, the knot and the arms are drawn in code, not in the images.
  assert.match(hero, /<svg[^>]*className="hero-threads"/s);
  assert.match(hero, /<line\b/);
});

test('the hero has no text in the picture: the only words are the label for assistive tech', () => {
  assert.doesNotMatch(hero, /\{tag\}|stackTag|slingTag/);
  assert.doesNotMatch(page, /stackTag|slingTag/);
  assert.match(hero, /aria-label=\{label\}/);
});

test("Anna is the mobile: her mark is the knot, the card flies to it, it flashes when the ask arrives", () => {
  const knot = hero.match(/<div\s+className="hero-knot"[\s\S]*?<\/div>/)?.[0];
  assert.ok(knot, 'the knot is not an HTML element');
  assert.match(knot, /\/brands\/anna-mono-dark\.svg/);
  assert.match(knot, /left: `\$\{KNOT\.x\}%`/);
  assert.doesNotMatch(hero, /<circle\b/);
  // The coral card is drawn in code, sits in the raised hand from the first
  // frame (the sprite's own card is cut out), leaves it while the arm is
  // still up, and ends at the knot.
  assert.match(hero, /className="hero-card"/);
  assert.match(hero, /'--dx': KNOT\.x - CARD\.x/);
  assert.match(hero, /'--dy': KNOT\.y - CARD\.y/);
  assert.match(readme, /card (is )?cut out of seated-2|seated-2 .*card cut out/i);
  assert.match(styles, /@keyframes hero-knot-receive/);
  assert.match(styles, /\.hero-knot\s*\{[^}]*animation:\s*hero-knot-receive/s);
  const pose = styles.match(/@keyframes hero-pose-card\s*\{([\s\S]*?)\n\}/)?.[1];
  const poseEnd = Number(pose.match(/\n\s*(\d+(?:\.\d+)?)%,\s*\n\s*100%/)?.[1]);
  const card = styles.match(/@keyframes hero-card-flight\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.match(card, /(^|\n)\s*0%[^}]*opacity:\s*1/);
  const cardLeaves = Number(card.match(/\n\s*(\d+(?:\.\d+)?)%\s*\{[^}]*translate\(calc\(var\(--dx\)/)?.[1]);
  assert.ok(cardLeaves < poseEnd, `card leaves at ${cardLeaves}%, after the arm comes down at ${poseEnd}%`);
});

test("Anna's mark sits on the knot and on the returned folder, never on the figure", () => {
  const folder = hero.match(/<div\s+className="hero-folder"[\s\S]*?<\/div>/)?.[0];
  assert.ok(folder, 'the folder is not a group');
  assert.match(folder, /\/hero\/sheet-6\.webp/);
  assert.match(folder, /className="hero-folder-mark"[^>]*src="\/brands\/anna-mono-dark\.svg"/s);
  const figure = hero.match(/<div\s+className="hero-figure"[\s\S]*?<\/div>/)?.[0];
  assert.ok(figure, 'missing figure group');
  assert.doesNotMatch(figure, /brands\//);
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
});

test('the hero fits a Full HD browser window: copy padding never pushes it past the viewport', () => {
  // 1920 x 945 (Full HD minus browser chrome): the hero is the viewport minus
  // the header, and the copy block must fit inside that with its padding.
  const copy = styles.match(/\.hero-copy\s*\{[^}]*padding:\s*([^;]+);/s)?.[1];
  assert.ok(copy, 'missing hero-copy padding');
  const vertical = copy.match(/clamp\(([\d.]+)rem,\s*([\d.]+)vw,\s*([\d.]+)rem\)/);
  assert.ok(vertical, `hero-copy vertical padding is not a clamp: ${copy}`);
  const atFullHd = Math.min(Number(vertical[3]) * 16, Math.max(Number(vertical[1]) * 16, (Number(vertical[2]) / 100) * 1920));
  assert.ok(atFullHd <= 80, `vertical padding ${atFullHd}px at 1920 wide`);
  assert.match(styles, /\.hero\s*\{[^}]*min-height:\s*min\(880px,\s*calc\(100svh - 74px\)\)/s);
});

test('reduced motion shows one still frame with the folder on the desk', () => {
  const reduced = styles.match(
    /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/,
  )?.[1];
  assert.ok(reduced, 'missing reduced-motion block');
  assert.match(reduced, /\.hero-sheet\s*\{[^}]*display:\s*none/s);
  // These may share one grouped rule.
  for (const hidden of ['hero-folder', 'hero-card', 'hero-arm-pulse']) {
    assert.match(reduced, new RegExp(`\\.${hidden}[^{]*\\{[^}]*(display:\\s*none|opacity:\\s*0)`, 's'), hidden);
  }
  assert.match(reduced, /\.hero-figure img\[data-pose='3'\]\s*\{[^}]*opacity:\s*1/s);
  assert.match(reduced, /\.hero-knot[^{]*\{[^}]*animation:\s*none/s);
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
  assert.match(styles, /\.hero-plate\[data-plate='morning'\]\s*\{[^}]*opacity:\s*1;/s);
});

test('exactly one plate shows at a time, so the desk and mug never double-expose', () => {
  assert.equal(dominantPlate({ morning: 0.6, midday: 0.4, afternoon: 0 }), 'morning');
  assert.equal(dominantPlate({ morning: 0, midday: 0.55, afternoon: 0.45 }), 'midday');
  assert.equal(dominantPlate({ morning: 0, midday: 0.2, afternoon: 0.8 }), 'afternoon');
  assert.match(hero, /dominantPlate\(weights\)/);
  assert.doesNotMatch(hero, /'--o-midday':\s*(loaded\.midday \? )?opacities/);
});

test('every pose is scaled and placed by the chair back, so the chair never moves or changes size', () => {
  const poses = [...hero.matchAll(/\{ pose: (\d), iw: (\d+), ih: (\d+), chair: \{ w: (\d+), left: (\d+), top: (\d+) \} \}/g)];
  assert.equal(poses.length, 3);
  for (const [, pose, iw, ih, w, left, top] of poses) {
    // The chair back is measured in the sprite's own pixels and must fit in it.
    assert.ok(Number(left) + Number(w) <= Number(iw), `pose ${pose} chair wider than sprite`);
    assert.ok(Number(top) < Number(ih), `pose ${pose} chair top below sprite`);
    // Chair back height is 1.33x its width in every sprite (same chair); the
    // seat-to-floor part was cropped on pose 2 to match. Check the proportion
    // of the sprite below the chair top is the same within 3 % for all poses.
    const below = (Number(ih) - Number(top)) / Number(w);
    assert.ok(Math.abs(below - 2.17) < 0.07, `pose ${pose}: ${below.toFixed(2)} sprite below chair top per chair width`);
  }
  // Poses 2 and 3 are generated from pose 1 as reference (README).
  assert.match(readme, /seated-2 .* and seated-3\s.*regenerated with seated-1/s);
  assert.match(hero, /width: `\$\{\(100 \* pose\.iw\) \/ pose\.chair\.w\}%`/);
  assert.match(hero, /left: `\$\{\(-100 \* pose\.chair\.left\) \/ pose\.chair\.w\}%`/);
  assert.match(hero, /translateY\(\$\{\(-100 \* pose\.chair\.top\) \/ pose\.ih\}%\)/);
  // The pose images are wider than the chair-back group; Tailwind's preflight
  // (img { max-width: 100% }) must not cap them, or every pose shrinks to
  // the group and the chairs differ (what Ezra saw on 2026-10-27).
  assert.match(styles, /\.hero-figure img\s*\{[^}]*max-width:\s*none/s);
});

test('landed sheets sit at the lip of the tray and stay small, so the tray object stays visible', () => {
  assert.match(hero, /const LANDING = \{ dx: -[0-9.]+, dy: [0-9.]+ \}/);
  for (const [, width] of hero.matchAll(/\{ n: \d, w: ([0-9.]+), iw: \d+, ih: \d+, rot:/g)) {
    assert.ok(Number(width) <= 3.2, `sheet width ${width}% of the stage`);
  }
});

test('the generation record keeps the served and source assets apart', () => {
  assert.match(readme, /design\/hero\/source/);
  assert.ok(existsSync(new URL('../design/hero/source/seated-2.webp', import.meta.url)));
});
