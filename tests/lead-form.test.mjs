import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const page = read('../app/page.tsx');
const form = read('../components/lead-form.tsx');
const layout = read('../app/layout.tsx');
const viteConfig = read('../vite.config.ts');

// Approved form text (Taiga #344, approved 2026-10-07; early-access heading
// replaces 'Book a demo', Ezra 2026-10-28). Exact strings.
const APPROVED = {
  en: [
    'Request early access',
    'Contact Anamata',
    'Name',
    'Work email',
    'Organisation',
    'Message (optional)',
    'Send request',
    'We use your details only to answer this request.',
    'Read our privacy statement.',
    "Thanks, your request has reached us. We'll reply by email.",
    "Sending didn't work. Email us directly at",
  ],
  nl: [
    'Vraag vroege toegang aan',
    'Neem contact op',
    'Naam',
    'Zakelijk e-mailadres',
    'Organisatie',
    'Bericht (optioneel)',
    'Verstuur aanvraag',
    'We gebruiken je gegevens alleen om deze aanvraag te beantwoorden.',
    'Lees onze privacyverklaring.',
    'Bedankt, je aanvraag is binnen. We reageren per mail.',
    'Versturen lukte niet. Mail ons direct via',
  ],
};

test('the form uses the approved text in both languages', () => {
  for (const [lang, phrases] of Object.entries(APPROVED)) {
    for (const phrase of phrases) {
      assert.ok(form.includes(phrase), `${lang}: missing "${phrase}"`);
    }
  }
  assert.match(form, /mailto:info@anamata\.ai/);
});

test('demo buttons open the demo form, contact buttons the contact form', () => {
  const demoOpens = page.match(/onClick=\{leadOpener\('demo'\)\}/g) ?? [];
  const contactOpens = page.match(/onClick=\{leadOpener\('contact'\)\}/g) ?? [];
  // Demo: header, hero, under the demo, after the use cases and the closing
  // section. Contact: hero, closing section and footer (plan step 2).
  assert.equal(demoOpens.length, 5);
  assert.equal(contactOpens.length, 3);
});

test('every opener keeps its mailto link as the fallback without JavaScript', () => {
  const openers = page.match(/<a\b[^>]*leadOpener[^>]*>/gs) ?? [];
  assert.equal(openers.length, 8);
  for (const opener of openers) {
    assert.match(opener, /href="mailto:info@anamata\.ai/);
    assert.match(opener, /aria-haspopup="dialog"/);
  }
});

test('the connector request link stays a plain mailto', () => {
  assert.match(
    page,
    /href="mailto:info@anamata\.ai\?subject=Connector%20request%20for%20Anna"/,
  );
});

test('Turnstile loads only when the form opens, never with the page', () => {
  assert.doesNotMatch(layout, /challenges\.cloudflare\.com/);
  assert.doesNotMatch(page, /challenges\.cloudflare\.com/);
  assert.match(form, /loadTurnstile\(/);
  assert.match(form, /render=explicit|TURNSTILE_SCRIPT_URL/);
});

test('the form is an accessible modal dialog', () => {
  assert.match(form, /<dialog\b/);
  assert.match(form, /showModal\(\)/);
  assert.match(form, /aria-labelledby=/);
  assert.match(form, /role="status"|aria-live="polite"/);
  for (const field of ['name', 'email', 'org', 'message']) {
    assert.match(
      form,
      new RegExp(`htmlFor=\\{\`\\$\\{id\\}-${field}\`\\}`),
      `label for ${field}`,
    );
  }
  assert.match(form, /type="email"/);
  assert.match(form, /autoComplete="email"/);
  assert.match(form, /autoComplete="organization"/);
});

test('the honeypot is hidden from people and from assistive technology', () => {
  assert.match(form, /name="website"/);
  assert.match(form, /tabIndex=\{-1\}/);
  assert.match(form, /aria-hidden="true"/);
});

test('field limits match the lead service', () => {
  assert.match(form, /maxLength=\{200\}/);
  assert.match(form, /maxLength=\{254\}/);
  assert.match(form, /maxLength=\{5000\}/);
});

test('the site key comes from the build environment, with the test key only as fallback', () => {
  assert.match(form, /process\.env\.NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  assert.doesNotMatch(form, /0x4AAAA/);
});

test('the dev server forwards /api/lead to the local lead service', () => {
  assert.match(viteConfig, /'\/api\/lead': 'http:\/\/127\.0\.0\.1:8787'/);
});

test('the built page itself loads no third-party script', () => {
  const index = new URL('../dist/client/index.html', import.meta.url);
  if (!existsSync(index)) return; // build-dependent; CI builds before testing
  const html = readFileSync(index, 'utf8');
  assert.doesNotMatch(
    html,
    /<script[^>]+src="https?:\/\/(?!anna-site\.anamata\.ai)/,
  );
});

test('a result from a closed or reopened dialog is ignored', () => {
  assert.equal((form.match(/isCurrent\(opening\)/g) ?? []).length, 2);
  assert.match(form, /openingsRef\.current\.close\(\)/);
});

test('narrow phones get the compact Turnstile widget', () => {
  assert.match(form, /clientWidth >= 300 \? 'flexible' : 'compact'/);
});

test('the dialog says when we reply, under the heading, in both languages', () => {
  assert.match(form, /note: 'We reply by email within two working days\.'/);
  assert.match(form, /note: 'We reageren per e-mail binnen twee werkdagen\.'/);
  assert.match(form, /note approved 2026-10-30/);
  assert.match(
    form,
    /<h2 id=\{headingId\}>\{t\.heading\[shownKind\]\}<\/h2>\s*<p\b[^>]*className="lead-dialog-note"[^>]*>\s*\{t\.note\}\s*<\/p>/,
  );
});
