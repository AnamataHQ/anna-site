import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

// Run after `npm run build`: the deploy workflow rsyncs this directory to
// VPS-RGF, where Caddy serves it as plain files.
const exportDir = new URL('../dist/client/', import.meta.url);

const nextConfig = readFileSync(
  new URL('../next.config.ts', import.meta.url),
  'utf8',
);
const viteConfig = readFileSync(
  new URL('../vite.config.ts', import.meta.url),
  'utf8',
);
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

function listFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

test('configures a static export', () => {
  assert.match(nextConfig, /output:\s*'export'/);
});

test('drops the OpenAI Sites hosting and the Worker runtime', () => {
  assert.equal(
    existsSync(new URL('../.openai/hosting.json', import.meta.url)),
    false,
  );
  assert.doesNotMatch(viteConfig, /sites-vite-plugin|sites\(\)/);
  assert.doesNotMatch(viteConfig, /@cloudflare\/vite-plugin|cloudflare\(/);
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  for (const name of [
    '@openai/sites-vite-plugin',
    '@cloudflare/vite-plugin',
    '@cloudflare/workers-types',
    'wrangler',
  ]) {
    assert.equal(name in dependencies, false, `unexpected dependency: ${name}`);
  }
  assert.doesNotMatch(packageJson.scripts.start ?? '', /wrangler/);
});

test('build output is a static site with index.html', () => {
  assert.ok(
    existsSync(exportDir),
    'missing dist/client; run `npm run build` first',
  );
  const index = readFileSync(new URL('index.html', exportDir), 'utf8');
  assert.match(index, /<html/i);
  assert.match(index, /Anna \| Anamata/);
  assert.ok(existsSync(new URL('favicon.svg', exportDir)));
  assert.ok(
    existsSync(new URL('brands/anna-color-transparent.svg', exportDir)),
  );
});

test('build output needs no Worker runtime', () => {
  const files = listFiles(exportDir);
  for (const name of ['wrangler.json', 'wrangler.toml', '_worker.js']) {
    assert.equal(files.includes(name), false, `unexpected ${name}`);
  }
  // Every local asset the page loads must be a file in the export, so a plain
  // file server can answer it; `/_next/image` would need a running server.
  const index = readFileSync(new URL('index.html', exportDir), 'utf8');
  const localRefs = new Set(
    [...index.matchAll(/(?:src|href)="(\/[^"#]*)"/g)].map((match) =>
      match[1].replaceAll('&amp;', '&'),
    ),
  );
  assert.ok(localRefs.size > 0, 'index.html references no local assets');
  for (const ref of localRefs) {
    assert.doesNotMatch(ref, /\?/, `asset needs a server: ${ref}`);
    if (ref === '/') continue;
    assert.ok(
      existsSync(new URL(`.${decodeURIComponent(ref)}`, exportDir)),
      `asset missing from export: ${ref}`,
    );
  }
});

test('build output carries the share card with the production image', () => {
  const index = readFileSync(new URL('index.html', exportDir), 'utf8');
  const meta = (key) =>
    [...index.matchAll(/<meta\b[^>]*>/g)]
      .map((m) => m[0])
      .find((tag) => tag.includes(`"${key}"`));
  const image = meta('og:image');
  assert.ok(image, 'no og:image meta');
  assert.match(
    image,
    /content="https:\/\/anna-site\.anamata\.ai\/share\/anna-1200x630\.png"/,
  );
  assert.match(meta('og:image:width') ?? '', /content="1200"/);
  assert.match(meta('og:image:height') ?? '', /content="630"/);
  assert.match(meta('og:type') ?? '', /content="website"/);
  assert.match(meta('og:site_name') ?? '', /content="Anamata"/);
  assert.match(meta('og:locale') ?? '', /content="en_NL"/);
  assert.match(
    meta('og:url') ?? '',
    /content="https:\/\/anna-site\.anamata\.ai\/?"/,
  );
  assert.match(meta('twitter:card') ?? '', /content="summary_large_image"/);
  assert.match(
    meta('twitter:image') ?? '',
    /content="https:\/\/anna-site\.anamata\.ai\/share\/anna-1200x630\.png"/,
  );
  assert.match(
    meta('og:description') ?? '',
    /content="Anna is the digital AI assistant from Anamata that finishes recurring administration/,
  );
  assert.doesNotMatch(index, /hreflang/);
});
