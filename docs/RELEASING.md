# Releasing IPFS Web UI

## Release Process

1. Check that the [Transifex sync action](https://github.com/ipfs/ipfs-webui/actions/workflows/tx-pull.yml) is successful or fails because there are no updates.

2. If UI is materially different, update screenshots in `README.md` and on [docs.ipfs.tech](https://docs.ipfs.tech/how-to/command-line-quick-start/).

3. Manually dispatch the [ci.yml](https://github.com/ipfs/ipfs-webui/actions/workflows/ci.yml) workflow on `main` branch. This will create a new release.

4. If the release is good enough for LTS, update the CID at projects that use ipfs-webui by submitting PRs:
   - **Kubo**: https://github.com/ipfs/kubo/blob/master/core/corehttp/webui.go#L4
   - **IPFS Desktop**: https://github.com/ipfs/ipfs-desktop/blob/main/package.json#L20
