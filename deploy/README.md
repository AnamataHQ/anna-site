# Deploying anna-site to vps-RGF

`npm run build` writes a static export to `dist/client/`. On every push,
`.github/workflows/deploy.yml` builds it and runs the tests. A deploy happens
only when someone starts the workflow by hand on `main`; that job rsyncs the
tested export to `/var/www/anna-site` on vps-RGF (136.144.164.80), where Caddy
serves it as `anna-site.anamata.ai`.

The deploy uses its own key and its own server user, `anna-site-deploy`, which
can write only `/var/www/anna-site`. It does not reuse the anamata.ai `deploy`
user or key.

Not covered here: DNS for `anna-site.anamata.ai`, and anything on vps-Anna.

## One-time setup (Ezra)

### 1. Create the deploy key (on your machine)

```sh
ssh-keygen -t ed25519 -N '' -C 'anna-site-ci-deploy' -f ./anna_site_deploy_key
```

### 2. Add the private key to GitHub

```sh
gh secret set DEPLOY_SSH_KEY -R AnamataHQ/anna-site < ./anna_site_deploy_key
```

Adjust `-R` if the repository lives elsewhere. Keep the `.pub` file for step 3,
then delete the private key file locally.

### 2b. Pin vps-RGF's host key in GitHub

The deploy trusts only this host key; it does not scan the host on each run.
On vps-RGF:

```sh
echo "136.144.164.80 $(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"
```

Then, on your machine, with that one line as the value:

```sh
gh variable set DEPLOY_KNOWN_HOSTS -R AnamataHQ/anna-site --body '136.144.164.80 ssh-ed25519 AAAA...'
```

The host key is public, so it is a repository variable, visible under
Settings → Secrets and variables → Actions → Variables. If the server's host
key ever changes, the deploy fails until this variable is updated.

### 3. Deploy user and web root (on vps-RGF)

Replace `<public key>` with the single line from `anna_site_deploy_key.pub`.

```sh
sudo useradd -m -s /bin/bash anna-site-deploy
sudo install -d -m 700 -o anna-site-deploy -g anna-site-deploy /home/anna-site-deploy/.ssh
echo 'restrict <public key>' | sudo tee /home/anna-site-deploy/.ssh/authorized_keys >/dev/null
sudo chown anna-site-deploy:anna-site-deploy /home/anna-site-deploy/.ssh/authorized_keys
sudo chmod 600 /home/anna-site-deploy/.ssh/authorized_keys
sudo install -d -m 755 -o anna-site-deploy -g anna-site-deploy /var/www/anna-site
sudo -u anna-site-deploy touch /var/www/anna-site/.write-test && sudo -u anna-site-deploy rm /var/www/anna-site/.write-test && echo 'deploy user can write the web root'
```

`restrict` turns off port forwarding, agent forwarding and a terminal for this
key; rsync still works.

### 4. Caddy vhost (on vps-RGF)

Copy `deploy/Caddyfile.anna-site` to the server, then:

```sh
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d)
cat Caddyfile.anna-site | sudo tee -a /etc/caddy/Caddyfile >/dev/null
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
```

If `caddy validate` fails, restore the backup instead of reloading. The block
routes `/api/lead` to the lead service on `127.0.0.1:8787`
(AnamataHQ/anamata-leads, set up with its own `deploy/README.md`). Until that
service runs, the form answers with its mailto fallback.

### 5. Turnstile site key (GitHub)

The lead form's spam check needs the site key of the Turnstile widget in
Cloudflare. It is public, so it is a repository variable:

```sh
gh variable set TURNSTILE_SITE_KEY -R AnamataHQ/anna-site --body '<site key>'
```

Without it the build falls back to Cloudflare's test key, and the deploy job
refuses to ship that build. The matching secret key goes only on the server,
in the lead service's environment file.

### 6. Approval gate (GitHub)

The `production` environment holds the approval: a required reviewer, and only
`main` may deploy. Reviewers are enforced because the repo is public; on a
private repo GitHub Free would silently skip them.

```sh
gh api -X PUT repos/AnamataHQ/anna-site/environments/production --input - <<'JSON'
{"reviewers":[{"type":"User","id":149796980}],"prevent_self_review":false,"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}
JSON
gh api -X POST repos/AnamataHQ/anna-site/environments/production/deployment-branch-policies -f name=main -f type=branch
```

`149796980` is EzraAnamata; look up another reviewer's id with
`gh api users/<login> --jq .id`.

## Deploying

1. Merge to `main`. The workflow builds, tests, then waits for approval.
2. Approve it: open the run (GitHub → Actions → "Build, test and deploy"),
   click "Review deployments", tick `production` and "Approve and deploy".
   Only listed reviewers can approve, and only `main` can deploy. To redeploy
   without a new merge, use "Run workflow" on `main`; it waits for approval too.
