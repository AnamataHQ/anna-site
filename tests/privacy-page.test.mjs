import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

// The privacy statement (Taiga #418), first version: the ANNA site only, at
// /privacy, in English and Dutch.
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const route = new URL('../app/privacy/page.tsx', import.meta.url);
const statementFile = new URL(
  '../components/privacy-statement.tsx',
  import.meta.url,
);
const page = read('../app/page.tsx');
const form = read('../components/lead-form.tsx');
const exportDir = new URL('../dist/client/', import.meta.url);

test('the privacy route exists with its own title', () => {
  assert.ok(existsSync(route), 'missing app/privacy/page.tsx');
  assert.match(
    readFileSync(route, 'utf8'),
    /title:\s*'Privacy \| Anna \| Anamata'/,
  );
});

test('the statement covers what the site and the form actually do, in both languages', () => {
  // Source lines wrap anywhere, so compare with whitespace collapsed.
  const statement = readFileSync(statementFile, 'utf8').replace(/\s+/g, ' ');
  for (const fact of [
    'anna-site.anamata.ai',
    'Anamata BV',
    '78520185',
    'info@anamata.ai',
    'TransIP',
    'mijndomein',
    'Cloudflare Turnstile',
    'EU-US Data Privacy Framework',
    'EU-VS-gegevensprivacykader',
    '90 days',
    '90 dagen',
    '12 months',
    '12 maanden',
    'Autoriteit Persoonsgegevens',
    // The landing source kept in session storage until the tab closes.
    'as long as the tab is open',
    'zolang het tabblad open is',
    'Last updated: 16 October 2026',
    'Laatst bijgewerkt: 16 oktober 2026',
    // anamata.ai is covered too: its forms only open the visitor's mail program.
    'This statement covers anamata.ai and the ANNA site',
    'Deze verklaring geldt voor anamata.ai en de ANNA-site',
    'open a new mail in your own mail program',
    'openen een nieuwe mail in je eigen mailprogramma',
  ]) {
    assert.ok(statement.includes(fact), `statement is missing "${fact}"`);
  }
});

test('the statement names the right site and one contact address', () => {
  const statement = readFileSync(statementFile, 'utf8');
  // anna.anamata.ai is the ANNA product, not this site.
  assert.doesNotMatch(statement, /[^-]anna\.anamata\.ai/);
  assert.doesNotMatch(statement, /info@anamata\.eu/);
});

test('the form links to the statement in the visitor language', () => {
  assert.doesNotMatch(form, /https:\/\/anamata\.ai\/privacy/);
  assert.match(form, /`\/privacy#\$\{language\}`/);
});

test('the homepage footer links to the statement', () => {
  assert.match(page, /href=\{`\/privacy#\$\{language\}`\}/);
});

test('the exported privacy page loads nothing from other parties', () => {
  assert.ok(
    existsSync(exportDir),
    'missing dist/client; run `npm run build` first',
  );
  const html = readFileSync(new URL('privacy.html', exportDir), 'utf8');
  assert.match(html, /Privacy \| Anna \| Anamata/);
  for (const name of ['privacy.html', 'index.html']) {
    const file = readFileSync(new URL(name, exportDir), 'utf8');
    const external = [
      ...file.matchAll(
        /<(?:script|link|img)\b[^>]*(?:src|href)="(https?:\/\/[^"]+)"/g,
      ),
    ].map((match) => match[1]);
    assert.deepEqual(external, [], `${name} loads ${external.join(', ')}`);
  }
});

test('the homepage footer names the owner with its KvK number', () => {
  assert.match(page, /Anamata BV · KvK 78520185/);
});
