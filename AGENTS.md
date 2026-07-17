# AGENTS.md

Guidance for coding agents working in this repository. Humans may find it useful too.

## Build and test

- `npm ci` installs dependencies, `npm run build` builds into `build/` (create-react-app via react-app-rewired-esm)
- `npx jest <path>` runs a single unit test file, `npm run test:unit` the suite
- `npm run eslint` and `npm run typecheck` must pass; CI treats warnings as errors
- Node.js version is pinned in `.tool-versions`
- translations live in `public/locales` and are managed on Transifex; see `docs/LOCALIZATION.md` before touching them

## Commit conventions

- follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/); semantic-release derives version bumps and the changelog from commit titles on `main` (config in `package.json` under `release`)
- `chore:`, `docs:`, and `test:` commits trigger patch releases; use the `no-release` scope for commits that should not be released

## Release and deployment flow

The release process for humans is described in `docs/RELEASING.md`. The machinery:

1. Every merge to `main` (`ci.yml`, job `publishPreview`): the build is added to IPFS and pinned, exported as a CAR file kept as a run artifact, the dev DNSLink (`_dnslink.dev.webui`, zone `ipfs.tech`) is updated, and the build is force-pushed to the `ipfs/dev.webui.ipfs.io` repo, which GitHub Pages serves as https://dev.webui.ipfs.io.
2. A maintainer manually dispatches `ci.yml` on `main`: if release-worthy commits exist, semantic-release publishes a GitHub Release with the CID in the notes and the CAR file attached. That CAR is the canonical source of truth for the release; everything user-facing deploys from it.
3. Publishing the release triggers `deploy-release.yml`: it downloads the CAR from the release, verifies the root CID, deploys the content to https://webui.ipfs.io (GitHub Pages, this repo) and points the production DNSLink (`_dnslink.webui`) at the same CID. A failed or skipped release never changes https://webui.ipfs.io.
4. `deploy-release.yml` can be dispatched manually with a release tag to redeploy or roll back https://webui.ipfs.io.

Forks: pinning and publishing steps are gated on `github.repository == 'ipfs/ipfs-webui'`, so CI in forks skips them instead of failing on missing secrets.

## Hosting notes

- the app is a static, hash-routed build with relative asset paths; it works from GitHub Pages, any IPFS gateway path, and as `ipns://webui.ipfs.io` via IPFS Companion
- both hostnames are CNAMEs to `ipfs.github.io` (DNS-only) in the `ipfs.io` zone; the `_dnslink.*` TXT records are load-bearing for IPFS-native access and must never be removed
- Kubo and IPFS Desktop bundle release CIDs directly (see `docs/RELEASING.md`), independent of the hosted sites
