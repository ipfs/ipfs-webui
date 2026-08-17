# Releasing IPFS Web UI

## Release Process

1. Check that the [Transifex sync action](https://github.com/ipfs/ipfs-webui/actions/workflows/tx-pull.yml) is successful or fails because there are no updates.

2. If UI is materially different, update screenshots in `README.md` and on [docs.ipfs.tech](https://docs.ipfs.tech/how-to/command-line-quick-start/).

3. Manually dispatch the [ci.yml](https://github.com/ipfs/ipfs-webui/actions/workflows/ci.yml) workflow on `main` branch. If there are release-worthy commits, semantic-release creates a new GitHub Release with the changelog, the build CID in the notes, and the build CAR file attached.

4. Publishing the release automatically triggers [deploy-release.yml](https://github.com/ipfs/ipfs-webui/actions/workflows/deploy-release.yml), which downloads the CAR from the release, deploys its content to https://webui.ipfs.io (GitHub Pages) and points the production DNSLink at the same CID. Check that both of its jobs are green. If the dispatched run fails, or creates no release, https://webui.ipfs.io stays untouched.

5. If the release is good enough for LTS, update the CID at projects that use ipfs-webui by submitting PRs:
   - **Kubo**: https://github.com/ipfs/kubo/blob/master/core/corehttp/webui.go#L4
   - **IPFS Desktop**: https://github.com/ipfs/ipfs-desktop/blob/main/package.json#L20

## Redeploying or rolling back webui.ipfs.io

Manually dispatch [deploy-release.yml](https://github.com/ipfs/ipfs-webui/actions/workflows/deploy-release.yml) with any existing release tag (e.g. `v4.13.0`). It deploys that release's CAR file to GitHub Pages and DNSLink; this is the fastest way to recover from a bad release.
