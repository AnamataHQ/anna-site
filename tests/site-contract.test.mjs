import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const hero = readFileSync(
  new URL('../components/cleared-day.tsx', import.meta.url),
  'utf8',
);
const layout = readFileSync(
  new URL('../app/layout.tsx', import.meta.url),
  'utf8',
);
const styles = readFileSync(
  new URL('../app/globals.css', import.meta.url),
  'utf8',
);
const annaColourTransparent = readFileSync(
  new URL('../public/brands/anna-color-transparent.svg', import.meta.url),
  'utf8',
);
const annaColourBlack = readFileSync(
  new URL('../public/brands/anna-color-black.svg', import.meta.url),
  'utf8',
);
const annaColourNavy = readFileSync(
  new URL('../public/brands/anna-color-navy.svg', import.meta.url),
  'utf8',
);
const annaMonoDark = readFileSync(
  new URL('../public/brands/anna-mono-dark.svg', import.meta.url),
  'utf8',
);
const annaMonoLight = readFileSync(
  new URL('../public/brands/anna-mono-light.svg', import.meta.url),
  'utf8',
);
const favicon = readFileSync(
  new URL('../public/favicon.svg', import.meta.url),
  'utf8',
);
const viteConfig = readFileSync(
  new URL('../vite.config.ts', import.meta.url),
  'utf8',
);
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('exposes the development preview beyond WSL localhost', () => {
  assert.match(packageJson.scripts.dev, /--hostname\s+0\.0\.0\.0/);
  assert.match(viteConfig, /w11\.at-skate\.ts\.net/);
});

test('ships complete English and Dutch page copy', () => {
  assert.match(page, /language:\s*'en'/);
  assert.match(page, /language:\s*'nl'/);
  assert.match(page, /Nederlands/);
  assert.match(page, /English/);
});

