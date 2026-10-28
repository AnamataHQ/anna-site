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
  // The chat window is not padded out to a fixed tall block.
  assert.match(phone, /\.demo-thread \{[^}]*min-height: 420px/);
  assert.doesNotMatch(phone, /\.demo-thread \{[^}]*min-height: 680px/);
  // The panel gives the chat the width of the phone.
  assert.match(phone, /\.scenario-shell\.paper-panel \{[^}]*padding: 0\.75rem/);
});

test('includes transparency and accessibility essentials', () => {
  assert.match(page, /EXAMPLE · NOT A LIVE RECORD/);
  assert.match(page, /aria-label=/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /Anna \| Anamata/);
  assert.match(layout, /description:/);
});
