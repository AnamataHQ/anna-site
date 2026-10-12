import assert from 'node:assert/strict';
import test from 'node:test';

// Node strips the TypeScript types; lib/lead-capture.ts has no runtime imports.
import {
  buildPayload,
  createOpenings,
  LEAD_ENDPOINT,
  readSource,
  rememberFirstSource,
  SOURCE_STORAGE_KEY,
  submitLead,
  waitForToken,
} from '../lib/lead-capture.ts';

const landing = {
  pathname: '/',
  search:
    '?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026&utm_term=hr&utm_content=post-1&fbclid=abc',
};

function memoryStorage() {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    items,
  };
}

test('reads referrer, UTM codes and the landing path', () => {
  const source = readSource(landing, 'https://www.linkedin.com/');
  assert.deepEqual(source, {
    referrer: 'https://www.linkedin.com/',
    utm_source: 'linkedin',
    utm_medium: 'social',
    utm_campaign: 'launch-2026',
    utm_term: 'hr',
    utm_content: 'post-1',
    landing_path: '/',
  });
});

test('the landing page is the path only; other query values never leave the browser', () => {
  const source = readSource(
    { pathname: '/', search: '?utm_source=x&email=fenna@example.org&invite=secret&gclid=abc' },
    '',
  );
  assert.equal(source.landing_path, '/');
  assert.equal(JSON.stringify(source).includes('fenna@example.org'), false);
  assert.equal(JSON.stringify(source).includes('abc'), false);
});

test('only the known UTM codes are kept', () => {
  const source = readSource(landing, '');
  assert.equal('fbclid' in source, false);
  assert.equal(source.referrer, '');
});

test('values are cut to the lengths the lead service accepts', () => {
  const long = { pathname: `/${'p'.repeat(3000)}`, search: `?utm_source=${'s'.repeat(500)}` };
  const source = readSource(long, `https://example.org/${'r'.repeat(3000)}`);
  assert.equal(source.referrer.length, 2048);
  assert.equal(source.landing_path.length, 2048);
  assert.equal(source.utm_source.length, 200);
});

test('the first landing wins: a later page view does not overwrite it', () => {
  const storage = memoryStorage();
  const first = rememberFirstSource(storage, landing, 'https://www.linkedin.com/');
  const later = rememberFirstSource(storage, { pathname: '/', search: '' }, 'https://anna-site.anamata.ai/');
  assert.deepEqual(later, first);
  assert.ok(storage.items.has(SOURCE_STORAGE_KEY));
});

test('blocked or broken storage still gives the current source', () => {
  const throwing = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('SecurityError');
    },
  };
  assert.equal(rememberFirstSource(throwing, landing, '').utm_source, 'linkedin');
  assert.equal(rememberFirstSource(null, landing, '').utm_source, 'linkedin');
  const corrupt = memoryStorage();
  corrupt.setItem(SOURCE_STORAGE_KEY, '{not json');
  assert.equal(rememberFirstSource(corrupt, landing, '').utm_source, 'linkedin');
});

test('the payload has exactly the fields the lead service accepts', () => {
  const payload = buildPayload({
    kind: 'demo',
    lang: 'nl',
    fields: {
      name: 'Fenna',
      email: 'fenna@example.org',
      org: 'Gemeente',
      message: '',
    },
    source: readSource(landing, ''),
    turnstileToken: 'token',
    honeypot: '',
    elapsedMs: 4200.7,
  });
  assert.deepEqual(Object.keys(payload).sort(), [
    'elapsedMs',
    'email',
    'honeypot',
    'kind',
    'lang',
    'message',
    'name',
    'org',
    'source',
    'turnstileToken',
  ]);
  assert.equal(payload.elapsedMs, 4201);
  assert.equal(payload.kind, 'demo');
});

test('posts JSON to /api/lead and reports success only on 200', async () => {
  const calls = [];
  const fetchOk = async (url, init) => {
    calls.push({ url, init });
    return new Response('{"ok":true}', { status: 200 });
  };
  assert.equal(await submitLead({ kind: 'demo' }, fetchOk), 'success');
  assert.equal(calls[0].url, LEAD_ENDPOINT);
  assert.equal(LEAD_ENDPOINT, '/api/lead');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['content-type'], 'application/json');

  for (const status of [400, 404, 429, 500, 502]) {
    const fetchStatus = async () => new Response('{}', { status });
    assert.equal(await submitLead({}, fetchStatus), 'failure', `status ${status}`);
  }
  const fetchDown = async () => {
    throw new TypeError('Failed to fetch');
  };
  assert.equal(await submitLead({}, fetchDown), 'failure');
});

test('waits for the Turnstile token, and gives up so a blocked widget shows the mail fallback', async () => {
  let token = '';
  setTimeout(() => {
    token = 'late-token';
  }, 30);
  assert.equal(await waitForToken(() => token, { timeoutMs: 500, intervalMs: 10 }), 'late-token');
  assert.equal(await waitForToken(() => '', { timeoutMs: 40, intervalMs: 10 }), null);
});

test('a request that never answers counts as a failure after the timeout', async () => {
  const hanging = (url, init) =>
    new Promise((resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason));
    });
  assert.equal(await submitLead({}, hanging, { timeoutMs: 30 }), 'failure');
});

test('a result from an earlier opening of the dialog is recognised as stale', () => {
  const openings = createOpenings();
  const first = openings.next();
  assert.equal(openings.isCurrent(first), true);
  openings.close();
  assert.equal(openings.isCurrent(first), false);
  const second = openings.next();
  assert.equal(openings.isCurrent(first), false);
  assert.equal(openings.isCurrent(second), true);
});
