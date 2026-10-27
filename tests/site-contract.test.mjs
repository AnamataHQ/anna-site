import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const hero = readFileSync(
  new URL('../components/paper-hero.tsx', import.meta.url),
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

test('explains supervised work journeys from request through reported result', () => {
  for (const phrase of [
    'Can I take next Friday off?',
    'I can check that and prepare the request for you.',
    'Human approval required',
    'Your leave request is filed',
    'Kan ik volgende vrijdag vrij nemen?',
    'Ik kan dat controleren en de aanvraag voor je voorbereiden.',
    'Menselijke goedkeuring nodig',
    'Je verlofaanvraag is ingediend',
  ]) {
    assert.ok(page.includes(phrase), `missing workflow copy: ${phrase}`);
  }
});

test('uses the real Teams mark and context-appropriate Anna Relay variants', () => {
  assert.match(page, /src="\/brands\/microsoft-teams\.svg"/);
  assert.equal(
    page.match(/src="\/brands\/anna-color-transparent\.svg"/g)?.length,
    1,
  );
  assert.equal(
    page.match(/src="\/brands\/anna-color-navy\.svg"/g)?.length,
    1,
  );
  // Two in the hero on purpose: the knot of the mobile (Anna herself) and
  // the stamp on the returned folder (Ezra, 2026-10-27: Anna is the mobile;
  // her mark on her and her output, never on the figure).
  assert.equal(
    hero.match(/src="\/brands\/anna-mono-dark\.svg"/g)?.length,
    2,
  );
  assert.equal(
    page.match(/src="\/brands\/anna-mono-light\.svg"/g)?.length,
    1,
  );
  assert.doesNotMatch(page, /src="\/brands\/anna\.svg"/);
  assert.doesNotMatch(page, /src="\/brands\/anna\.png"/);
  assert.doesNotMatch(page, /className="teams-mini"[^>]*>\s*T\s*</s);
  assert.doesNotMatch(page, /<DemoMessage[^>]+avatar="A"/s);
  assert.doesNotMatch(page, /className="brand-mark"[^>]*>\s*A\s*</s);
  assert.doesNotMatch(hero, /className="hero-sling-tag"[^>]*>\s*A\s*</s);
  assert.match(layout, /icons:\s*\{[\s\S]*?icon:\s*'\/favicon\.svg'/);
  for (const asset of [
    'anna-color-transparent.svg',
    'anna-color-black.svg',
    'anna-color-navy.svg',
    'anna-mono-dark.svg',
    'anna-mono-light.svg',
  ]) {
    assert.equal(
      existsSync(new URL(`../public/brands/${asset}`, import.meta.url)),
      true,
      `missing Anna brand asset: ${asset}`,
    );
  }
  for (const colour of [
    '#2C548C',
    '#3159C7',
    '#6252EF',
    '#8D4DFF',
    '#E15091',
    '#FF5C42',
  ]) {
    assert.ok(
      annaColourTransparent.includes(colour),
      `missing Relay colour: ${colour}`,
    );
  }
  assert.match(annaColourTransparent, /data-master="relay-master-04"/);
  assert.match(annaColourTransparent, /offset="0\.49"/);
  assert.match(annaColourTransparent, /offset="0\.61"/);
  assert.match(annaColourTransparent, /M42 158V62/);
  assert.match(annaColourTransparent, /M158 42V138/);
  assert.match(annaColourBlack, /fill="#000000"/);
  assert.match(annaColourNavy, /fill="#08152E"/);
  assert.match(annaMonoDark, /fill="#08152E"/);
  assert.match(annaMonoLight, /fill="#FFFFFF"/);
  assert.equal(favicon, annaColourBlack);
});

test('starts motion when each experience enters the viewport', () => {
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /heroHasEntered/);
  assert.match(page, /workflowHasEntered/);
  assert.match(page, /workflowVisible/);
  assert.match(page, /data-in-view=/);
  assert.match(styles, /\[data-playing='false'\]/);
});

test('shows three selectable, replayable conversation demos', () => {
  assert.match(page, /from '@\/components\/ui\/tabs'/);
  for (const phrase of [
    'Leave request',
    'Hours',
    'Follow-up',
    'Verlofaanvraag',
    'Uren',
    'Opvolging',
    'Retrieving context',
    'Context ophalen',
    'Replay conversation',
    'Gesprek opnieuw afspelen',
    'Pause conversation',
    'Gesprek pauzeren',
  ]) {
    assert.ok(page.includes(phrase), `missing animated demo detail: ${phrase}`);
  }
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /demoStep/);
});

