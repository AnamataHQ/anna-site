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

test('deploys only from a manual run on main', () => {
  const deploy = job('deploy');
  assert.match(deploy, /needs: test/);
  assert.match(
    deploy,
    /if: github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main'/,
  );
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

test('serves the export on anna-site.anamata.ai behind Caddy', () => {
  assert.match(caddyfile, /^anna-site\.anamata\.ai \{$/m);
  assert.match(caddyfile, /root \* \/var\/www\/anna-site/);
  assert.match(caddyfile, /file_server/);
  assert.match(caddyfile, /^\s*# handle \/api\/lead \{$/m);
  assert.match(caddyfile, /^\s*# \treverse_proxy 127\.0\.0\.1:8787$/m);
  assert.doesNotMatch(caddyfile, /^\s*reverse_proxy/m);
});

test('lists the server steps for the human', () => {
  for (const step of [
    'ssh-keygen',
    'gh secret set DEPLOY_SSH_KEY',
    'useradd -m -s /bin/bash anna-site-deploy',
    '/var/www/anna-site',
    'caddy validate',
    'systemctl reload caddy',
    'Run workflow',
  ]) {
    assert.ok(readme.includes(step), `missing server step: ${step}`);
  }
});
