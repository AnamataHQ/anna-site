import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

// The hero: a working day in a familiar calendar. Routine tasks leave the day
// and appear ticked in Anna's list; what remains merges into one block of work
// that needs the person. Dark navy, the logo colours, no hours figure.
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../app/page.tsx');
const hero = read('../components/cleared-day.tsx');
const styles = read('../app/globals.css');
const exportDir = new URL('../dist/client/', import.meta.url);

const heroImages = readdirSync(new URL('../public/hero/', import.meta.url))
  .filter((name) => name.endsWith('.webp'))
  .map((name) => `/hero/${name}`);

test('the page shows the cleared-day hero and nothing of the paper room', () => {
  assert.match(page, /from '@\/components\/cleared-day'/);
  assert.match(page, /<ClearedDay/);
  assert.doesNotMatch(page, /PaperHero|paper-hero|heroAria/);
  assert.ok(
    !existsSync(new URL('../components/paper-hero.tsx', import.meta.url)),
  );
  assert.ok(!existsSync(new URL('../lib/sun.ts', import.meta.url)));
  assert.doesNotMatch(
    styles,
    /paper-hero-stage|hero-plate|hero-knot|hero-figure/,
  );
});

test('only the tray sprites remain served, well under the image budget', () => {
  assert.deepEqual(
    heroImages,
    [1, 2, 3, 4, 5].map((n) => `/hero/tray-${n}.webp`),
  );
  let total = 0;
  for (const ref of heroImages) {
    total += statSync(new URL(`../public${ref}`, import.meta.url)).size;
  }
  assert.ok(total <= 300_000, `hero images total ${total} bytes`);
  assert.doesNotMatch(page, /\/hero\/(plate|seated|sheet)-/);
  assert.doesNotMatch(hero, /\/hero\//);
});

test('headline, sub and actions are verbatim in English and Dutch', () => {
  for (const phrase of [
    "'The work still needs doing. It does not need to take your time.'",
    "'Het werk moet nog steeds gebeuren. Het hoeft niet jouw tijd te kosten.'",
    "'Ask her in Teams or Slack. She connects to the systems your work lives in, asks before she acts, and reports back.'",
    "'Vraag het haar in Teams of Slack. Ze verbindt met de systemen waar jouw werk in staat, vraagt voordat ze handelt en koppelt terug.'",
    "earlyAccess: 'Request early access'",
    "earlyAccess: 'Vraag vroege toegang aan'",
    "contact: 'Contact Anamata'",
    "contact: 'Neem contact op'",
  ]) {
    assert.ok(page.includes(phrase), `missing hero copy: ${phrase}`);
  }
  assert.doesNotMatch(page, /Book a demo|Plan een demo|Demo%20ANNA/);
  assert.doesNotMatch(page, /heroTitle: 'Anna does the work nobody/);
});

test('three true facts under the actions, no hours, prices or certifications anywhere', () => {
  for (const fact of [
    'Works inside Microsoft Teams and Slack',
    'Connects over OAuth to the systems you already use',
    'Asks before she acts, within the rights you grant',
    'Werkt in Microsoft Teams en Slack',
  ]) {
    assert.ok(page.includes(fact), `missing fact: ${fact}`);
  }
  for (const source of [page, hero]) {
    assert.doesNotMatch(
      source,
      /Time returned|Tijd terug|2h 40m|2u 40m|returnedAmount/,
    );
    assert.doesNotMatch(source, /hours saved|uur bespaard|€|ISO 27001|SOC 2/i);
  }
});

test('a familiar calendar: seven routine tasks in both languages, balanced against work that needs you', () => {
  for (const key of [
    'date',
    'view',
    'today',
    'weekday',
    'focus',
    'focusDetail',
  ]) {
    assert.equal(
      [...page.matchAll(new RegExp(`\\b${key}: '`, 'g'))].length,
      2,
      key,
    );
  }
  for (const phrase of [
    "focus: 'Work that needs you'",
    "focus: 'Werk dat jou nodig heeft'",
    "handled: 'Handled by Anna'",
    "handled: 'Afgehandeld door Anna'",
    "handledCount: '7 routine tasks completed'",
    "handledCount: '7 routinetaken afgerond'",
  ]) {
    assert.ok(page.includes(phrase), `missing calendar copy: ${phrase}`);
  }
  const days = [...page.matchAll(/tasks: \[([\s\S]*?)\n\s{6}\]/g)];
  assert.equal(days.length, 2, 'one task list per language');
  for (const [, block] of days) {
    const durations = [...block.matchAll(/duration: (\d+)/g)].map((m) =>
      Number(m[1]),
    );
    assert.equal(durations.length, 7);
    assert.equal(
      durations.reduce((a, b) => a + b, 0),
      160,
    );
    assert.equal([...block.matchAll(/incoming: true/g)].length, 2);
  }
  const focus = hero.slice(
    hero.indexOf('const focusSegments'),
    hero.indexOf('] as const;', hero.indexOf('const focusSegments')),
  );
  const focusMinutes = [...focus.matchAll(/duration: (\d+)/g)].reduce(
    (a, m) => a + Number(m[1]),
    0,
  );
  assert.equal(focusMinutes + 160, 540, 'a nine-hour day');
  assert.match(hero, /className="calendar-event"/);
  assert.match(hero, /className="focus-block focus-anchor"/);
  assert.match(hero, /INITIAL_FOCUS_WINDOW[\s\S]*FINAL_FOCUS_WINDOW/);
});

test("cleared tasks reappear ticked in Anna's list, one by one, as they leave the day", () => {
  // One list item per task, in order, with a tick, staggered by its index.
  assert.match(hero, /<ul className="handled-list"/);
  assert.match(
    hero,
    /copy\.tasks\.map\(\(task, index\)[\s\S]*?className="handled-task"[\s\S]*?'--tick-order': index/,
  );
  assert.match(hero, /className="handled-task"[\s\S]{0,300}<Check /);
  assert.match(styles, /\.handled-task \{[^}]*animation: tick-in 10\.4s/);
  assert.match(
    styles,
    /\.handled-task \{[^}]*animation-delay: calc\(var\(--tick-order\)/,
  );
  assert.match(styles, /@keyframes tick-in/);
  // Items start hidden and the tray is visible while the events clear (45–56 %).
  assert.match(
    styles,
    /@keyframes reveal-summary \{\s*0%,\s*44% \{[^}]*opacity: 0/,
  );
  assert.match(styles, /@keyframes tick-in \{\s*0%,\s*47% \{[^}]*opacity: 0/);
  // No hours figure in the tray.
  assert.doesNotMatch(hero, /returned-time/);
});

test('the calendar plays only once the hero is in view, and shows the end state without motion', () => {
  assert.match(
    page,
    /className="hero-visual"[\s\S]{0,120}data-in-view=\{heroHasEntered\}/,
  );
  assert.match(hero, /inView/);
  assert.match(
    styles,
    /\.hero-visual\[data-in-view='true'\] \.calendar-event,[\s\S]*?\.hero-visual\[data-in-view='true'\] \.handled-task \{\s*animation-play-state: running/,
  );
  const reduced = styles.slice(
    styles.indexOf('@media (prefers-reduced-motion: reduce)'),
  );
  assert.match(
    reduced,
    /\.calendar-event,\s*\.focus-fragment \{\s*display: none/,
  );
  assert.match(reduced, /\.handled-task \{[^}]*opacity: 1/);
  assert.match(reduced, /\.reduced-motion-story \{\s*display: grid/);
  assert.match(hero, /className="reduced-motion-story"/);
  assert.match(page, /before: 'Before · 7 routine tasks split up the day'/);
  assert.match(page, /after: 'After · 08:00–17:00 for work that needs you'/);
});

test('the hero is navy with the logo colours; the demo sits on the blue band', () => {
  assert.match(styles, /\.hero \{[^}]*var\(--navy\)/);
  assert.match(styles, /\.hero \{[^}]*color: white/);
  assert.match(styles, /\.hero::after \{[^}]*var\(--coral\)/);
  assert.match(styles, /\.workflow-section \{[^}]*background: var\(--blue\)/);
  assert.match(styles, /\.cleared-day \{[^}]*background: #fbfaf7/);
});

test('lower sections render lazily and the shell stays small', () => {
  assert.match(styles, /content-visibility:\s*auto/);
  assert.match(styles, /contain-intrinsic-size/);
  if (!existsSync(exportDir)) return;
  const index = statSync(new URL('index.html', exportDir)).size;
  assert.ok(index <= 90_000, `index.html is ${index} bytes`);
});
