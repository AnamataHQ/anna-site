import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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

test('uses the real Teams and Anna marks everywhere they appear', () => {
  assert.match(page, /src="\/brands\/microsoft-teams\.svg"/);
  assert.match(page, /src="\/brands\/anna\.png"/);
  assert.equal(page.match(/src="\/brands\/anna\.png"/g)?.length, 4);
  assert.doesNotMatch(page, /className="teams-mini"[^>]*>\s*T\s*</s);
  assert.doesNotMatch(page, /<DemoMessage[^>]+avatar="A"/s);
  assert.doesNotMatch(page, /className="brand-mark"[^>]*>\s*A\s*</s);
  assert.doesNotMatch(page, /className="anna-tray-mark"[^>]*>\s*A\s*</s);
  assert.match(layout, /icons:\s*\{[\s\S]*?icon:\s*'\/brands\/anna\.png'/);
  assert.equal(
    existsSync(new URL('../public/brands/anna.png', import.meta.url)),
    true,
  );
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
  assert.match(page, /className="focus-fragment"/);
  assert.match(page, /data-incoming=\{task\.incoming\}/);
  assert.match(page, /Work week/);
  assert.match(page, /Werkweek/);
  assert.doesNotMatch(page, /anna-workflow\.png/);
  assert.match(styles, /@keyframes clear-admin/);
  assert.match(styles, /@keyframes fill-open-slots/);
  assert.match(styles, /@keyframes merge-focus/);
  assert.match(styles, /@keyframes expand-anchor-day/);
  assert.doesNotMatch(styles, /\.cleared-day[^}]*transform:\s*rotate/s);
});

test('keeps valuable work distinct before merging it into one anchor card', () => {
  for (const phrase of [
    'Set priorities',
    'Make hiring decision',
    'Team check-in',
    'Resolve project blocker',
    'Prioriteiten bepalen',
    'Wervingsbesluit nemen',
    'Teamoverleg',
    'Projectblokkade oplossen',
  ]) {
    assert.ok(page.includes(phrase), `missing valuable-work task: ${phrase}`);
  }
  assert.match(page, /data-side=\{segment\.side\}/);
  assert.match(page, /className="focus-block focus-anchor"/);
  assert.match(page, /className="anchor-compact"/);
  assert.match(page, /className="anchor-expanded"/);
});

test('pauses, expands one anchor slowly and counts its timeframe outward', () => {
  assert.match(page, /const CALENDAR_MERGE_DELAY_MS = 6800/);
  assert.match(page, /const CALENDAR_MERGE_DURATION_MS = 2900/);
  assert.match(page, /requestAnimationFrame/);
  assert.match(page, /formatCalendarTime/);
  assert.match(page, /focusWindow/);
  assert.match(styles, /animation:\s*expand-anchor-day 10\.4s/);
  assert.match(styles, /font-variant-numeric:\s*tabular-nums/);
});

test('aligns agenda cards to the calendar and labels their timeframes', () => {
  for (const timeframe of [
    '09:00–09:25',
    '10:25–10:45',
    '11:30–11:55',
    '12:25–12:55',
    '13:40–14:00',
    '15:00–15:20',
    '16:10–16:30',
    '08:00–17:00',
  ]) {
    assert.ok(
      page.includes(timeframe),
      `missing agenda timeframe: ${timeframe}`,
    );
  }
  assert.match(page, /--event-start/);
  assert.match(page, /--event-duration/);
  assert.match(styles, /top:\s*calc\(var\(--event-start\)/);
  assert.match(styles, /height:\s*calc\(var\(--event-duration\)/);
});

test('balances a nine-hour day with exactly 2h 40m handled by Anna', () => {
  const focusSource = page.match(
    /const focusSegments = \[([\s\S]*?)\] as const;/,
  )?.[1];
  assert.ok(focusSource, 'missing valuable-work schedule');
  const focusMinutes = [...focusSource.matchAll(/duration:\s*(\d+)/g)].reduce(
    (total, match) => total + Number(match[1]),
    0,
  );
  assert.equal(focusMinutes, 380);

  const taskLists = [...page.matchAll(/tasks: \[([\s\S]*?)\],\n\s*handled:/g)];
  assert.equal(taskLists.length, 2);
  for (const [, taskSource] of taskLists) {
    const routineMinutes = [
      ...taskSource.matchAll(/duration:\s*(\d+)/g),
    ].reduce((total, match) => total + Number(match[1]), 0);
    assert.equal(routineMinutes, 160);
  }
});

test('keeps the Anna summary outside the calendar grid at every width', () => {
  assert.match(page, /className="anna-tray calendar-summary"/);
  assert.match(styles, /\.anna-tray\s*\{[^}]*position:\s*static/);
  assert.doesNotMatch(styles, /\.anna-tray\s*\{[^}]*position:\s*absolute/);
});

test('explains the before and after without motion', () => {
  for (const phrase of [
    'Before · 7 routine tasks split up the day',
    'After · 08:00–17:00 for work that needs you',
    'Voor · 7 routinetaken versnipperen de dag',
    'Na · 08:00–17:00 voor werk dat jou nodig heeft',
  ]) {
    assert.ok(page.includes(phrase), `missing reduced-motion story: ${phrase}`);
  }
  assert.match(page, /className="reduced-motion-story"/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.reduced-motion-story\s*\{[^}]*display:\s*grid/,
  );
  assert.match(page, /setFocusWindow\(FINAL_FOCUS_WINDOW\)/);
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
