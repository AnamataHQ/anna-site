# anna-site

The website for Anna, the digital AI assistant by Anamata: https://anna-site.anamata.ai

A static site (React, built with vinext) that exports to `dist/client/` and is
served as plain files. The homepage and the privacy statement are in English
and Dutch.

## Working on it

```sh
npm ci
npm run dev                  # local dev server, also reachable from other devices
npm test                     # contract tests against the source and the build
npm run build && npm start   # build the export and preview it locally
```

## Deploying

Every push builds the site and runs the tests.

- A push to any branch other than `main` also lands on the preview site,
  https://dev.anna-site.anamata.ai, behind a shared password. The last push
  wins. Use it to review a branch or to show it to someone.
- A merge to `main` deploys to production once a person approves it.

Setup and runbook for both: `deploy/README.md`.
