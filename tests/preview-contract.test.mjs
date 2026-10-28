import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

// The preview site: every push to a branch other than main lands on
// dev.anna-site.anamata.ai, behind a shared password, with a key that can
// write only the preview folder. Production (user, key, approval gate) stays
// untouched. Shape agreed with Ezra on 2026-10-28.

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const workflow = read('../.github/workflows/deploy.yml');
const devCaddyfile = read('../deploy/Caddyfile.anna-site-dev');
const deployReadme = read('../deploy/README.md');

function job(name) {
  const source = workflow.match(
    new RegExp(`\\n  ${name}:\\n([\\s\\S]*?)(?=\\n  [a-z-]+:\\n|$)`),
  )?.[1];
  assert.ok(source, `missing job: ${name}`);
  return source;
}

test('previews every push to a branch other than main, after the tests', () => {
  const preview = job('preview');
  assert.match(preview, /needs: test/);
  assert.match(
    preview,
    /if: github\.ref_type == 'branch' && github\.ref != 'refs\/heads\/main'\n/,
  );
  // The environment gives the pull request a "deployed" link; it has no
  // required reviewer, the preview is automatic.
  assert.match(
    preview,
    /environment:\n      name: preview\n      url: https:\/\/dev\.anna-site\.anamata\.ai/,
  );
});

test('only pushes by collaborators can reach the preview key', () => {
  // A fork pull request runs without secrets; pull_request_target would hand
  // it ours. Neither trigger exists here: push only.
  // Prose may mention the trigger; the YAML must not declare it.
  assert.doesNotMatch(workflow, /\n\s+pull_request(_target)?:/);
  assert.match(workflow, /\non:\n  push:\n  workflow_dispatch:\n/);
});

test('the preview key is its own secret and writes only the preview folder', () => {
  const preview = job('preview');
  assert.match(preview, /secrets\.PREVIEW_SSH_KEY/);
  assert.doesNotMatch(preview, /DEPLOY_SSH_KEY/);
  assert.doesNotMatch(job('deploy'), /PREVIEW_SSH_KEY/);
  assert.match(workflow, /PREVIEW_USER: anna-site-preview/);
  // The server side restricts the key with rrsync to /var/www/anna-site-dev,
  // so the rsync target is the root of that restricted view.
  assert.match(preview, /"\$\{PREVIEW_USER\}@\$\{DEPLOY_HOST\}:\/"/);
  assert.match(preview, /StrictHostKeyChecking=yes/);
  assert.match(
    preview,
    /DEPLOY_KNOWN_HOSTS: \$\{\{ vars\.DEPLOY_KNOWN_HOSTS \}\}/,
  );
  assert.match(preview, /rsync [^\n]*--delete/);
  // rrsync's allow-list has no --chmod; the server umask sets 644/755.
  assert.doesNotMatch(preview, /--chmod/);
  assert.match(preview, /--exclude '\.vite\/'/);
});

test('the preview build uses the Turnstile test key, never the production key', () => {
  const preview = job('preview');
  // The production site key is bound to anna-site.anamata.ai; on the preview
  // hostname it would only show an error. The test key renders everywhere and
  // the preview form cannot reach the lead service anyway.
  assert.match(preview, /run: npm run build/);
  assert.doesNotMatch(preview, /TURNSTILE_SITE_KEY/);
  assert.doesNotMatch(preview, /download-artifact/);
});

test('the preview vhost is password-protected, not indexable and has no lead service', () => {
  assert.match(devCaddyfile, /^dev\.anna-site\.anamata\.ai \{$/m);
  assert.match(devCaddyfile, /basic_auth/);
  assert.match(devCaddyfile, /root \* \/var\/www\/anna-site-dev/);
  assert.match(devCaddyfile, /X-Robots-Tag "noindex, nofollow, noarchive"/);
  assert.match(devCaddyfile, /robots\.txt/);
  assert.match(devCaddyfile, /Disallow: \//);
  assert.doesNotMatch(devCaddyfile, /reverse_proxy/);
  assert.match(devCaddyfile, /\/api\/lead/);
  assert.match(devCaddyfile, /handle \/api\/lead \{\n\t\trespond 503\n\t\}/);
  // Same hardening headers as production.
  for (const header of [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
  ]) {
    assert.ok(devCaddyfile.includes(header), `missing header: ${header}`);
  }
});

test('lists the preview server steps for the human', () => {
  for (const step of [
    'useradd -m -s /bin/bash anna-site-preview',
    'rrsync',
    '/var/www/anna-site-dev',
    'caddy hash-password',
    'gh secret set PREVIEW_SSH_KEY',
    'dev.anna-site.anamata.ai',
    'Caddyfile.anna-site-dev',
    'Require approval for all external contributors',
  ]) {
    assert.ok(deployReadme.includes(step), `missing preview step: ${step}`);
  }
});

test('the repository has a front-page README that points at the preview', () => {
  assert.ok(existsSync(new URL('../README.md', import.meta.url)));
  const readme = read('../README.md');
  assert.match(readme, /npm test/);
  assert.match(readme, /dev\.anna-site\.anamata\.ai/);
  assert.match(readme, /deploy\/README\.md/);
});
