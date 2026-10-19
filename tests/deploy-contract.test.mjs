import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(
  new URL('../.github/workflows/deploy.yml', import.meta.url),
  'utf8',
);
const caddyfile = readFileSync(
  new URL('../deploy/Caddyfile.anna-site', import.meta.url),
  'utf8',
);
const readme = readFileSync(
  new URL('../deploy/README.md', import.meta.url),
  'utf8',
);

function job(name) {
  const source = workflow.match(
    new RegExp(`\\n  ${name}:\\n([\\s\\S]*?)(?=\\n  [a-z-]+:\\n|$)`),
  )?.[1];
  assert.ok(source, `missing job: ${name}`);
  return source;
}

test('builds and tests on every push', () => {
  assert.match(workflow, /\non:\n  push:\n  workflow_dispatch:\n/);
  const build = job('test');
  assert.match(build, /run: npm ci/);
  assert.match(build, /run: npm run build/);
  assert.match(build, /run: npm test/);
});

test('deploys every change on main, once a person approves it', () => {
  const deploy = job('deploy');
  assert.match(deploy, /needs: test/);
  // A merge (push) or a manual run, but only on main; never another branch.
  assert.match(deploy, /if: github\.ref == 'refs\/heads\/main'\n/);
  assert.doesNotMatch(deploy, /workflow_dispatch/);
  // The approval gate: the production environment requires a reviewer.
  assert.match(
    deploy,
    /environment:\n      name: production\n      url: https:\/\/anna-site\.anamata\.ai/,
  );
});

test('deploys on main queue instead of cancelling each other', () => {
  assert.match(
    workflow,
    /group: \$\{\{ github\.ref == 'refs\/heads\/main' && 'anna-site-deploy' \|\| format\('build-\{0\}', github\.ref\) \}\}/,
  );
  assert.match(workflow, /cancel-in-progress: false/);
});

test('rsyncs the tested export to vps-RGF with a dedicated key', () => {
  const deploy = job('deploy');
  assert.match(deploy, /secrets\.DEPLOY_SSH_KEY/);
  assert.match(deploy, /StrictHostKeyChecking=yes/);
  assert.match(deploy, /rsync [^\n]*--delete/);
  assert.match(deploy, /--exclude '\.vite\/'/);
  assert.match(workflow, /DEPLOY_USER: anna-site-deploy/);
  assert.match(workflow, /DEPLOY_PATH: \/var\/www\/anna-site/);
  assert.match(workflow, /path: dist\/client\//);
});

test('pins the vps-RGF host key instead of scanning it per run', () => {
  const deploy = job('deploy');
  assert.match(deploy, /DEPLOY_KNOWN_HOSTS: \$\{\{ vars\.DEPLOY_KNOWN_HOSTS \}\}/);
  assert.match(deploy, /test -n "\$DEPLOY_KNOWN_HOSTS"/);
  assert.match(deploy, /"\$DEPLOY_KNOWN_HOSTS" > ~\/\.ssh\/known_hosts/);
  assert.doesNotMatch(workflow, /ssh-keyscan/);
});

test('serves the export on anna-site.anamata.ai behind Caddy', () => {
  assert.match(caddyfile, /^anna-site\.anamata\.ai \{$/m);
  assert.match(caddyfile, /root \* \/var\/www\/anna-site/);
  assert.match(caddyfile, /file_server/);
});

test('routes /api/lead to the lead service on localhost only', () => {
  assert.match(caddyfile, /^\thandle \/api\/lead \{$/m);
  assert.match(caddyfile, /^\t\treverse_proxy 127\.0\.0\.1:8787$/m);
  const proxies = caddyfile.match(/^\s*reverse_proxy .*$/gm) ?? [];
  assert.deepEqual(proxies.map((line) => line.trim()), ['reverse_proxy 127.0.0.1:8787']);
});

test('builds with the Turnstile site key and refuses to deploy the test key', () => {
  const build = job('test');
  assert.match(
    build,
    /NEXT_PUBLIC_TURNSTILE_SITE_KEY: \$\{\{ vars\.TURNSTILE_SITE_KEY \}\}/,
  );
  const deploy = job('deploy');
  // Cloudflare's always-pass test key in a production build would make the
  // service drop every real request as spam.
  assert.match(deploy, /grep -rq '1x00000000000000000000AA' export\//);
  assert.ok(
    deploy.indexOf("1x00000000000000000000AA") < deploy.indexOf('rsync -rltz'),
    'the test-key check must run before rsync',
  );
});

test('lists the server steps for the human', () => {
  for (const step of [
    'ssh-keygen',
    'gh secret set DEPLOY_SSH_KEY',
    'gh variable set DEPLOY_KNOWN_HOSTS',
    '/etc/ssh/ssh_host_ed25519_key.pub',
    'useradd -m -s /bin/bash anna-site-deploy',
    '/var/www/anna-site',
    'caddy validate',
    'systemctl reload caddy',
    'Run workflow',
    'gh variable set TURNSTILE_SITE_KEY',
  ]) {
    assert.ok(readme.includes(step), `missing server step: ${step}`);
  }
});
