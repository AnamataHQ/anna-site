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
    page.indexOf("controlTitle: 'Anna can move"),
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
    page.indexOf("workflowTitle: 'Zie hoe"),
    page.indexOf("controlTitle: 'Anna kan werk"),
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
    "problemTitle: 'One request in Teams. Finished work in your systems.'",
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
    'when an action cannot be undone.',
    'acts without leaving a record.',
    'de acties uitvoeren die jij hebt toegestaan.',
    'niet terug te draaien is.',
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

test('the demo window is labelled Teams · Slack · Anna and carries no single-vendor logo', () => {
  const toolbar = page.slice(
    page.indexOf('className="demo-toolbar"'),
    page.indexOf('className="demo-thread"'),
  );
  assert.match(toolbar, /<AnnaMark size="avatar" \/>/);
  assert.doesNotMatch(toolbar, /microsoft-teams\.svg|slack\.svg/);
});

test('the connectors: twelve marks tied to Anna, some of the systems she works in, no tested-with list', () => {
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
  // Step 8: the ring names some of the systems, no "thousands" claim.
  assert.match(page, /ringLabel: 'Some of the systems Anna works in'/);
  assert.match(page, /ringLabel: 'Een aantal systemen waar Anna in werkt'/);
  assert.doesNotMatch(page, /Among thousands|duizenden koppelingen/);
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
    /className="connector-knot"[\s\S]{0,400}<AnnaMark size="hub"/,
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
    'contrast-section',
    'connectors',
    'control-section',
    'faq-section',
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
    "examplesTitle: 'Three things to hand to Anna first.'",
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

  // The control cards sit two by two under the statement, and span the
  // section again where it is one column.
  assert.match(baseRule('.boundary-grid'), /grid-area: cards;/);
  assert.match(
    baseRule('.boundary-grid'),
    /grid-template-columns: repeat\(2, 1fr\);/,
  );
  const wide = mediaBlocks('max-width: 1180px');
  assert.match(wide, /\.boundary-grid \{[^}]*grid-column: 1 \/ -1/);
  // The example's bottom edge lines up with the cards' bottom edge, so it
  // sits on the same line as the cards instead of floating between rows.
  assert.match(baseRule('.control-example'), /align-self: end;/);
  assert.doesNotMatch(baseRule('.control-example'), /align-self: (center|start)/);
  // In one column the example spans the section like the cards; the bubbles
  // are capped so the lines stay readable in a wide window.
  assert.match(wide, /\.control-example \{[^}]*max-width: none/);
  assert.doesNotMatch(wide, /\.control-example \{[^}]*justify-self: start/);
  assert.match(wide, /\.control-message \.message-bubble \{[^}]*max-width: \d+px/);
  assert.doesNotMatch(baseRule('.control-statement'), /align-self/);

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
  // Two per row at every width above phones, the control cards take their
  // own height (the 235px floor from step 1 went with the stacked column).
  assert.doesNotMatch(baseRule('.boundary-card'), /min-height: \d/);
  assert.doesNotMatch(wide, /\.boundary-card \{[^}]*min-height: \d/);

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

// Anna as a character (plan step 3, 2026-10-28): one mark everywhere, a
// working state with generic system glyphs, a done check, the tab icon on navy.
const annaMarkUrl = new URL('../components/anna-mark.tsx', import.meta.url);

test('one Anna: the gradient mark on a paper disc at three sizes, wherever she appears', () => {
  assert.ok(existsSync(annaMarkUrl), 'components/anna-mark.tsx is missing');
  const mark = readFileSync(annaMarkUrl, 'utf8');
  for (const name of ['avatar', 'opener', 'hub', 'idle', 'working', 'done']) {
    assert.match(mark, new RegExp(`'${name}'`), `AnnaMark lacks ${name}`);
  }
  assert.match(mark, /from 'next\/image'/);
  assert.match(mark, /src="\/brands\/anna-color-transparent\.svg"/);
  assert.match(mark, /aria-hidden="true"/);
  assert.match(mark, /className="typing-dots"/);
  assert.match(mark, /className="anna-mark-check"/);
  assert.match(page, /from '@\/components\/anna-mark'/);
  assert.match(hero, /from '@\/components\/anna-mark'/);
  // Every other mark goes: the eyebrow keeps the 14 px mono mark, too small for a disc.
  assert.doesNotMatch(page, /anna-mono-dark\.svg/);
  assert.doesNotMatch(hero, /anna-mono-dark\.svg/);
  assert.equal([...page.matchAll(/anna-mono-light\.svg/g)].length, 1);
  assert.match(
    page,
    /className="hero-eyebrow">\s*<Image\s+src="\/brands\/anna-mono-light\.svg"/,
  );
  assert.doesNotMatch(page, /anna-color-navy\.svg/);
  assert.doesNotMatch(page, /anna-color-transparent\.svg/);
  // Where she appears.
  assert.match(
    page,
    /className="site-header"[\s\S]{0,200}<AnnaMark size="avatar"/,
  );
  assert.match(
    page,
    /className="brand footer-brand"[\s\S]{0,80}<AnnaMark size="avatar"/,
  );
  assert.match(page, /function DemoMessage[\s\S]*?<AnnaMark size="avatar"/);
  assert.match(
    page,
    /className="capability-section"[\s\S]{0,240}<AnnaMark size="opener"/,
  );
  assert.match(
    page,
    /className="control-statement">\s*<AnnaMark size="opener"/,
  );
  // One shared set of rules: a paper disc, three sizes, the dots, the coral check.
  assert.match(
    styles,
    /\.anna-mark \{[^}]*border-radius: 50%;[^}]*background: var\(--paper-light\)/,
  );
  for (const size of ['avatar', 'opener', 'hub']) {
    assert.match(styles, new RegExp(`\\.anna-mark\\[data-size='${size}'\\]`));
  }
  assert.match(styles, /\.anna-mark-check \{[^}]*background: var\(--coral\)/);
  assert.ok(
    styles.indexOf('.typing-dots {') < styles.indexOf('.demo-toolbar {'),
    'the typing dots still live in the demo CSS',
  );
  assert.equal([...styles.matchAll(/^\.typing-dots \{/gm)].length, 1);
  assert.doesNotMatch(styles, /\.brand-mark|\.anna-tray-mark|\.avatar\.anna/);
});

test('while Anna carries out the reply, a row of generic system glyphs names her sources', () => {
  const executing = page.slice(
    page.indexOf('className="executing-line"'),
    page.indexOf('className="record-list"'),
  );
  assert.match(executing, /isExecuting && \(/);
  assert.match(executing, /className="working-sources"/);
  assert.match(executing, /scenario\.sources\.map\(/);
  assert.equal([...executing.matchAll(/\.map\(/g)].length, 1);
  assert.match(page, /state=\{\s*isExecuting\s*\?\s*'working'/);
  // A glyph per kind of system, mapped from the strings already in the data,
  // with a neutral dot for anything unmapped. No new copy.
  const glyphs = page.slice(
    page.indexOf('const SOURCE_GLYPHS'),
    page.indexOf('];', page.indexOf('const SOURCE_GLYPHS')),
  );
  assert.ok(glyphs.length > 0, 'SOURCE_GLYPHS is missing');
  const sources = new Set();
  for (const [, list] of page.matchAll(/sources: \[([^\]]*)\]/g)) {
    for (const [, name] of list.matchAll(/'([^']+)'/g)) sources.add(name);
  }
  assert.ok(sources.size >= 15, `only ${sources.size} source names found`);
  for (const name of sources) {
    assert.ok(glyphs.includes(`'${name}'`), `no glyph for source: ${name}`);
  }
  assert.match(page, /className="source-dot"/);
  // No vendor logos while she works: nothing from /brands/ in the conversation.
  const thread = page.slice(
    page.indexOf('className="demo-thread"'),
    page.indexOf('className="record-list"'),
  );
  assert.doesNotMatch(thread, /\/brands\//);
  assert.doesNotMatch(glyphs, /\/brands\/|ClockWise|Loket|HubSpot|Jira|Notion/);
});

test('the demo toolbar names both channels: Teams · Slack · Anna', () => {
  assert.equal(
    [...page.matchAll(/demoChannel: 'Teams · Slack · Anna'/g)].length,
    2,
  );
  assert.doesNotMatch(page, /demoChannel: 'Microsoft Teams · Anna'/);
});

test('the browser tab shows the same mark on a navy rounded tile', () => {
  assert.match(favicon, /<rect[^>]*rx="\d+"[^>]*fill="#08152e"/i);
  const glyph = annaColourTransparent.match(/<path[^>]*\sd="([^"]+)"/);
  assert.ok(glyph, 'no mark path in anna-color-transparent.svg');
  assert.ok(
    favicon.includes(`d="${glyph[1]}"`),
    'favicon mark geometry changed',
  );
  assert.match(favicon, /fill="url\(#relay-gradient\)"/);
});

test('steps 3 to 8 together add at most 16 KB to index.html', () => {
  const index = new URL('../dist/client/index.html', import.meta.url);
  if (!existsSync(index)) return;
  // 64 010 bytes on main at ba508d6, before step 3. Step 3 +1.2 KB, step 4
  // +1.9 KB, step 5 +1.0 KB, step 6 +4.0 KB (72 095), step 7 +4.0 KB
  // (76 119). The 90 KB budget is asserted in cleared-day.test.mjs; this
  // keeps the copy steps honest below it.
  const size = readFileSync(index).length;
  assert.ok(size <= 64_010 + 16_384, `index.html is ${size} bytes`);
});

// "How Anna works" filled (plan step 4, 2026-10-29): each step card carries a
// small artefact that mirrors the demo, built only from copy already on the page.
const capabilityMap = () => {
  const start = page.indexOf('{t.capabilities.map(');
  assert.ok(
    start > 0,
    'the capability cards are not a map over t.capabilities',
  );
  const end = page.indexOf('</article>', start);
  assert.ok(end > start, 'the capability map renders no article');
  return page.slice(start, end);
};
const capabilityArtefact = () => {
  const body = capabilityMap();
  const start = body.indexOf('<figure className="capability-artefact"');
  assert.ok(start > 0, 'no capability-artefact figure in the card');
  return body.slice(start, body.indexOf('</figure>', start));
};

test('each step card shows a decorative artefact between its number and its text', () => {
  const body = capabilityMap();
  assert.match(body, /<article className="capability-card"/);
  assert.match(
    body,
    /className="capability-number"[\s\S]*?<figure className="capability-artefact" aria-hidden="true"[\s\S]*?<\/figure>[\s\S]*?<h3>\{capability\.title\}<\/h3>/,
  );
  assert.match(page, /const demo = t\.scenarios\[0\];/);
  assert.match(page, /const first = t\.examples\[0\];/);
  // The artefacts follow the "week" scenario in both languages.
  for (const [, id] of page.matchAll(/scenarios: \[\s*\{\s*id: '([^']+)'/g)) {
    assert.equal(id, 'week');
  }
  for (const [, id] of page.matchAll(
    /examples: \[\s*\{\s*tray: \d,\s*scenario: '([^']+)'/g,
  )) {
    assert.equal(id, 'week');
  }
});

test('the step artefacts add no new copy: no JSX text, and quoted strings only as class names or state tokens', () => {
  // Between a tag's ">" and the next "<" there is only whitespace or a
  // {expression}; arrows ("=>") are removed first so they do not read as tags.
  const artefact = capabilityArtefact().replace(/=>/g, '');
  const text = artefact.match(/>\s*[^<>{}\s][^<>{}]*</);
  assert.equal(text, null, `JSX text in the artefact: ${text?.[0]}`);
  // Every quoted string is the value of a non-readable attribute (className,
  // aria-hidden, size, state, data-*) and a lowercase token list; no other
  // string literal, template literal or readable attribute (alt, title, aria-label).
  const attributes = [...artefact.matchAll(/([\w-]+)=("[^"]*"|'[^']*')/g)];
  for (const [, name, value] of attributes) {
    assert.match(name, /^(className|aria-hidden|size|state|data-[\w-]+)$/);
    assert.match(value, /^["'][a-z0-9-]+( [a-z0-9-]+)*["']$/);
  }
  const rest = artefact.replace(/([\w-]+)=("[^"]*"|'[^']*')/g, '');
  assert.doesNotMatch(rest, /["'`]/, 'a string literal outside an attribute');
  // The words come from existing translation keys.
  for (const expression of [
    /\{demo\.who\}/,
    /\{demo\.who\[0\]\}/,
    /\{first\.ask\}/,
    /\{t\.working\}/,
    /\{t\.record\}/,
  ]) {
    assert.match(artefact, expression);
  }
});

test('step 01 is the ask, 02 Anna working on generic glyphs, 03 her record without an hours figure', () => {
  const artefact = capabilityArtefact();
  // 01: the person's message, as in the demo.
  assert.match(
    artefact,
    /className="avatar person"[^>]*>\s*\{demo\.who\[0\]\}/,
  );
  assert.match(artefact, /className="message-bubble"[^>]*>\s*\{first\.ask\}/);
  // 02: the working mark, the working line with dots, the sources as glyphs.
  assert.match(artefact, /<AnnaMark size="avatar" state="working" \/>/);
  assert.match(
    artefact,
    /\{t\.working\}[\s\S]{0,120}className="typing-dots"[^>]*>\s*<i \/>\s*<i \/>\s*<i \/>/,
  );
  assert.match(
    artefact,
    /<ul className="working-sources">\s*\{demo\.sources\.map\(\(source\) => \(\s*<li key=\{source\}>\s*<SourceGlyph source=\{source\} \/>\s*\{source\}/,
  );
  // 03: the done mark and "What Anna did", minus the line with the hours.
  assert.match(artefact, /<AnnaMark size="avatar" state="done" \/>/);
  assert.match(artefact, /<LockKeyhole[^>]*\/>\s*\{t\.record\}/);
  assert.match(artefact, /\{demo\.record\.slice\(1\)\.map\(/);
  assert.doesNotMatch(artefact, /demo\.record\.map|record\[0\]/);
  // The line left out is the only one with an hours figure, in both languages.
  const weeks = [
    ...page.matchAll(/id: 'week',[\s\S]*?record: \[([\s\S]*?)\]/g),
  ].map(([, list]) => [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]));
  assert.equal(weeks.length, 2);
  for (const lines of weeks) {
    assert.match(lines[0], /\d+ [hu]\b/);
    for (const line of lines.slice(1)) assert.doesNotMatch(line, /\d+ [hu]\b/);
  }
});

test('the step cards take their own height and lose the trailing chevron', () => {
  const minHeight = (rule) => {
    const match = rule?.match(/min-height: (\d+)px/);
    return match ? Number(match[1]) : 0;
  };
  assert.ok(
    minHeight(baseRule('.capability-card')) <= 280,
    'capability-card min-height',
  );
  const phone = mediaBlocks('max-width: 820px').match(
    /\n {2}\.capability-card \{([^}]*)\}/,
  );
  assert.ok(minHeight(phone?.[1]) <= 280, 'phone capability-card min-height');
  assert.doesNotMatch(styles, /\.capability-card > svg/);
  assert.doesNotMatch(capabilityMap(), /ChevronRight/);
  // The artefact is a paper panel with a hairline border, not a picture.
  const artefact = baseRule('.capability-artefact');
  assert.match(artefact, /background: var\(--paper-light\)/);
  assert.match(artefact, /border: 1px solid var\(--line\)/);
  assert.doesNotMatch(capabilityArtefact(), /<Image|<img|\/hero\/|\.webp/);
});

// Early access defined (plan step 5, copy approved 2026-10-30).
const EARLY_ACCESS = {
  en: {
    trust: 'Now in early access · 2026',
    ctaKicker: 'Now in early access · 2026',
    ctaBody:
      "Anna is in early access. We are starting with a small group of companies. Tell us which recurring tasks eat your team’s week. We reply within two working days, go through those tasks with you and show how Anna would take them on.",
    ctaSteps: [
      'You name the tasks',
      'We go through them with you and show how Anna handles them',
      'Together we decide whether Anna is a fit, and where she starts',
    ],
    ctaAsk:
      'What we ask of you: a conversation, and one person who knows the work.',
    ctaGet:
      'What you get: a clear view of what Anna would do in your week, before anything is connected.',
    heroNote: 'Reply within two working days.',
    footerLine:
      'Anna is built in the Netherlands by Anamata, a quality engineering and testing company from Utrecht.',
  },
  nl: {
    trust: 'Nu in vroege toegang · 2026',
    ctaKicker: 'Nu in vroege toegang · 2026',
    ctaBody:
      'Anna is in vroege toegang. We beginnen met een kleine groep bedrijven. Vertel ons welke terugkerende taken de week van je team opslokken. We reageren binnen twee werkdagen, lopen die taken met je door en laten zien hoe Anna ze zou oppakken.',
    ctaSteps: [
      'Jij noemt de taken',
      'We lopen ze met je door en laten zien hoe Anna ze aanpakt',
      'Samen bepalen we of Anna past, en waar ze begint',
    ],
    ctaAsk:
      'Wat we van jou vragen: een gesprek, en één collega die het werk kent.',
    ctaGet:
      'Wat je krijgt: een helder beeld van wat Anna in jouw week zou doen, voordat er iets gekoppeld wordt.',
    heroNote: 'Antwoord binnen twee werkdagen.',
    footerLine:
      'Anna wordt in Nederland gebouwd door Anamata, een bedrijf voor quality engineering en softwaretesten uit Utrecht.',
  },
};

// Every quoted string literal in a piece of source, unescaped. Keys
// (`demoLabel:`) are not quoted, so they never appear here.
const STRING_LITERAL =
  /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
const stringValues = (source) =>
  [...source.matchAll(STRING_LITERAL)].map(([, single, double, template]) =>
    (single ?? double ?? template).replace(/\\(.)/g, '$1'),
  );
// The value of a top-level copy key (four-space indent) in one language: its
// source runs up to the next top-level key or the end of the language object.
const copyValue = (language, key) => {
  const block = contentBlock(language);
  const start = block.search(new RegExp(`\\n {4}${key}:`));
  if (start < 0) return undefined;
  const rest = block.slice(start + 1);
  const end = rest.slice(1).search(/\n {4}[A-Za-z]+:|\n {2}\}/);
  return rest.slice(0, end < 0 ? undefined : end + 1);
};
const withoutKeys = (language, keys) => {
  let block = contentBlock(language);
  for (const key of keys) {
    const value = copyValue(language, key);
    if (value) block = block.replace(value, '');
  }
  return block;
};
const ctaSection = () =>
  page.slice(
    page.indexOf('<section className="cta-section"'),
    page.indexOf(
      '</section>',
      page.indexOf('<section className="cta-section"'),
    ),
  );

test('early access is defined: badge, kicker, body, three steps, what we ask and give', () => {
  for (const [language, copy] of Object.entries(EARLY_ACCESS)) {
    for (const [key, expected] of Object.entries(copy)) {
      const source = copyValue(language, key);
      assert.ok(source, `${language}: no ${key}`);
      const values = stringValues(source);
      if (Array.isArray(expected))
        assert.deepEqual(values, expected, `${language}: ${key}`);
      else assert.deepEqual(values, [expected], `${language}: ${key}`);
    }
  }
});

test('the hero note sits right under the badge, the steps and the ask in the closing section', () => {
  assert.match(
    page,
    /<p className="hero-trust">\{t\.trust\}<\/p>\s*<p className="hero-note">\{t\.heroNote\}<\/p>/,
  );
  const cta = ctaSection();
  const body = cta.indexOf('<p>{t.ctaBody}</p>');
  const steps = cta.indexOf('<ol className="cta-steps">');
  const actions = cta.indexOf('className="cta-actions"');
  const note = cta.indexOf('<p className="cta-note">');
  assert.ok(body >= 0, 'body paragraph');
  assert.ok(steps > body, 'steps follow the body');
  assert.ok(actions > steps, 'buttons follow the steps');
  assert.ok(note > actions, 'the note follows the buttons');
  const list = cta.slice(steps, cta.indexOf('</ol>', steps));
  assert.match(list, /t\.ctaSteps\.map\(/);
  assert.match(list, /<li className="cta-step"/);
  // The numbers are presentation, zero-padded from the index, not copy.
  assert.match(list, /<span className="cta-step-number"/);
  assert.match(list, /String\(index \+ 1\)\.padStart\(2, '0'\)/);
  assert.match(
    cta,
    /<p className="cta-note">\s*\{t\.ctaAsk\} \{t\.ctaGet\}\s*<\/p>/,
  );
  assert.match(page, /<strong>\{t\.footerLine\}<\/strong>/);
});

test('the closing section stacks the steps on phones and uses the coral step numbers', () => {
  assert.match(
    baseRule('.cta-steps'),
    /grid-template-columns: repeat\(3, 1fr\)/,
  );
  assert.match(
    mediaBlocks('max-width: 640px'),
    /\n {2}\.cta-steps \{[^}]*grid-template-columns: 1fr/,
  );
  assert.match(
    styles,
    /\.capability-number,\n\.cta-step-number \{[^}]*color: #c23a22/,
  );
  assert.match(baseRule('.hero-note'), /font-size: 0\.85rem/);
  assert.match(baseRule('.cta-note'), /max-width: 56ch/);
});

test('no hours-saved figure in the copy outside the demo scenarios and the control example', () => {
  for (const language of ['en', 'nl']) {
    const rest = withoutKeys(language, ['scenarios', 'controlExample']);
    assert.ok(!rest.includes('scenarios: ['), `${language}: scenarios sliced`);
    assert.doesNotMatch(rest, /\d+\s?(h|u|hours|hour|uur)\b/, language);
  }
});

test('no demo or booking wording in the copy values', () => {
  const values = [
    ...stringValues(contentBlock('en')),
    ...stringValues(contentBlock('nl')),
  ];
  assert.ok(values.length > 100, 'copy values found');
  for (const value of values) {
    for (const word of [/\bdemo\b/i, /\bbooking\b/i, /\bbook a\b/i])
      assert.doesNotMatch(value, word);
  }
  // The guard reads values, not words that merely contain "book".
  assert.ok(!/\bbook a\b/i.test('handbook and'));
});

// Step 6, "You stay in control" (approved copy, step6-gate.md, 2026-10-30).
const CONTROL = {
  en: {
    controlBody:
      'Your admin decides, per person or per role, which systems Anna may use and what she may do in them. Anna works within that, asks when a judgement is yours, and leaves a record of every completed action.',
    boundaryCards: [
      'Anna does',
      'Collects what is needed, prepares the work and carries out the actions you have allowed.',
      'Anna asks',
      'When something is missing, when a call is yours to make, when she is not sure, or when an action cannot be undone.',
      'Anna never',
      'Takes a decision that is yours, goes beyond the access your admin gave her, or acts without leaving a record.',
      'Access is set by your admin',
      'Per person or per role. A licence never gives Anna more than your admin granted.',
    ],
    controlFacts: [
      'Rights per system, set by your admin',
      'Every completed action in a record',
      'Sends every message in her own name, never as you',
    ],
    controlPrivacy:
      'What you discuss with Anna stays yours. Your colleagues have their own Anna and do not see your requests, your hours or your leave.',
    controlExample: [
      'colleague',
      'Can you move last week’s Tuesday hours from the Rotterdam project to the Utrecht one?',
      'anna',
      'Last week has 6 h on Rotterdam on Tuesday. That week is already approved, so moving them changes an approved sheet and your manager sees a correction. That call is yours. Shall I move the 6 h and resubmit the week?',
      'colleague',
      'Yes, do it.',
      'anna',
      'Done. Week resubmitted with the correction; it is in the record.',
    ],
  },
  nl: {
    controlBody:
      'Je beheerder bepaalt per persoon of per rol welke systemen Anna mag gebruiken en wat ze erin mag doen. Daarbinnen werkt Anna, vraagt ze het jou als een oordeel van jou is, en laat ze van elke afgeronde actie een verslag achter.',
    boundaryCards: [
      'Anna doet',
      'Verzamelen wat nodig is, het werk voorbereiden en de acties uitvoeren die jij hebt toegestaan.',
      'Anna vraagt',
      'Als iets ontbreekt, als een keuze aan jou is, als ze het niet zeker weet, of als een actie niet terug te draaien is.',
      'Anna doet nooit',
      'Een besluit nemen dat van jou is, verder gaan dan de toegang die je beheerder gaf, of handelen zonder een verslag achter te laten.',
      'Toegang stelt je beheerder in',
      'Per persoon of per rol. Een licentie geeft Anna nooit meer dan je beheerder heeft toegestaan.',
    ],
    controlFacts: [
      'Rechten per systeem, ingesteld door je beheerder',
      'Elke afgeronde actie in een verslag',
      'Verstuurt elk bericht onder haar eigen naam, nooit als jij',
    ],
    controlPrivacy:
      'Wat jij met Anna bespreekt, blijft van jou. Je collega’s hebben hun eigen Anna en zien jouw verzoeken, uren of verlof niet.',
    controlExample: [
      'colleague',
      'Kun je de uren van vorige week dinsdag van het Rotterdam-project naar Utrecht zetten?',
      'anna',
      'Vorige week staat 6 u op Rotterdam op dinsdag. Die week is al goedgekeurd, dus verplaatsen wijzigt een goedgekeurde staat en je manager ziet een correctie. Die keuze is aan jou. Zal ik de 6 u verplaatsen en de week opnieuw indienen?',
      'colleague',
      'Ja, doe maar.',
      'anna',
      'Gedaan. Week opnieuw ingediend met de correctie; het staat in het verslag.',
    ],
  },
};
const controlSection = () => {
  const start = page.indexOf('className="control-section"');
  return page.slice(start, page.indexOf('</section>', start));
};
const controlExampleMarkup = () => {
  const section = controlSection();
  const start = section.indexOf('<figure className="control-example"');
  return section.slice(start, section.indexOf('</figure>', start));
};

test('control copy is the approved text: body, four cards, checklist, privacy line, example', () => {
  for (const [language, copy] of Object.entries(CONTROL)) {
    for (const [key, expected] of Object.entries(copy)) {
      const source = copyValue(language, key);
      assert.ok(source, `${language}: no ${key}`);
      const values = stringValues(source);
      if (Array.isArray(expected))
        assert.deepEqual(values, expected, `${language}: ${key}`);
      else assert.deepEqual(values, [expected], `${language}: ${key}`);
    }
    assert.match(
      copyValue(language, 'controlBody'),
      language === 'en' ? /admin/ : /beheerder/,
    );
  }
});

test('the control example: colleague and Anna in turn, Anna asks before she acts, no colleague status', () => {
  for (const language of ['en', 'nl']) {
    const values = stringValues(copyValue(language, 'controlExample'));
    const senders = values.filter((_, index) => index % 2 === 0);
    const texts = values.filter((_, index) => index % 2 === 1);
    assert.deepEqual(senders, ['colleague', 'anna', 'colleague', 'anna']);
    assert.equal(texts.length, 4);
    // Her first message asks; nothing is done or resubmitted yet.
    assert.doesNotMatch(
      texts[1],
      /\bDone\b|\bGedaan\b|resubmitted|opnieuw ingediend/,
    );
    assert.match(texts[1], language === 'en' ? /Shall I/ : /Zal ik/);
    // No sentence about any colleague's status anywhere in the control copy.
    for (const key of [
      'controlBody',
      'boundaryCards',
      'controlFacts',
      'controlPrivacy',
      'controlExample',
    ])
      assert.doesNotMatch(
        copyValue(language, key),
        /team is off|team is vrij/,
        `${language}: ${key}`,
      );
  }
  assert.doesNotMatch(controlSection(), /team is off|team is vrij/);
});

test('the control example renders as a static labelled figure with the demo bubbles', () => {
  const figure = controlExampleMarkup();
  assert.ok(figure, 'no control-example figure');
  assert.match(
    figure,
    /<figure className="control-example" aria-label=\{t\.demoLabel\}>/,
  );
  // The same label the demo carries, so it never reads as a real record.
  assert.match(figure, /<span>\{t\.demoLabel\}<\/span>/);
  assert.match(figure, /\{t\.controlExample\.map\(/);
  assert.match(
    figure,
    /<div\s+className="control-message"\s+data-sender=\{m\.sender\}/,
  );
  assert.match(figure, /className="message-bubble"/);
  // The colleague is the demo's first asker; no name is typed here.
  assert.match(page, /const demo = t\.scenarios\[0\];/);
  assert.match(figure, /className="avatar person"[^>]*>\s*\{demo\.who\[0\]\}/);
  assert.match(figure, /className="message-who">[^<]*\bdemo\.who\}/);
  for (const name of [...page.matchAll(/who: '([^']+)'/g)].map((m) => m[1]))
    assert.ok(!figure.includes(`'${name}'`), `name literal: ${name}`);
  assert.doesNotMatch(figure, /'(?!Anna')[A-Z][a-z]+'/);
  // Anna's mark beside her messages; the done check on the last one only.
  assert.match(figure, /<AnnaMark size="avatar" \/>/);
  assert.equal([...figure.matchAll(/state="done"/g)].length, 1);
  assert.match(
    figure,
    /index === t\.controlExample\.length - 1 \? \(\s*<AnnaMark size="avatar" state="done" \/>/,
  );
  // Static: no animation state, no typing dots, no working mark.
  assert.doesNotMatch(figure, /typing-dots|state="working"|data-visible/);
});

test('control layout: example under the statement, four cards, then checklist and privacy line', () => {
  const section = controlSection();
  const statement = section.indexOf('className="control-statement"');
  const example = section.indexOf('<figure className="control-example"');
  const grid = section.indexOf('className="boundary-grid"');
  const facts = section.indexOf('<ul className="control-facts">');
  const privacy = section.indexOf('<p className="control-privacy">');
  assert.ok(statement >= 0 && example > statement, 'example after statement');
  assert.ok(grid > example, 'cards after the example');
  assert.ok(facts > grid, 'checklist after the cards');
  assert.ok(privacy > facts, 'privacy line after the checklist');
  const list = section.slice(facts, section.indexOf('</ul>', facts));
  assert.match(list, /t\.controlFacts\.map\(/);
  assert.match(
    list,
    /<li key=\{fact\}>\s*<Check size=\{14\} aria-hidden="true" \/>/,
  );
  assert.match(
    section,
    /<p className="control-privacy">\{t\.controlPrivacy\}<\/p>/,
  );
  // A fourth icon for the fourth card.
  assert.match(
    section,
    /index === 2 \? \(\s*<ShieldCheck aria-hidden="true" \/>\s*\) : \(\s*<KeyRound aria-hidden="true" \/>/,
  );

  // Statement over the cards on the left, the example beside both, notes
  // under both; the DOM order (statement, example, cards, notes) is what
  // phones see.
  assert.match(
    baseRule('.control-section'),
    /grid-template-areas:\s*'statement example'\s*'cards example'\s*'notes notes';/,
  );
  assert.match(baseRule('.control-statement'), /grid-area: statement;/);
  assert.match(baseRule('.boundary-grid'), /align-self: start;/);
  assert.match(baseRule('.control-example'), /grid-area: example;/);
  assert.match(baseRule('.control-example'), /max-width: 590px;/);
  assert.match(baseRule('.control-notes'), /grid-area: notes;/);
  // Two by two, no single card darker than the others.
  assert.doesNotMatch(styles, /\.boundary-card:last-child/);
  // The checklist shares the hero facts' coral check.
  assert.match(
    styles,
    /\.hero-facts svg,\n\.control-facts svg \{[^}]*color: var\(--coral\)/,
  );
  // Light text on the navy section.
  assert.match(baseRule('.control-facts'), /color: #c7d0e2;/);
  assert.match(baseRule('.control-privacy'), /color: #aab8d4;/);
  const wide = mediaBlocks('max-width: 1180px');
  // One column in DOM order on the tablet width, cards still two by two;
  // one card per row on phones.
  assert.match(
    wide,
    /\.control-section \{[^}]*grid-template-areas:\s*'statement'\s*'example'\s*'cards'\s*'notes';/,
  );
  assert.doesNotMatch(wide, /\.boundary-grid \{[^}]*grid-template-columns/);
  assert.match(
    mediaBlocks('max-width: 820px'),
    /\.boundary-grid \{[^}]*grid-template-columns: 1fr/,
  );
});

// Step 7, the contrast block, repeat work and the FAQ
// (approved copy, step7-gate.md, 2026-10-30).
const STEP7 = {
  en: {
    contrastTitle: 'A chatbot tells you how. Anna does it, in your systems.',
    contrastBody:
      'Writing tools draft the email and leave the rest to you. Anna writes the hours in your time tracking, files the leave in your HR system and logs the follow-up on the deal. Only with the rights your admin gave her, and with a record of every action. You keep the tools you have. Anna finishes the admin in them.',
    problemBodyEnd:
      'Anna can remind you and the team on a schedule, every Friday or every month-end. She works from your own policies and handbook, and how your team does things is set up together with your admin.',
    faqTitle: 'Questions and answers',
    faq: [
      'Is Anna a chatbot?',
      'No. You talk to her in Teams or Slack, but the work happens in your systems: she writes the hours, files the leave, logs the follow-up. A chat window gives you text. Anna gives you a finished task and a record of it.',
      'Which systems does she work in today?',
      'Today: ClockWise, Claim a Seat, Notion and HubSpot, plus systems with a standard sign-in. Loket and Microsoft 365 follow soon. Anything else with a workable API can follow: Anamata builds the connection during onboarding, with no developer needed on your side.',
      'Who decides what Anna may access and do?',
      'Your admin, per person or per role, per system. Your admin adds Anna to Teams or Slack through the Microsoft 365 admin centre or the Slack settings: a short configuration that needs their approval. They can cut a connection or switch Anna off at any moment; the record of what she did stays.',
      'Which AI is behind Anna, and who can see our data?',
      'The model setup behind Anna is agreed with your company; Anamata manages it, and your admin’s rights apply to everything Anna reads or does. Your data is not used to train models, not by Anamata and not by the model providers we contract. In group chats Anna reads along by default so she can pick up requests; she says so when she is added, and any group can switch that off. Your IT or security lead can ask us anything before a single system is connected; we answer in writing.',
      'Can my colleagues see what I ask Anna?',
      'No. Each person has their own Anna. Colleagues do not see your requests, your hours or your leave. What lands in a shared system, such as a submitted hoursheet, follows that system’s own rights, as it does today.',
      'What happens when she is wrong or unsure, and where do I see what she did?',
      'She shows her work before anything is submitted, says so when she is unsure, and tells you plainly when a task is outside what she can do. Every completed action is in the record, for you and for your admin.',
      'Does she work in Dutch?',
      'Yes. Ask her in Dutch or English; she answers in the language you use.',
      'What does early access involve, and what does Anna cost?',
      'You tell us which recurring tasks eat your team’s week. We reply within two working days, go through those tasks with you and show how Anna would take them on. Together we decide whether she is a fit and where she starts. Pricing is agreed per company during early access and shared with you before anything is connected.',
    ],
  },
  nl: {
    contrastTitle:
      'Een chatbot vertelt je hoe. Anna doet het, in jouw systemen.',
    contrastBody:
      'Schrijfhulpen maken de mail en laten de rest aan jou. Anna boekt de uren in je urenregistratie, dient het verlof in je HR-systeem in en legt de opvolging vast op de deal. Alleen met de rechten die je beheerder haar gaf, en met een verslag van elke actie. Je houdt de programma’s die je hebt. Anna maakt de administratie erin af.',
    problemBodyEnd:
      'Anna kan jou en het team op een vast moment herinneren, elke vrijdag of elke maandafsluiting. Ze werkt vanuit jullie eigen beleid en handboek, en hoe jullie team het doet wordt samen met je beheerder ingesteld.',
    faqTitle: 'Vragen en antwoorden',
    faq: [
      'Is Anna een chatbot?',
      'Nee. Je praat met haar in Teams of Slack, maar het werk gebeurt in jouw systemen: ze boekt de uren, dient het verlof in, legt de opvolging vast. Een chatvenster geeft je tekst. Anna geeft je een afgeronde taak en een verslag ervan.',
      'In welke systemen werkt ze vandaag?',
      'Vandaag: ClockWise, Claim a Seat, Notion en HubSpot, plus systemen met een standaard inlog. Loket en Microsoft 365 volgen binnenkort. Al het andere met een bruikbare API kan volgen: Anamata bouwt de koppeling tijdens de onboarding, zonder dat je er een ontwikkelaar voor nodig hebt.',
      'Wie bepaalt waar Anna bij mag en wat ze mag doen?',
      'Je beheerder, per persoon of per rol, per systeem. Je beheerder voegt Anna toe aan Teams of Slack via het Microsoft 365-beheercentrum of de Slack-instellingen: een korte configuratie waar hun goedkeuring voor nodig is. Ze kunnen een koppeling op elk moment verbreken of Anna uitzetten; het verslag van wat ze deed blijft.',
      'Welke AI zit achter Anna, en wie kan onze gegevens zien?',
      'De modelopstelling achter Anna spreken we met jullie bedrijf af; Anamata beheert die, en de rechten van je beheerder gelden voor alles wat Anna leest of doet. Jullie gegevens worden niet gebruikt om modellen te trainen, niet door Anamata en niet door de modelleveranciers waarmee wij werken. In groepsgesprekken leest Anna standaard mee zodat ze verzoeken kan oppakken; ze zegt dat als ze wordt toegevoegd, en elke groep kan dat uitzetten. Je IT’er of security-verantwoordelijke kan ons alles vragen voordat er één systeem gekoppeld wordt; we antwoorden schriftelijk.',
      'Kunnen mijn collega’s zien wat ik Anna vraag?',
      'Nee. Iedereen heeft een eigen Anna. Collega’s zien jouw verzoeken, uren of verlof niet. Wat in een gedeeld systeem terechtkomt, zoals een ingediende urenstaat, volgt de rechten van dat systeem, net als nu.',
      'Wat gebeurt er als ze het mis heeft of twijfelt, en waar zie ik wat ze deed?',
      'Ze laat haar werk zien voordat iets wordt ingediend, zegt het als ze twijfelt, en zegt eerlijk wanneer een taak buiten haar kunnen valt. Elke afgeronde actie staat in het verslag, voor jou en voor je beheerder.',
      'Werkt ze in het Nederlands?',
      'Ja. Stel je vraag in het Nederlands of Engels; ze antwoordt in de taal die jij gebruikt.',
      'Wat houdt vroege toegang in, en wat kost Anna?',
      'Je vertelt ons welke terugkerende taken de week van je team opslokken. We reageren binnen twee werkdagen, lopen die taken met je door en laten zien hoe Anna ze zou oppakken. Samen bepalen we of ze past en waar ze begint. De prijs spreken we per bedrijf af tijdens de vroege toegang en delen we met je voordat er iets gekoppeld wordt.',
    ],
  },
};
const sectionMarkup = (className) => {
  const start = page.indexOf(`className="${className}"`);
  assert.ok(start >= 0, `no ${className}`);
  return page.slice(start, page.indexOf('</section>', start));
};
const faqAnswers = (language) =>
  stringValues(copyValue(language, 'faq')).filter((_, i) => i % 2 === 1);

test('step 7 copy is the approved text: contrast, repeat work, FAQ', () => {
  for (const [language, copy] of Object.entries(STEP7)) {
    for (const key of [
      'contrastTitle',
      'contrastBody',
      'faqTitle',
      'faq',
    ]) {
      const source = copyValue(language, key);
      assert.ok(source, `${language}: no ${key}`);
      const expected = Array.isArray(copy[key]) ? copy[key] : [copy[key]];
      assert.deepEqual(stringValues(source), expected, `${language}: ${key}`);
    }
    // The two sentences close the "How Anna works" body, after a space.
    const [body] = stringValues(copyValue(language, 'problemBody'));
    assert.ok(
      body.endsWith(` ${copy.problemBodyEnd}`),
      `${language}: problemBody does not end with the repeat-work sentences`,
    );
  }
});

test('step 7: eight FAQ items per language, no price figure in the answers', () => {
  for (const language of ['en', 'nl']) {
    const faq = copyValue(language, 'faq');
    assert.equal([...faq.matchAll(/\bq:\s+'/g)].length, 8, `${language}: q`);
    assert.equal([...faq.matchAll(/\ba:\s+'/g)].length, 8, `${language}: a`);
    const answers = faqAnswers(language);
    assert.equal(answers.length, 8);
    for (const answer of answers) {
      assert.doesNotMatch(
        answer,
        /\d\s*(€|euro|per month|per maand)|€\s*\d/i,
        `${language}: price in ${answer}`,
      );
    }
  }
});

test('step 7: the contrast block names no vendor and never calls Anna a colleague', () => {
  for (const language of ['en', 'nl']) {
    const text = ['contrastTitle', 'contrastBody']
      .map((key) => stringValues(copyValue(language, key)).join(' '))
      .join(' ');
    assert.ok(text.length > 100, `${language}: contrast copy found`);
    assert.doesNotMatch(text, /Copilot|ChatGPT|Microsoft|OpenAI/i, language);
    assert.doesNotMatch(text, /colleague|collega/i, language);
  }
});

test('step 7: no who-for line in the hero (Ezra, 2026-10-30: the size band is internal)', () => {
  assert.doesNotMatch(page, /heroWho|hero-who/);
  assert.doesNotMatch(styles, /\.hero-who/);
  for (const language of ['en', 'nl']) {
    const [body] = stringValues(copyValue(language, 'heroBody'));
    assert.doesNotMatch(body, /10 to 75|10 tot 75/, language);
  }
});

test('step 7: the contrast section follows How Anna works, without a kicker', () => {
  const section = sectionMarkup('contrast-section');
  assert.match(
    page,
    /<section\s+className="contrast-section"\s+aria-labelledby="contrast-title"\s*>/,
  );
  assert.match(section, /<h2 id="contrast-title">\{t\.contrastTitle\}<\/h2>/);
  assert.match(section, /<p>\{t\.contrastBody\}<\/p>/);
  assert.doesNotMatch(section, /eyebrow|Kicker/);
  // Same heading scale as the other sections; a quiet paper band.
  assert.match(
    styles,
    /\n\.contrast-section h2,\n\.faq-section h2,\n\.section-intro h2,[^{]*\.cta-section h2 \{\n  margin: 0;\n  font-size: clamp\(2\.2rem, 3\.6vw, 3\.3rem\);/,
  );
  const base = baseRule('.contrast-section');
  assert.match(base, /background: var\(--paper-light\);/);
  assert.match(
    base,
    /padding: clamp\(4rem, 7vw, 7rem\) max\(4vw, calc\(\(100vw - 1440px\) \/ 2\)\);/,
  );
  assert.match(base, /grid-template-columns: 1fr 1fr;/);
  assert.match(base, /align-items: start;/);
  assert.match(baseRule('.contrast-section p'), /max-width: 620px;/);
  assert.match(baseRule('.contrast-section p'), /color: #596273;/);
  assert.match(
    mediaBlocks('max-width: 1180px'),
    /\.contrast-section \{[^}]*grid-template-columns: 1fr;/,
  );
  assert.match(
    mediaBlocks('max-width: 820px'),
    /\.contrast-section,\n\s*\.faq-section \{\s*padding: 5rem 1\.25rem;/,
  );
});

test('step 7: the FAQ is native details and summary, no script, before the closing section', () => {
  const section = sectionMarkup('faq-section');
  assert.match(
    page,
    /<section\s+className="faq-section"\s+id="faq"\s+aria-labelledby="faq-title"\s*>/,
  );
  assert.match(section, /<h2 id="faq-title">\{t\.faqTitle\}<\/h2>/);
  assert.doesNotMatch(section, /eyebrow|Kicker/);
  assert.match(section, /t\.faq\.map\(/);
  assert.match(page, /<details className="faq-item"/);
  assert.match(section, /<summary>\{item\.q\}<\/summary>/);
  assert.match(section, /<p className="faq-answer">\{item\.a\}<\/p>/);
  assert.doesNotMatch(section, /onClick|useState|onToggle/);
  assert.doesNotMatch(page, /useState[^\n]*[Ff]aq/);
  // The nav keeps its three anchors.
  assert.doesNotMatch(page, /<a href="#faq">/);
  // Summary without the native marker; a CSS plus that turns into a cross.
  assert.match(baseRule('.faq-item summary'), /list-style: none;/);
  assert.match(
    baseRule('.faq-item summary::-webkit-details-marker'),
    /display: none;/,
  );
  assert.match(baseRule('.faq-item summary:focus-visible'), /outline: /);
  assert.match(baseRule('.faq-item summary::after'), /content: '\+';/);
  assert.match(
    baseRule('.faq-item[open] summary::after'),
    /transform: rotate\(45deg\);/,
  );
  assert.match(
    baseRule('.faq-item'),
    /border-bottom: 1px solid var\(--line\);/,
  );
  assert.match(baseRule('.faq-answer'), /color: #596273;/);
  assert.match(baseRule('.faq-answer'), /max-width: 62ch;/);
  assert.match(baseRule('.faq-section'), /background: var\(--paper\);/);
  assert.match(baseRule('.faq-list'), /max-width: 780px;/);
  // Heading left, list right at full width, so the section does not read as
  // a half-empty page; one column below 1181 px with the list under the h2.
  assert.match(baseRule('.faq-section'), /grid-template-columns: 1fr 1\.4fr;/);
  assert.match(baseRule('.faq-section'), /align-items: start;/);
  assert.match(
    mediaBlocks('max-width: 1180px'),
    /\.faq-section \{[^}]*grid-template-columns: 1fr/,
  );
});

test('step 7: both new sections render lazily', () => {
  assert.match(
    styles,
    /\.capability-section,\n\.contrast-section,[\s\S]{0,120}\.faq-section,[\s\S]{0,80}content-visibility: auto/,
  );
});

// Step 8 (step8-gate.md, approved 2026-10-30): softened "asks", calendar
// hours in the week, follow-ups sent as Anna, Dutch fixes, no mono kickers.
const STEP8 = {
  en: {
    heroBody:
      'Ask her in Teams or Slack. She does the recurring work in your systems, asks when a decision is yours, and reports back.',
    fact: 'Asks before anything you have not allowed',
    after: 'After · the day as you planned it',
    ringLabel: 'Some of the systems Anna works in',
    weekStep:
      'Found Wednesday 14:00–16:00 in your calendar: Rotterdam migration, on site. Not in the sheet yet.',
    weekQuestion:
      'Week 43 is ready: 38 h over 3 projects. Wednesday 14:00–16:00 is in your calendar as the Rotterdam migration but not in the sheet. Shall I add those 2 h and submit the week for approval?',
    calendar: 'Calendar',
    followUpStep:
      'Drafted 4 follow-ups, with the file each customer is waiting for attached where we have it',
    followUpQuestion:
      'Four drafts are ready below. The quote for Van Dijk Logistics needs a price from you first. Shall I send the other three now from my own address and remind you about the quote tomorrow at 9:00?',
    ownAddress: 'from my own address',
    problemFirst:
      'Anna picks up the request, gathers what she needs from your systems, checks with you when something is missing and does the work.',
    problemRest:
      ' You see exactly what she did. Anna can remind you and the team on a schedule, every Friday or every month-end. She works from your own policies and handbook, and how your team does things is set up together with your admin.',
    prepares:
      'She collects the context from your systems, checks the rules and brings you the decisions that are yours.',
    workflowIntro:
      'A colleague asks in Microsoft Teams or Slack. Anna gathers what she needs, does the work, brings you the calls that are yours, and reports back in the same conversation.',
    asks: /\basks (before|when|you)\b/gi,
    tasks: [
      'Hours',
      'Follow-ups',
      'Leave request',
      'New colleague',
      'Month-end hours',
      'Send reminders',
      'Status update',
    ],
  },
  nl: {
    heroBody:
      'Vraag het haar in Teams of Slack. Ze doet het terugkerende werk in jouw systemen, vraagt het jou als een beslissing van jou is en koppelt terug.',
    fact: 'Vraagt het eerst bij alles wat je niet hebt toegestaan',
    after: 'Daarna · de dag zoals je hem had gepland',
    ringLabel: 'Een aantal systemen waar Anna in werkt',
    weekStep:
      'Woensdag 14:00–16:00 in je agenda gevonden: Rotterdam-migratie, op locatie. Nog niet in de staat.',
    weekQuestion:
      'Week 43 staat klaar: 38 u over 3 projecten. Woensdag 14:00–16:00 staat in je agenda als de Rotterdam-migratie, maar nog niet in de staat. Zal ik die 2 u toevoegen en de week ter goedkeuring indienen?',
    calendar: 'Agenda',
    followUpStep:
      '4 opvolgingen geschreven, met het stuk waar de klant op wacht erbij waar we het hebben',
    followUpQuestion:
      'Vier concepten staan hieronder klaar. De offerte voor Van Dijk Logistics heeft eerst een prijs van jou nodig. Zal ik de andere drie nu vanuit mijn eigen adres versturen en je morgen om 9:00 aan de offerte herinneren?',
    ownAddress: 'vanuit mijn eigen adres',
    problemFirst:
      'Anna pakt je vraag op, haalt op wat ze nodig heeft uit je systemen, stemt met jou af als iets ontbreekt en doet het werk.',
    problemRest:
      ' Je ziet precies wat ze heeft gedaan. Anna kan jou en het team op een vast moment herinneren, elke vrijdag of elke maandafsluiting. Ze werkt vanuit jullie eigen beleid en handboek, en hoe jullie team het doet wordt samen met je beheerder ingesteld.',
    prepares:
      'Ze verzamelt de context uit je systemen, controleert de regels en legt de beslissingen die van jou zijn aan je voor.',
    workflowIntro:
      'Een collega vraagt iets in Microsoft Teams of Slack. Anna verzamelt wat ze nodig heeft, doet het werk, legt de keuzes die van jou zijn aan je voor en koppelt terug in hetzelfde gesprek.',
    asks: /\bvraagt (voordat|als|het)\b/gi,
    tasks: [
      'Uren',
      'Opvolging',
      'Verlofaanvraag',
      'Nieuwe collega',
      'Maandafsluiting',
      'Herinneringen sturen',
      'Status bijwerken',
    ],
  },
};
// One scenario's source in one language, from its id to the next scenario.
const scenarioBlock = (language, id) => {
  const block = copyValue(language, 'scenarios');
  const start = block.indexOf(`id: '${id}'`);
  assert.ok(start >= 0, `${language}: no ${id} scenario`);
  const next = block.indexOf("id: '", start + 1);
  return block.slice(start, next < 0 ? undefined : next);
};
const scenarioList = (source, key) => {
  const match = source.match(new RegExp(`${key}: \\[([\\s\\S]*?)\\]`));
  assert.ok(match, `no ${key} list`);
  return stringValues(match[1]);
};
const scenarioString = (source, key) => {
  const match = source.match(
    new RegExp(`${key}:\\s*('(?:[^'\\\\\\n]|\\\\.)*')`),
  );
  assert.ok(match, `no ${key}`);
  return stringValues(match[1])[0];
};

test('step 8: hero body, third fact, after label and ring label are the approved text', () => {
  for (const [language, copy] of Object.entries(STEP8)) {
    assert.deepEqual(
      stringValues(copyValue(language, 'heroBody')),
      [copy.heroBody],
      language,
    );
    assert.equal(stringValues(copyValue(language, 'facts'))[2], copy.fact);
    assert.deepEqual(
      stringValues(copyValue(language, 'ringLabel')),
      [copy.ringLabel],
      language,
    );
    const day = copyValue(language, 'day');
    assert.ok(day.includes(`after: '${copy.after}'`), `${language}: after`);
    assert.deepEqual(
      [...day.matchAll(/label: '([^']*)'/g)].map((m) => m[1]),
      copy.tasks,
      `${language}: task labels`,
    );
  }
  assert.doesNotMatch(
    page,
    /Inbox triage|Meeting prep|Update records|Inbox verwerken|Overleg voorbereiden|Dossiers bijwerken/,
  );
});

test('step 8: each renamed or matched task in the hero names a use case or a scenario', () => {
  const block = contentBlock('en');
  const targets = [
    ...[...block.matchAll(/\n {8}title: '([^']*)'/g)].map((m) => m[1]),
    ...[...copyValue('en', 'scenarios').matchAll(/label: '([^']*)'/g)].map(
      (m) => m[1],
    ),
  ].map((target) => target.toLowerCase());
  assert.ok(targets.includes('hours in your time tracking'), 'use cases read');
  assert.ok(targets.includes('new colleague'), 'scenario labels read');
  // The whole label, or for "Leave request" its first word ("Leave in your
  // HR system"). "Send reminders" and "Status update" have no use case.
  const labels = [...copyValue('en', 'day').matchAll(/label: '([^']*)'/g)].map(
    (m) => m[1],
  );
  assert.equal(labels.length, 7);
  for (const label of labels.filter(
    (label) => !['Send reminders', 'Status update'].includes(label),
  )) {
    const whole = label.toLowerCase();
    const first = whole.split(' ')[0];
    assert.ok(
      targets.some(
        (target) =>
          target.includes(whole) ||
          new RegExp(`(^|\\s)${first}(\\s|$)`).test(target),
      ),
      `task without a use case or scenario: ${label}`,
    );
  }
});

test('step 8: the week scenario finds the missing hours in the calendar', () => {
  for (const [language, copy] of Object.entries(STEP8)) {
    const week = scenarioBlock(language, 'week');
    const steps = scenarioList(week, 'steps');
    assert.equal(steps[3], copy.weekStep, `${language}: step 4`);
    assert.equal(scenarioString(week, 'question'), copy.weekQuestion);
    const sources = scenarioList(week, 'sources');
    assert.equal(sources.at(-1), copy.calendar, `${language}: sources`);
    assert.equal(sources.length, 3);
  }
  // The arithmetic holds: drafted 38 h plus the 2 h from the calendar = 40 h.
  const week = scenarioBlock('en', 'week');
  const drafted = Number(scenarioList(week, 'steps')[2].match(/(\d+) h/)[1]);
  const added = Number(
    scenarioString(week, 'question').match(/add those (\d+) h/)[1],
  );
  const recorded = Number(
    scenarioList(week, 'record')[0].match(/written: (\d+) h/)[1],
  );
  assert.equal(drafted, 38);
  assert.equal(added, 2);
  assert.equal(recorded, drafted + added);
});

test('step 8: follow-ups go out from Anna’s own address', () => {
  for (const [language, copy] of Object.entries(STEP8)) {
    const followUp = scenarioBlock(language, 'follow-up');
    assert.equal(scenarioList(followUp, 'steps')[2], copy.followUpStep);
    const question = scenarioString(followUp, 'question');
    assert.equal(question, copy.followUpQuestion);
    assert.ok(question.includes(copy.ownAddress), `${language}: own address`);
  }
  assert.doesNotMatch(page, /in your tone|in jouw toon/);
});

test('step 8: Dutch label and transparency line, no DOSSIER and no "altijd"', () => {
  assert.deepEqual(stringValues(copyValue('nl', 'demoLabel')), [
    'VOORBEELD · GEEN ECHT VERSLAG',
  ]);
  assert.deepEqual(stringValues(copyValue('nl', 'transparency')), [
    'Anna is AI. Ze maakt dat duidelijk en mensen houden de regie over wat ze mag doen.',
  ]);
  for (const value of stringValues(contentBlock('nl')))
    assert.doesNotMatch(value, /DOSSIER/);
});

test('step 8: "asks" stays in at most three places per language', () => {
  for (const [language, copy] of Object.entries(STEP8)) {
    const problem = stringValues(copyValue(language, 'problemBody'))[0];
    assert.equal(problem, copy.problemFirst + copy.problemRest, language);
    assert.deepEqual(
      stringValues(copyValue(language, 'workflowIntro')),
      [copy.workflowIntro],
      language,
    );
    const capabilities = stringValues(copyValue(language, 'capabilities'));
    assert.equal(capabilities[capabilities.indexOf('02') + 2], copy.prepares);
    const count = stringValues(contentBlock(language)).reduce(
      (total, value) => total + [...value.matchAll(copy.asks)].length,
      0,
    );
    assert.ok(count <= 3, `${language}: "asks" ${count} times`);
  }
});

test('step 8: no mono section kickers; descriptor and early-access pills set in sans', () => {
  for (const key of [
    'workflowKicker',
    'examplesKicker',
    'problemKicker',
    'connectorsKicker',
    'controlKicker',
  ])
    assert.doesNotMatch(page, new RegExp(`\\b${key}\\b`), key);
  assert.doesNotMatch(page, /className="(?:[^"]*\s)?eyebrow[\s"]/);
  assert.match(page, /<p className="hero-eyebrow">/);
  assert.match(page, /<p className="cta-kicker">\{t\.ctaKicker\}<\/p>/);
  assert.doesNotMatch(styles, /\.eyebrow\b/);
  for (const selector of ['.hero-eyebrow', '.hero-trust', '.cta-kicker']) {
    const rule = baseRule(selector);
    assert.doesNotMatch(rule, /geist-mono|monospace/, selector);
    assert.doesNotMatch(rule, /text-transform/, selector);
    assert.doesNotMatch(rule, /letter-spacing: 0\.\d+em/, selector);
    assert.match(rule, /font-family: var\(--font-geist-sans\)/, selector);
    assert.match(rule, /border: 1px solid/, selector);
    assert.match(rule, /border-radius: 999px/, selector);
  }
  assert.match(baseRule('.hero-eyebrow'), /font-size: 0\.9rem/);
  for (const selector of ['.hero-trust', '.cta-kicker']) {
    assert.match(baseRule(selector), /font-size: 0\.8rem/, selector);
    assert.match(baseRule(selector), /font-weight: 560/, selector);
  }
  // Mono stays inside the windows.
  assert.match(baseRule('.cta-step-number'), /geist-mono/);
});