test('shows Anna working briefly after approval before reporting completion', () => {
  assert.match(page, /const EXECUTION_DELAY_MS = 1600/);
  assert.match(page, /isExecuting/);
  assert.match(page, /Anna is carrying this out/);
  assert.match(page, /Anna voert dit nu uit/);
  assert.match(page, /aria-busy=\{isExecuting\}/);
  assert.match(page, /window\.setTimeout\([\s\S]*EXECUTION_DELAY_MS/);
});

test('makes Anna boundaries and recognisable team tasks concrete', () => {
  for (const phrase of [
    'Anna does',
    'Anna asks',
    'Anna never does without permission',
    'Anna doet',
    'Anna vraagt',
    'Anna doet nooit zonder toestemming',
  ]) {
    assert.ok(
      page.includes(phrase),
      `missing operating model detail: ${phrase}`,
    );
  }
});

test('offers early access and contact, with identical wording in hero and closing section', () => {
  assert.equal((page.match(/'Request early access'/g) ?? []).length, 1);
  assert.equal((page.match(/'Vraag vroege toegang aan'/g) ?? []).length, 1);
  assert.match(page, /Contact Anamata/);
  assert.match(page, /mailto:info@anamata\.ai/);
  assert.doesNotMatch(page, /Book a demo|Plan een demo|Demo%20ANNA/);
});

test('sells the connectors first: tested examples, thousands available, no roadmap logos', () => {
  for (const integration of [
    'Microsoft Teams',
    'Slack',
    'Notion',
    'HubSpot',
    'ClockWise',
    'Loket',
  ]) {
    assert.ok(
      page.includes(integration),
      `missing connector: ${integration}`,
    );
  }
  const sections = [...page.matchAll(/<section[^>]*id="([a-z-]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(sections.slice(0, 2), ['top', 'connectors']);
  assert.match(page, /OAuth/);
  assert.match(page, /MCP/);
  assert.match(page, /thousands/i);
  assert.match(page, /duizenden/i);
  assert.match(page, /If it has an API/);
  assert.match(page, /Als het een API heeft/);
  assert.match(page, /Request a connector/);
  assert.match(page, /Vraag een koppeling aan/);
  for (const gone of [
    'Shipping with Anna',
    'Communication roadmap',
    'Mendix',
    'on the cards',
    'op de planning',
    'Available now',
    '+∞',
    'Atlassian',
    'Jira',
    'GitHub',
  ]) {
    assert.ok(!page.includes(gone), `old connector copy still present: ${gone}`);
  }
});

test('tells the story in the agreed order', () => {
  const order = ['hero', 'connectors', 'capability-section', 'use-case-section', 'workflow-section', 'control-section', 'cta-section'];
  const positions = order.map((name) => page.indexOf(`className="${name}"`));
  for (const [index, position] of positions.entries()) {
    assert.ok(position >= 0, `missing section ${order[index]}`);
    if (index > 0) assert.ok(position > positions[index - 1], `${order[index]} is out of order`);
  }
  for (const useCase of [
    'ClockWise',
    'Loket',
    'HubSpot',
    'Log my hours',
    'Uren boeken',
  ]) {
    assert.ok(page.includes(useCase), `missing use case: ${useCase}`);
  }
});

test('includes transparency and accessibility essentials', () => {
  assert.match(page, /DEMO · NOT THE LIVE RECORD/);
  assert.match(page, /aria-label=/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /Anna \| Anamata/);
  assert.match(layout, /description:/);
});