3. Check the result:

```sh
curl -sI https://anna-site.anamata.ai/ | head -1
curl -s https://anna-site.anamata.ai/ | grep -o '<title>[^<]*</title>'
```

Expect `HTTP/2 200` and `<title>Anna | Anamata</title>`. Before DNS points at
vps-RGF, check on the server with
`curl -sk --resolve anna-site.anamata.ai:443:127.0.0.1 https://anna-site.anamata.ai/ -o /dev/null -w '%{http_code}\n'`
(the certificate is only issued once DNS resolves).

## Preview site: dev.anna-site.anamata.ai

Every push to a branch other than `main` lands on
https://dev.anna-site.anamata.ai, automatically, behind one shared password.
The last push wins; with two open branches the later push replaces the earlier
one. The preview job in `deploy.yml` builds the branch again without the
Turnstile site key (the production key is bound to the production hostname) and
rsyncs the export to `/var/www/anna-site-dev` with its own user and key. The
preview vhost (`deploy/Caddyfile.anna-site-dev`) has no lead service, so a test
submission shows the form's mail fallback, and it sends `noindex` plus a
`robots.txt` that disallows everything.

Why this cannot touch production: only collaborators can push to the repo, a
fork pull request runs without secrets (and there is no `pull_request`
trigger), and the preview key is restricted on the server with `rrsync` to the
preview folder. The production user, key and approval gate are not involved.

### 1. Create the preview key (on your machine)

```sh
ssh-keygen -t ed25519 -N '' -C 'anna-site-ci-preview' -f ./anna_site_preview_key
gh secret set PREVIEW_SSH_KEY -R AnamataHQ/anna-site < ./anna_site_preview_key
cat ./anna_site_preview_key.pub
```

Keep the printed public key for step 2, then delete the private key file. The
host key is already pinned (`DEPLOY_KNOWN_HOSTS`, same server).

### 2. Preview user, folder and restricted key (on vps-RGF)

`rrsync` is the restricted rsync shell that ships with rsync; the key may then
run nothing but an rsync into the preview folder. Replace `<public key>` with
the single line from step 1.

```sh
sudo useradd -m -s /bin/bash anna-site-preview
sudo install -d -m 755 -o anna-site-preview -g anna-site-preview /var/www/anna-site-dev
command -v rrsync || { sudo gunzip -c /usr/share/doc/rsync/scripts/rrsync.gz | sudo tee /usr/local/bin/rrsync >/dev/null && sudo chmod 755 /usr/local/bin/rrsync; }
sudo install -d -m 700 -o anna-site-preview -g anna-site-preview /home/anna-site-preview/.ssh
echo "command=\"$(command -v rrsync) -wo /var/www/anna-site-dev\",restrict <public key>" | sudo tee /home/anna-site-preview/.ssh/authorized_keys >/dev/null
sudo chown anna-site-preview:anna-site-preview /home/anna-site-preview/.ssh/authorized_keys
sudo chmod 600 /home/anna-site-preview/.ssh/authorized_keys
```

`-wo` makes the folder write-only for the key: it can upload, never read.

### 3. Password and Caddy vhost (on vps-RGF)

Pick the shared password, hash it, and put the hash in the vhost. The password
itself is stored nowhere; you hand it to the people who may look.

```sh
caddy version
caddy hash-password
```

Copy `deploy/Caddyfile.anna-site-dev` to the server, then with the printed
hash:

```sh
sed -i 's|REPLACE_WITH_HASH|<hash>|' Caddyfile.anna-site-dev
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d)
cat Caddyfile.anna-site-dev | sudo tee -a /etc/caddy/Caddyfile >/dev/null
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
```

If `caddy validate` fails, restore the backup instead of reloading. On a Caddy
older than 2.8 the directive is spelled `basicauth`; older than 2.7 has no
heredoc, so write the `robots.txt` response on one line instead.

To change the password later: `caddy hash-password` again, replace the hash
line in `/etc/caddy/Caddyfile`, validate, reload, and tell the people who
should keep access.

### 4. Fork pull requests need your approval (GitHub)

Settings → Actions → General → "Fork pull request workflows from outside
collaborators" → "Require approval for all external contributors". Fork pull
requests never get secrets anyway; this also stops their build from running
until you say so.

### 5. Check

```sh
curl -sI https://dev.anna-site.anamata.ai/ | head -1
curl -sI -u viewer:<password> https://dev.anna-site.anamata.ai/ | head -1
curl -s https://dev.anna-site.anamata.ai/robots.txt
```

Expect `HTTP/2 401`, then `HTTP/2 200`, then `Disallow: /`. Push any branch and
the "Preview on dev.anna-site.anamata.ai" job uploads it; the pull request
shows the preview link under its deployments.

## Local preview

```sh
npm run build && npm start
```

`npm start` serves `dist/client/` with `vite preview`.
