import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
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

test('explains one concrete supervised work journey', () => {
  for (const phrase of [
    'A request arrives',
    'Anna prepares the work',
    'You stay in control',
    'Anna completes and reports',
    'Een verzoek komt binnen',
    'Anna bereidt het werk voor',
    'Jij houdt de regie',
    'Anna rondt af en rapporteert',
  ]) {
    assert.ok(page.includes(phrase), `missing workflow copy: ${phrase}`);
  }
});

test('offers both requested conversion paths', () => {
  assert.match(page, /Book a demo/);
  assert.match(page, /Plan een demo/);
  assert.match(page, /Contact Anamata/);
  assert.match(page, /mailto:info@anamata\.ai/);
});

test('names supported work surfaces and keeps internal protocol language private', () => {
  for (const integration of ['Microsoft Teams', 'ClockWise', 'Loket']) {
    assert.ok(page.includes(integration), `missing integration: ${integration}`);
  }
  assert.doesNotMatch(page, /\bMCP\b/);
});

test('includes transparency and accessibility essentials', () => {
  assert.match(page, /DEMO · NOT THE LIVE RECORD/);
  assert.match(page, /aria-label=/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(layout, /Anna \| Anamata/);
  assert.match(layout, /description:/);
});