test('explains five complete processes, each a conversation that asks when a decision is yours', () => {
  const block = page.slice(
    page.indexOf('scenarios: ['),
    page.indexOf("controlKicker: 'Initiative"),
  );
  for (const phrase of [
    "label: 'Close my week'",
    "label: 'A week off'",
    "label: 'Month-end hours'",
    "label: 'New colleague'",
    "label: 'Customer follow-ups'",
    'Shall I',
  ]) {
    assert.ok(block.includes(phrase), `missing scenario detail: ${phrase}`);
  }
  // Every scenario: who asks, at least four steps of work, a question, the reply, a record.
  assert.equal([...block.matchAll(/who: '/g)].length, 5);
  assert.equal([...block.matchAll(/question:/g)].length, 5);
  assert.equal([...block.matchAll(/reply: '/g)].length, 5);
  assert.equal([...block.matchAll(/record: \[/g)].length, 5);
  for (const steps of block.matchAll(/steps: \[([\s\S]*?)\]/g)) {
    assert.ok(
      [...steps[1].matchAll(/'/g)].length >= 8,
      'a scenario has fewer than four steps',
    );
  }
  const nl = page.slice(
    page.indexOf("workflowKicker: 'Eén verzoek"),
    page.indexOf("controlKicker: 'Initiatief"),
  );
  for (const phrase of [
    'Mijn week afsluiten',
    'Een week vrij',
    'Maandafsluiting',
    'Nieuwe collega',
    'Klantopvolging',
    'Zal ik',
  ]) {
    assert.ok(nl.includes(phrase), `missing Dutch scenario detail: ${phrase}`);
  }
  // No vendor names in the conversations: generic systems only.
  for (const vendor of ['ClockWise', 'Loket', 'HubSpot', 'Notion', 'Jira']) {
    assert.ok(
      !block.includes(vendor) && !nl.includes(vendor),
      `vendor named in a scenario: ${vendor}`,
    );
  }
  // The confirmation is a chat question and a reply, not an approval card.
  assert.doesNotMatch(
    page,
    /Human approval required|Menselijke goedkeuring nodig|approval-card|Approve and continue/,
  );
  assert.match(page, /className="reply-button"/);
  assert.match(page, /scenario\.reply/);
  assert.match(page, /className="work-steps"/);
  assert.match(page, /className="record-list"/);
  assert.doesNotMatch(page, /<DemoMessage[^>]+avatar="A"/s);
  // Not called a demo.
  assert.doesNotMatch(page, /DEMO ·|Choose a demo|Kies een demosituatie/);
});

test('shows five selectable, replayable conversations', () => {
  assert.match(page, /from '@\/components\/ui\/tabs'/);
  for (const phrase of [
    'Anna is working',
    'Anna is bezig',
    'Replay conversation',
    'Gesprek opnieuw afspelen',
    'Pause conversation',
    'Gesprek pauzeren',
    'What Anna did',
    'Wat Anna heeft gedaan',
  ]) {
    assert.ok(page.includes(phrase), `missing animated demo detail: ${phrase}`);
  }
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /demoStep/);
});

test('shows Anna working briefly after the reply before reporting completion', () => {
  assert.match(page, /const EXECUTION_DELAY_MS = 1600/);
  assert.match(page, /isExecuting/);
  assert.match(page, /Anna is carrying this out/);
  assert.match(page, /Anna voert dit nu uit/);
  assert.match(page, /aria-busy=\{isExecuting\}/);
  assert.match(page, /window\.setTimeout\([\s\S]*EXECUTION_DELAY_MS/);
});

test('explains how Anna works as the three steps the demo just showed', () => {
  for (const line of [
    "problemKicker: 'How Anna works'",
    "problemTitle: 'One request in Teams. Finished work in your systems.'",
    "problemKicker: 'Zo werkt Anna'",
    "problemTitle: 'Eén vraag in Teams. Afgerond werk in jouw systemen.'",
    "title: 'You ask'",
    "title: 'Anna prepares'",
    "title: 'Anna finishes'",
    "title: 'Jij vraagt'",
    "title: 'Anna bereidt voor'",
    "title: 'Anna rondt af'",
    'You see exactly what she did.',
    'Je ziet precies wat ze heeft gedaan.',
  ]) {
    assert.ok(page.includes(line), `missing how-it-works line: ${line}`);
  }
  // The section is a "how", not a problem statement, and no longer lists
  // answering as a separate capability.
  assert.doesNotMatch(
    page,
    /Wrong use of your time|work around the work|Verkeerd gebruik van je tijd|werk rondom het werk|title: 'Answers'|title: 'Beantwoordt'/,
  );
  const lists = [...page.matchAll(/capabilities: \[([\s\S]*?)\n\s{4}\],/g)];
  assert.equal(lists.length, 2, 'one step list per language');
  for (const [, block] of lists) {
    assert.deepEqual(
      [...block.matchAll(/number: '(\d\d)'/g)].map((m) => m[1]),
      ['01', '02', '03'],
    );
  }
});

test('makes Anna boundaries and recognisable team tasks concrete', () => {
  for (const phrase of [
    "title: 'Anna does'",
    "title: 'Anna asks'",
    "title: 'Anna never'",
    "title: 'Anna doet'",
    "title: 'Anna vraagt'",
    "title: 'Anna doet nooit'",
    'carries out the actions you have allowed.',
    'when an action needs your approval first.',
    'acts without leaving a record.',
    'de acties uitvoeren die jij hebt toegestaan.',
    'eerst jouw goedkeuring nodig heeft.',
    'zonder een verslag achter te laten.',
  ]) {
    assert.ok(
      page.includes(phrase),
      `missing operating model detail: ${phrase}`,
    );
  }
  // Plain words, no system-speak (Ezra, 2026-10-28).
  assert.doesNotMatch(
    page,
    /approval boundary|configured access|goedkeuringsgrens|ingestelde toegang|never does without permission/,
  );
});

test('asks for what is due, never for what the asker forgot they promised', () => {
  for (const line of [
    "ask: 'Which customers are due a follow-up this week?'",
    "ask: 'Welke klanten zijn deze week aan opvolging toe?'",
    'Which customer follow-ups are still open this week? Draft them for me.',
    'Welke klantopvolgingen staan deze week nog open? Schrijf ze alvast.',
  ]) {
    assert.ok(page.includes(line), `missing follow-up line: ${line}`);
  }
  // "What did we promise" tells the visitor they forget things (Ezra,
  // 2026-10-28). Anna may still report the promises she found on the deals.
  assert.doesNotMatch(page, /did we promise|hebben we .{0,40}beloofd/i);
});

test('offers early access and contact, with identical wording in hero and closing section', () => {
  assert.equal((page.match(/'Request early access'/g) ?? []).length, 1);
  assert.equal((page.match(/'Vraag vroege toegang aan'/g) ?? []).length, 1);
  assert.match(page, /Contact Anamata/);
  assert.match(page, /mailto:info@anamata\.ai/);
  assert.doesNotMatch(page, /Book a demo|Plan een demo|Demo%20ANNA/);
  // The dialog opened by the early-access button carries the button's words.
  const form = readFileSync(
    new URL('../components/lead-form.tsx', import.meta.url),
    'utf8',
  );
  assert.match(form, /demo: 'Request early access'/);
  assert.match(form, /demo: 'Vraag vroege toegang aan'/);
  assert.doesNotMatch(form, /Book a demo|Plan een demo/);
  assert.match(page, /workflowTitle: 'Zie hoe het werk gebeurt\.'/);
});

test('the connectors: twelve marks tied to Anna, thousands available, no tested-with list', () => {
  const stream = [
    'Microsoft 365',
    'Jira',
    'Slack',
    'Loket',
    'Notion',
    'GitHub',
    'HubSpot',
    'ClockWise',
    'Google Drive',
    'Confluence',
    'Azure',
    'Asana',
  ];
  const block = page.slice(
    page.indexOf('const connectors = ['),
    page.indexOf('] as const;', page.indexOf('const connectors = [')),
  );
  for (const name of stream) {
    assert.ok(block.includes(`name: '${name}'`), `missing connector: ${name}`);
  }
  for (const icon of block.matchAll(
    /icon: '\/brands\/([a-z0-9-]+\.(?:svg|png))'/g,
  )) {
    assert.ok(
      existsSync(new URL(`../public/brands/${icon[1]}`, import.meta.url)),
      `missing mark: ${icon[1]}`,
    );
  }
  assert.equal([...block.matchAll(/icon: '/g)].length, stream.length);
  for (const gone of ['Microsoft Teams', 'Mendix']) {
    assert.ok(!block.includes(gone), `${gone} is not a map connector`);
  }
  const sections = [...page.matchAll(/<section[^>]*id="([a-z-]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(sections.slice(0, 2), ['top', 'demo']);
  // Outcome, not mechanism: the visitor reads what connecting gives them,
  // never the protocol names (Ezra, 2026-10-28).
  assert.doesNotMatch(page, /OAuth|MCP/);
  assert.match(
    page,
    /'Connect Anna to the systems your work lives in, and she can read and act in them\. You decide which rights she gets\.'/,
  );
  assert.match(
    page,
    /'Koppel Anna aan de systemen waar je werk in staat, en ze kan erin lezen en handelen\. Jij bepaalt welke rechten ze krijgt\.'/,
  );
  assert.match(page, /Among thousands of connectors/);
  assert.match(page, /Een greep uit duizenden koppelingen/);
  assert.match(
    page,
    /If it has a workable API, Anamata can build a connector for it during onboarding\./,
  );
  assert.match(
    page,
    /Als het een werkbare API heeft, kan Anamata er tijdens de onboarding een koppeling voor bouwen\./,
  );
  assert.match(page, /Request a connector/);
  assert.match(page, /Vraag een koppeling aan/);
  for (const gone of [
    'Tested with',
    'Getest met',
    'If one connector works',
    'these are the systems she has been tested with',
    'Tell us which system your team needs next',
    'Vertel ons welk systeem',
    'Shipping with Anna',
    'Communication roadmap',
    'on the cards',
    'op de planning',
    'Available now',
    '+∞',
  ]) {
    assert.ok(
      !page.includes(gone),
      `old connector copy still present: ${gone}`,
    );
  }
});

test("the connectors are a still paper string map tied to Anna's knot, fading at the edges", () => {
  // The map is decoration; every disc carries its own name, nothing is listed below.
  assert.match(page, /className="connector-stage"[^>]*aria-hidden="true"/);
  assert.match(
    page,
    /className="connector-knot"[\s\S]{0,400}src="\/brands\/anna-mono-dark\.svg"/,
  );
  assert.match(page, /<svg className="connector-threads"/);
  assert.match(
    page,
    /className="connector-disc"[\s\S]{0,700}<small>\{connector\.name\}<\/small>/,
  );
  assert.doesNotMatch(
    page,
    /connector-names|connector-stream|connector-figure|\/hero\/seated-/,
  );
  assert.doesNotMatch(hero, /export const POSES/);
  // One thread from the knot to every disc, and a few that leave the frame.
  const block = page.slice(
    page.indexOf('const connectors = ['),
    page.indexOf('] as const;', page.indexOf('const connectors = [')),
  );
  assert.equal([...block.matchAll(/x: \d+,\s*y: \d+/g)].length, 12);
  assert.match(page, /const LOOSE_THREADS = \[/);
  // Nothing moves: no animation, nothing for reduced motion to switch off.
  assert.doesNotMatch(styles, /@keyframes connector-/);
  assert.doesNotMatch(styles, /\.connector-[a-z-]+ \{[^}]*animation/);
  assert.match(styles, /\.connector-stage \{[^}]*mask-image/);
});

test('tells the story in the agreed order', () => {
  const order = [
    'hero',
    'workflow-section',
    'use-case-section',
    'capability-section',
    'connectors',
    'control-section',
    'cta-section',
  ];
  const positions = order.map((name) => page.indexOf(`className="${name}"`));
  for (const [index, position] of positions.entries()) {
    assert.ok(position >= 0, `missing section ${order[index]}`);
    if (index > 0)
      assert.ok(
        position > positions[index - 1],
        `${order[index]} is out of order`,
      );
  }
  // Three use cases as generic endpoints, each with a paper tray; vendors
  // appear only as marks in the string map.
  const examples = [...page.matchAll(/examples: \[([\s\S]*?)\n\s{4}\],/g)];
  assert.equal(examples.length, 2, 'one use-case list per language');
  for (const [, block] of examples) {
    assert.equal([...block.matchAll(/tray: [123]/g)].length, 3);
    for (const vendor of ['ClockWise', 'Loket', 'HubSpot', 'Notion', 'Jira']) {
      assert.ok(
        !block.includes(vendor),
        `vendor named in a use case: ${vendor}`,
      );
    }
  }
  for (const useCase of [
    "title: 'Hours in your time tracking'",
    "title: 'Leave in your HR system'",
    "title: 'Follow-ups in your CRM'",
    "title: 'Uren in je urenregistratie'",
    "title: 'Verlof in je HR-systeem'",
    "title: 'Opvolging in je CRM'",
    'Log my hours',
    'Boek mijn uren',
    "examplesKicker: 'Where to start'",
    "examplesTitle: 'Three things to hand to Anna first.'",
    "examplesKicker: 'Om mee te beginnen'",
    "examplesTitle: 'Drie taken om meteen aan Anna te geven.'",
  ]) {
    assert.ok(page.includes(useCase), `missing use case: ${useCase}`);
  }
  assert.doesNotMatch(
    page,
    /Work your team recognises|Werk dat je team herkent|Three things to start with/,
  );
  // The navigation follows the page.
  assert.match(
    page,
    /<a href="#how">[\s\S]*?<a href="#connectors">[\s\S]*?<a href="#control">/,
  );
  // Below-the-fold sections, the connectors included, render lazily.
  assert.match(styles, /\.connectors,[\s\S]{0,120}content-visibility: auto/);
});

test('on phones the situations are one scrollable row of chips and the playback buttons are icon-only', () => {
  // Large phones report more than 500 CSS px (a Pixel 10 Pro XL about 512),
  // so the compact demo controls live in a 640px block of their own, placed
  // before the 500px page block.
  const start = styles.indexOf('@media (max-width: 640px)');
  assert.ok(start >= 0, 'no 640px block for the demo controls');
  assert.ok(start < styles.indexOf('@media (max-width: 500px)'));
  const phone = styles.slice(start, styles.indexOf('@media', start + 1));
  // Between phone and tablet widths the chips wrap instead of spilling out
  // of a centred row on both sides.
  const tablet = [...styles.matchAll(/@media \(max-width: 820px\)/g)]
    .map((m) => styles.slice(m.index, styles.indexOf('@media', m.index + 1)))
    .find((block) => block.includes('\n  .scenario-tabs {'));
  assert.ok(tablet, 'no 820px block styles the demo tabs');
  assert.match(tablet, /\.scenario-tabs \{[^}]*flex-wrap: wrap/);
  assert.match(tablet, /\.scenario-tabs \{[^}]*justify-content: flex-start/);
  // One row that scrolls sideways, never a stack of five tall rows.
  assert.match(phone, /\.scenario-tabs \{[^}]*overflow-x: auto/);
  assert.match(phone, /\.scenario-tabs \{[^}]*flex-wrap: nowrap/);
  assert.match(phone, /\.scenario-tabs \{[^}]*justify-content: flex-start/);
  assert.doesNotMatch(phone, /\.scenario-tabs \{[^}]*flex-direction: column/);
  assert.match(
    phone,
    /\.scenario-tabs \[data-slot='tabs-trigger'\] \{[^}]*white-space: nowrap/,
  );
  // Replay and pause keep their accessible names but show only the icon.
  assert.match(
    page,
    /<RotateCcw size=\{15\} aria-hidden="true" \/>\s*<span>\{t\.replay\}<\/span>/,
  );
  assert.match(phone, /\.playback-controls button span \{[^}]*display: none/);
  assert.match(phone, /\.playback-controls button \{[^}]*width: 40px/);
  // The chat window is not padded out to a fixed tall block (at most 400px
  // since the rhythm pass, 2026-10-28).
  const phoneThread = phone.match(/\.demo-thread \{[^}]*min-height: (\d+)px/);
  assert.ok(phoneThread, 'the 640px block sets the chat window height');
  assert.ok(
    Number(phoneThread[1]) <= 400,
    `phone chat window min-height ${phoneThread[1]}px`,
  );
  assert.doesNotMatch(phone, /\.demo-thread \{[^}]*min-height: 680px/);
  // The panel gives the chat the width of the phone.
  assert.match(phone, /\.scenario-shell\.paper-panel \{[^}]*padding: 0\.75rem/);
});

test('the demo never clips: controls wrap above the tablet width and steps may grow', () => {
  // Codex review, 2026-10-28: at 820-1000px the replay and pause buttons ran
  // past the panel; at 360px steps of 90-107px were cut off at 80px.
  // Un-indented rules are the base rules, outside any media block.
  assert.match(styles, /\n\.scenario-controls \{[^}]*flex-wrap: wrap/);
  assert.match(styles, /\n\.scenario-tabs \{[^}]*flex-wrap: wrap/);
  assert.match(
    styles,
    /\.work-steps li\[data-visible='true'\] \{[^}]*max-height: 12rem/,
  );
  assert.doesNotMatch(styles, /max-height: 80px/);
});

// Measured hierarchy (plan step 1, 2026-10-28): section headings, padding and
// the demo window were sized for a louder page than the hero promise allows.
const baseRule = (selector) => {
  const match = styles.match(
    new RegExp(`\\n${selector.replace(/[.[\]()]/g, '\\$&')} \\{([^}]*)\\}`),
  );
  assert.ok(match, `no base rule for ${selector}`);
  return match[1];
};
const mediaBlocks = (query) =>
  [...styles.matchAll(new RegExp(`@media \\(${query}\\) \\{`, 'g'))]
    .map((m) => styles.slice(m.index, styles.indexOf('@media', m.index + 1)))
    .join('\n');
const clampOf = (declarations, property) => {
  const match = declarations.match(
    new RegExp(
      `${property}: clamp\\(([\\d.]+)rem, ([\\d.]+)vw, ([\\d.]+)rem\\)`,
    ),
  );
  assert.ok(match, `no ${property} clamp in: ${declarations}`);
  return { min: Number(match[1]), vw: Number(match[2]), max: Number(match[3]) };
};

test('hierarchy: the hero promise is the loudest line', () => {
  // Section headings sit well below the hero h1.
  const h1 = clampOf(baseRule('.hero h1'), 'font-size');
  const h2Rule = styles.match(
    /\n\.section-intro h2,\n\.workflow-heading h2,\n\.control-statement h2,\n\.use-case-heading h2,\n\.cta-section h2 \{([^}]*)\}/,
  );
  assert.ok(h2Rule, 'no shared section h2 rule');
  const h2 = clampOf(h2Rule[1], 'font-size');
  assert.ok(h2.max <= 3.4, `section h2 max ${h2.max}rem`);
  assert.ok(h2.max < h1.max, 'section h2 max is not below the hero h1 max');
  assert.ok(h2.vw < h1.vw, 'section h2 grows faster than the hero h1');

  // Sections sit closer together; the closing call is not a full screen.
  for (const selector of [
    '.capability-section,\n.connectors,\n.use-case-section',
    '.workflow-section',
    '.control-section',
  ]) {
    const { max } = clampOf(baseRule(selector), 'padding');
    assert.ok(max <= 7.5, `${selector} padding max ${max}rem`);
  }
  const cta = clampOf(baseRule('.cta-section'), 'padding');
  assert.ok(cta.max <= 8.5, `cta padding max ${cta.max}rem`);

  // The demo window is not two-thirds empty after a scenario plays.
  const thread = baseRule('.demo-thread').match(/min-height: (\d+)px/);
  assert.ok(thread && Number(thread[1]) <= 500, 'demo-thread min-height');

  // The control cards fill the right column instead of leaving it empty, and
  // span the section again where it is one column.
  assert.match(baseRule('.boundary-grid'), /grid-column: 2;/);
  assert.match(baseRule('.boundary-grid'), /grid-template-columns: 1fr;/);
  const wide = mediaBlocks('max-width: 1180px');
  assert.match(wide, /\.boundary-grid \{[^}]*grid-column: 1 \/ -1/);
  // The statement is centred against the card stack so the section does not
  // read as a short text at the top left beside a tall column on the right.
  assert.match(baseRule('.control-statement'), /align-self: center;/);

  // The hero facts are a child of the hero grid, not of the copy, so on one
  // column they can sit under the calendar.
  const heroStart = page.indexOf('<section className="hero"');
  const heroSection = page.slice(
    heroStart,
    page.indexOf('</section>', heroStart),
  );
  const factsAt = heroSection.indexOf('<ul className="hero-facts"');
  assert.ok(factsAt > 0, 'hero facts missing from the hero');
  const before = heroSection.slice(0, factsAt);
  assert.equal(
    (before.match(/<div\b/g) ?? []).length -
      (before.match(/<\/div>/g) ?? []).length,
    0,
    'the hero facts sit inside another element of the hero',
  );
  const areas = baseRule('.hero').match(/grid-template-areas:([^;]*);/);
  assert.ok(areas, 'the hero declares no grid areas');
  const rows = [...areas[1].matchAll(/'([^']*)'/g)].map((m) =>
    m[1].trim().split(/\s+/),
  );
  assert.ok(
    rows.every((row) => row.length === 2),
    'hero areas are two columns',
  );
  assert.ok(rows.some((row) => row[0] === 'copy' && row[1] === 'visual'));
  assert.ok(rows.some((row) => row[0] === 'facts' && row[1] === 'visual'));
  const wideHero = wide.match(/\n {2}\.hero \{([^}]*)\}/);
  assert.ok(wideHero, 'the 1180px block has no hero rule');
  const wideAreas = wideHero[1].match(/grid-template-areas:([^;]*);/);
  assert.ok(wideAreas, 'the 1180px block declares no hero areas');
  assert.deepEqual(
    [...wideAreas[1].matchAll(/'([^']*)'/g)].map((m) => m[1].trim()),
    ['copy', 'visual', 'facts'],
  );
  const sidePadding = (selector) => {
    const rule = wide.match(
      new RegExp(`\\n {2}${selector.replace('.', '\\.')} \\{([^}]*)\\}`),
    );
    assert.ok(rule, `the 1180px block has no ${selector} rule`);
    return ['left', 'right'].map(
      (side) => rule[1].match(new RegExp(`padding-${side}: ([^;]+);`))?.[1],
    );
  };
  assert.deepEqual(sidePadding('.hero-facts'), sidePadding('.hero-copy'));

  // Phones (review at 390px, 2026-10-28): headings stay below the hero line,
  // the facts line up with the copy and follow the calendar closely.
  const phone = mediaBlocks('max-width: 820px');
  const phoneRule = (selector) => {
    const rule = phone.match(
      new RegExp(
        `\\n {2}${selector.replace(/[.[\]()=']/g, (c) => '\\' + c)} \\{([^}]*)\\}`,
      ),
    );
    assert.ok(rule, `the 820px block has no ${selector} rule`);
    return rule[1];
  };
  const phoneH1 = clampOf(phoneRule('.hero h1'), 'font-size');
  const phoneH2 = clampOf(phoneRule('.cta-section h2'), 'font-size');
  const at = ({ min, vw, max }, px) =>
    Math.min(Math.max(min * 16, (vw * px) / 100), max * 16);
  for (let px = 320; px <= 820; px += 10) {
    assert.ok(
      at(phoneH2, px) < at(phoneH1, px),
      `section h2 is not below the hero h1 at ${px}px`,
    );
  }
  const copySide = phoneRule('.hero-copy').match(/padding: \S+ (\S+) /)[1];
  assert.match(
    phoneRule('.hero-facts'),
    new RegExp(
      `padding-right: ${copySide};[\\s\\S]*padding-left: ${copySide};`,
    ),
  );
  for (const block of [wide, phone]) {
    assert.match(block, /\.hero-visual \{[^}]*padding: \S+ \S+ 1\.5rem;/);
  }
  assert.match(wide, /\.hero-facts \{[^}]*padding-bottom: 3rem;/);
  assert.match(
    mediaBlocks('max-width: 500px'),
    /\.day-body \{[^}]*min-height: 360px/,
  );
  // Stacked beside the statement, the control cards take their own height.
  assert.doesNotMatch(baseRule('.boundary-card'), /min-height: \d/);
  assert.match(wide, /\.boundary-card \{[^}]*min-height: 235px/);

  // The connector map: Anna's knot clearly the centre, names readable.
  const stage = baseRule('.connector-stage');
  const knot = Number(stage.match(/--knot: ([\d.]+)cqw/)[1]);
  const disc = Number(stage.match(/--disc: ([\d.]+)cqw/)[1]);
  assert.ok(knot >= 1.8 * disc, `knot ${knot}cqw against discs ${disc}cqw`);
  const label = baseRule('.connector-disc small').match(
    /font-size: ([\d.]+)rem/,
  );
  assert.ok(label && Number(label[1]) >= 0.65, 'connector label size');
  const far = baseRule(".connector-disc[data-depth='3'] small");
  assert.ok(Number(far.match(/font-size: ([\d.]+)rem/)[1]) >= 0.6);
  const phoneStage = phoneRule('.connector-stage');
  const phoneKnot = Number(phoneStage.match(/--knot: ([\d.]+)cqw/)[1]);
  const phoneDisc = Number(phoneStage.match(/--disc: ([\d.]+)cqw/)[1]);
  assert.ok(phoneKnot >= 1.6 * phoneDisc, 'phone knot against discs');
  assert.ok(
    Number(
      phoneRule('.connector-disc small').match(/font-size: ([\d.]+)rem/)[1],
    ) >= 0.6,
    'phone connector label size',
  );
  // The edge fade leaves every depth-1 and depth-2 disc and its name fully
  // opaque. Model at 1440px: a 1236px stage of 16/6, Geist Mono at 0.68em per
  // character including letter-spacing, a 1.55 line height.
  const mask = stage.match(
    /ellipse ([\d.]+)% ([\d.]+)% at ([\d.]+)% ([\d.]+)%,\s*black ([\d.]+)%/,
  );
  assert.ok(mask, 'connector mask is not an ellipse with a black stop');
  const [rx, ry, cx, cy, stop] = mask.slice(1).map(Number);
  const width = 1236;
  const height = (width * 6) / 16;
  const fontPx = Number(label[1]) * 16;
  const block = page.slice(
    page.indexOf('const connectors = ['),
    page.indexOf('] as const;', page.indexOf('const connectors = [')),
  );
  const entries = [
    ...block.matchAll(
      /name: '([^']+)',[\s\S]*?x: (\d+),\s*y: (\d+),\s*depth: (\d)/g,
    ),
  ];
  assert.equal(entries.length, 12);
  for (const [, name, x, y, depth] of entries) {
    if (Number(depth) > 2) continue;
    const face = ((disc * width) / 100) * (depth === '2' ? 0.84 : 1);
    const total = face + (0.4 * width) / 100 + fontPx * 1.55;
    const half = (total / 2 / height) * 100;
    const labelHalf = ((name.length * fontPx * 0.68) / 2 / width) * 100;
    const corners = [
      [Number(x), Number(y) - half],
      [Number(x) - labelHalf, Number(y) + half],
      [Number(x) + labelHalf, Number(y) + half],
    ];
    for (const [px, py] of corners) {
      const r = Math.hypot((px - cx) / rx, (py - cy) / ry) * 100;
      assert.ok(r <= stop, `${name} is faded by the mask (${r.toFixed(0)}%)`);
    }
  }
});

test('includes transparency and accessibility essentials', () => {
  assert.match(page, /EXAMPLE · NOT A LIVE RECORD/);
  assert.match(page, /aria-label=/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /Anna \| Anamata/);
  assert.match(layout, /description:/);
});

// Share layer and small navigation (plan step 2, 2026-10-28).
const SHARE_DESCRIPTION =
  'Anna is the digital AI assistant from Anamata that finishes recurring administration in the systems your team already uses, in Teams or Slack, and asks when a decision is yours.';
const contentBlock = (language) =>
  language === 'en'
    ? page.slice(page.indexOf('  en: {'), page.indexOf('  nl: {'))
    : page.slice(page.indexOf('  nl: {'), page.indexOf('} as const;'));

test('a shared link shows a card: production image, title and one English sentence', () => {
  assert.match(
    layout,
    /metadataBase: new URL\('https:\/\/anna-site\.anamata\.ai'\)/,
  );
  assert.ok(layout.includes(`'${SHARE_DESCRIPTION}'`), 'description string');
  assert.doesNotMatch(layout, /Meet Anna, your digital AI assistant/);
  assert.ok(layout.includes('openGraph: {'), 'no openGraph block');
  const og = layout.slice(
    layout.indexOf('openGraph: {'),
    layout.indexOf('twitter: {'),
  );
  for (const field of [
    /type: 'website'/,
    /siteName: 'Anamata'/,
    /locale: 'en_NL'/,
    /url: '\/'/,
    /images: \[/,
  ]) {
    assert.match(og, field);
  }
  for (const field of [
    /url: '\/share\/anna-1200x630\.png'/,
    /width: 1200/,
    /height: 630/,
    /alt: 'Anna by Anamata'/,
  ]) {
    assert.match(layout, field);
  }
  assert.match(
    layout,
    /twitter: \{[\s\S]*card: 'summary_large_image'[\s\S]*images: \[/,
  );
  assert.match(layout, /title: SHARE_TITLE|title: 'Anna \| Anamata'/);
  // Both URLs serve English HTML, so an alternate-language link would lie.
  assert.doesNotMatch(layout, /hreflang|alternates|languages:/);
});

test('the share image exists, is 1200 by 630 and at most 150 KB', () => {
  assert.ok(
    existsSync(new URL('../design/share/anna-share.html', import.meta.url)),
    'missing the share image template',
  );
  assert.ok(
    existsSync(new URL('../design/share/README.md', import.meta.url)),
    'missing the share image README',
  );
  const png = new URL('../public/share/anna-1200x630.png', import.meta.url);
  assert.ok(
    existsSync(png),
    'render design/share/anna-share.html to public/share/anna-1200x630.png',
  );
  const bytes = readFileSync(png);
  assert.ok(bytes.length <= 150 * 1024, `share image is ${bytes.length} bytes`);
  // PNG signature, then the IHDR width and height.
  assert.equal(bytes.toString('latin1', 1, 4), 'PNG');
  assert.equal(bytes.readUInt32BE(16), 1200);
  assert.equal(bytes.readUInt32BE(20), 630);
});

test('a ?lang=nl link opens the page in Dutch and the switch keeps the link in step', () => {
  assert.match(
    page,
    /new URLSearchParams\(window\.location\.search\)\.get\('lang'\) === 'nl'/,
  );
  assert.match(page, /setLanguage\('nl'\)/);
  assert.match(page, /window\.history\.replaceState\(/);
  assert.match(page, /searchParams\.set\('lang', 'nl'\)/);
  assert.match(page, /searchParams\.delete\('lang'\)/);
  // The html lang attribute still follows the language.
  assert.match(page, /document\.documentElement\.lang = language/);
});

test('the footer has a second row: contact, LinkedIn once known, anamata.ai, the language switch', () => {
  for (const [language, other] of [
    ['en', 'Nederlands'],
    ['nl', 'English'],
  ]) {
    const block = contentBlock(language);
    for (const label of [
      "contact: 'Contact'",
      "linkedin: 'LinkedIn'",
      "site: 'anamata.ai'",
      `otherLanguage: '${other}'`,
    ]) {
      assert.ok(block.includes(label), `${language} footer label: ${label}`);
    }
  }
  const links = readFileSync(
    new URL('../lib/site-links.ts', import.meta.url),
    'utf8',
  );
  // No invented URL: empty until the real company page is known.
  assert.match(
    links,
    /export const ANAMATA_LINKEDIN_URL: string =\s*'(https:\/\/www\.linkedin\.com\/[^']+)?';/,
  );
  const start = page.indexOf('className="footer-links"');
  assert.ok(
    start > page.indexOf('<footer>'),
    'no footer-links row in the footer',
  );
  const row = page.slice(start, page.indexOf('</footer>'));
  assert.match(
    row,
    /onClick=\{leadOpener\('contact'\)\}[\s\S]*?\{t\.footerLinks\.contact\}/,
  );
  assert.match(
    row,
    /ANAMATA_LINKEDIN_URL &&[\s\S]*?href=\{ANAMATA_LINKEDIN_URL\}[\s\S]*?\{t\.footerLinks\.linkedin\}/,
  );
  assert.match(
    row,
    /href="https:\/\/anamata\.ai"[\s\S]*?\{t\.footerLinks\.site\}/,
  );
  assert.match(
    row,
    /className="language-switch"[\s\S]*?onClick=\{switchLanguage\}[\s\S]*?\{t\.otherLanguage\}/,
  );
  assert.match(styles, /\n\.footer-links \{[^}]*grid-column: 1 \/ -1/);
});

test('early access is offered five times, each opening the lead dialog', () => {
  const uses = [...page.matchAll(/\{t\.earlyAccess\}/g)];
  assert.ok(uses.length >= 5, `t.earlyAccess used ${uses.length} times`);
  for (const use of uses) {
    const before = page.slice(Math.max(0, use.index - 400), use.index);
    assert.match(before, /onClick=\{leadOpener\('demo'\)\}/);
  }
  // A quiet link under the demo window, a ghost button after the use cases.
  const demoLink = page.indexOf('demo-cta-link');
  assert.ok(demoLink > page.indexOf('className="demo-window"'));
  assert.ok(demoLink < page.indexOf('className="use-case-section"'));
  const ghost = page.indexOf('use-case-cta');
  assert.ok(ghost > page.indexOf('className="use-case-grid"'));
  assert.ok(ghost < page.indexOf('className="capability-section"'));
  assert.match(page, /className="button button-ghost use-case-cta"/);
  assert.match(styles, /\n\.demo-cta-link \{/);
  assert.match(styles, /\n\.use-case-cta \{/);
});

test('each use case opens its own conversation in the demo', () => {
  const examples = [...page.matchAll(/examples: \[([\s\S]*?)\n\s{4}\],/g)];
  assert.equal(examples.length, 2);
  for (const [language, watch] of [
    ['en', "watchThisOne: 'Watch this one'"],
    ['nl', "watchThisOne: 'Bekijk deze'"],
  ]) {
    const block = contentBlock(language);
    assert.ok(block.includes(watch), `${language}: ${watch}`);
    const ids = [...block.matchAll(/\n\s{8}id: '([a-z-]+)'/g)].map((m) => m[1]);
    const list = block.slice(block.indexOf('examples: ['));
    const linked = [
      ...list
        .slice(0, list.indexOf('\n    ],'))
        .matchAll(/scenario: '([a-z-]+)'/g),
    ].map((m) => m[1]);
    assert.deepEqual(linked, ['week', 'leave', 'follow-up']);
    for (const id of linked) assert.ok(ids.includes(id), `no scenario ${id}`);
  }
  const card = page.slice(
    page.indexOf('<article className="use-case"'),
    page.indexOf('</article>', page.indexOf('<article className="use-case"')),
  );
  assert.match(card, /<button[\s\S]*?className="use-case-watch"/);
  assert.match(card, /data-scenario=\{example\.scenario\}/);
  assert.match(card, /\{t\.watchThisOne\}/);
  // A visually hidden scenario name gives each button its own accessible name.
  assert.match(card, /className="sr-only"[\s\S]*?\.label/);
  // Selects the scenario, brings the demo into view, focuses the tab.
  assert.match(page, /changeScenario\(id\)/);
  assert.match(page, /getElementById\('demo'\)/);
  assert.match(page, /behavior: reduceMotion \? 'instant' : 'smooth'/);
  assert.match(
    page,
    /tabRefs\.current\[id\]\?\.focus\(\{ preventScroll: true \}\)/,
  );
  assert.match(styles, /\n\.use-case-watch \{/);
  // The sticky header is 74px; the demo must land below it, not under it.
  assert.match(styles, /\.workflow-section \{[^}]*scroll-margin-top: (8|9)\d?px/);
});
