import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(
  new URL('../app/layout.tsx', import.meta.url),
  'utf8',
);
const styles = readFileSync(
  new URL('../app/globals.css', import.meta.url),
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

test('uses a familiar calendar that fills with routine work and clears in view', () => {
  for (const phrase of [
    'Work that needs you',
    'Werk dat jou nodig heeft',
    'Follow-ups',
    'Opvolging',
    'Inbox triage',
    'Inbox verwerken',
    'Time returned',
    'Tijd terug',
  ]) {
    assert.ok(
      page.includes(phrase),
      `missing cleared-day hero copy: ${phrase}`,
    );
  }
  assert.match(page, /className="cleared-day"/);
  assert.match(page, /className="calendar-event/);
  assert.match(page, /Work week/);
  assert.match(page, /Werkweek/);
  assert.doesNotMatch(page, /anna-workflow\.png/);
  assert.match(styles, /@keyframes event-cycle/);
  assert.doesNotMatch(styles, /\.cleared-day[^}]*transform:\s*rotate/s);
});

test('aligns agenda cards to the calendar and labels their timeframes', () => {
  for (const timeframe of [
    '08:00–08:30',
    '08:30–09:00',
    '09:30–10:00',
    '10:30–11:30',
    '12:00–12:30',
    '13:00–13:30',
    '14:00–14:30',
  ]) {
    assert.ok(
      page.includes(timeframe),
      `missing agenda timeframe: ${timeframe}`,
    );
  }
  assert.match(page, /--event-start/);
  assert.match(page, /--event-span/);
  assert.match(styles, /top:\s*calc\(var\(--event-start\)/);
  assert.match(styles, /height:\s*calc\(var\(--event-span\)/);
});

test('keeps the mobile Anna summary below the focus block', () => {
  assert.match(
    styles,
    /@media \(max-width: 820px\)[\s\S]*?\.focus-block\s*\{[^}]*bottom:\s*calc\(3 \* \(100% \/ 9\)/,
  );
  assert.match(
    styles,
    /@media \(max-width: 820px\)[\s\S]*?\.anna-tray\s*\{[^}]*grid-template-columns:\s*auto 1fr/,
  );
});

test('starts motion when each experience enters the viewport', () => {
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /heroHasEntered/);
  assert.match(page, /workflowHasEntered/);
  assert.match(page, /workflowVisible/);
  assert.match(page, /data-in-view=/);
  assert.match(styles, /\[data-in-view='true'\]/);
});

test('shows three selectable, replayable conversation demos', () => {
  assert.match(page, /from '@\/components\/ui\/tabs'/);
  for (const phrase of [
    'Leave request',
    'Desk booking',
    'Record update',
    'Verlofaanvraag',
    'Werkplek boeken',
    'Dossier bijwerken',
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
    'HR',
    'Operations',
    'Office management',
  ]) {
    assert.ok(
      page.includes(phrase),
      `missing operating model detail: ${phrase}`,
    );
  }
});

test('offers both requested conversion paths', () => {
  assert.match(page, /Book a demo/);
  assert.match(page, /Plan een demo/);
  assert.match(page, /Contact Anamata/);
  assert.match(page, /mailto:info@anamata\.ai/);
});

test('distinguishes ready, shipping, roadmap and extensible connections', () => {
  for (const integration of [
    'Microsoft Teams',
    'ClockWise',
    'Loket',
    'Slack',
    'Mendix office seat booking',
    'Mendix CV updates',
    'Microsoft 365',
    'Atlassian',
    'Jira',
    'Notion',
    'GitHub',
  ]) {
    assert.ok(
      page.includes(integration),
      `missing integration: ${integration}`,
    );
  }
  assert.match(page, /Available now/);
  assert.match(page, /Nu beschikbaar/);
  assert.match(page, /Shipping with Anna/);
  assert.match(page, /Wordt met Anna geleverd/);
  assert.match(page, /Communication roadmap/);
  assert.match(page, /Roadmap communicatie/);
  assert.match(page, /Examples, not limits/);
  assert.match(page, /Voorbeelden, geen grenzen/);
  assert.match(page, /SSO-secured MCP connectors/);
  assert.match(page, /MCP-koppelingen met SSO/);
  assert.match(page, /If it has an API/);
  assert.match(page, /Als het een API heeft/);
  assert.match(page, /thousands of business systems/i);
  assert.match(page, /duizenden bedrijfssystemen/i);
  assert.match(page, /Request a connector/);
  assert.match(page, /Vraag een koppeling aan/);
});

test('includes transparency and accessibility essentials', () => {
  assert.match(page, /DEMO · NOT THE LIVE RECORD/);
  assert.match(page, /aria-label=/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /Anna \| Anamata/);
  assert.match(layout, /description:/);
});
