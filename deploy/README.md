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

If `caddy validate` fails, restore the backup instead of reloading. The
`/api/lead` proxy stays commented out until project H's service listens on
`127.0.0.1:8787`; enabling it is the same edit plus validate and reload.

## Deploying

1. Merge to `main`.
2. GitHub → Actions → "Build, test and deploy" → "Run workflow" on `main`.
3. Check the result:

```sh
curl -sI https://anna-site.anamata.ai/ | head -1
curl -s https://anna-site.anamata.ai/ | grep -o '<title>[^<]*</title>'
```

Expect `HTTP/2 200` and `<title>Anna | Anamata</title>`. Before DNS points at
vps-RGF, check on the server with
`curl -sk --resolve anna-site.anamata.ai:443:127.0.0.1 https://anna-site.anamata.ai/ -o /dev/null -w '%{http_code}\n'`
(the certificate is only issued once DNS resolves).

## Local preview

```sh
npm run build && npm start
```

`npm start` serves `dist/client/` with `vite preview`.
