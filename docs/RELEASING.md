# Releasing Jarvis

Version numbers must match in `package.json`, the root package entries in `package-lock.json`, the Git tag (`vVERSION`), installer, `latest.yml`, and release notes. Keep existing published tags and assets unchanged.

## Prepare

1. Run `npm version VERSION --no-git-tag-version --ignore-scripts`.
2. Update `CHANGELOG.md` and add `docs/releases/vVERSION.md`. Describe actual changes, checks, and limitations.
3. Run the source checks and native integration tests in [DEVELOPMENT.md](DEVELOPMENT.md).
4. Build sequentially with `npm run build:electron`. This command never publishes. Windows assets are written to `release/`.
5. Verify the packaged app, installer payload, and update metadata. `latest.yml` must name the exact uploaded installer and contain its real SHA-512 and size. Include the installer blockmap if produced.
6. Commit the source and documentation, push master, and create/push a new tag pointing at that exact commit. Do not force-push historical tags.

## Publish

Create a GitHub draft release using the committed notes file. Upload the installer, `.exe.blockmap`, `latest.yml`, and `SHA256SUMS.txt`. Verify the uploaded assets before publishing the draft as the latest release. Do not commit these binaries to Git.

The Release workflow is manually dispatched with an existing tag. It verifies tag/package version agreement, runs checks, builds Windows assets, and creates a **draft** release. It does not automatically publish on a tag push or overwrite an existing release. This avoids racing a separately verified local build.

For local builds, use `gh release create TAG --verify-tag --draft --title "Jarvis VERSION" --notes-file docs/releases/TAG.md`, followed by asset upload and draft publication. Never rewrite version metadata to disguise an older installer as a newer build.

## Packaging notes

Application resources currently use `asar: false`; the complete `win-unpacked` directory must remain together. The post-package hook validates required main/preload/server files and renderer assets. Without signing credentials the application is unsigned. CI accepts optional `WINDOWS_CERTIFICATE_BASE64` and `WINDOWS_CERTIFICATE_PASSWORD` secrets through electron-builder's `CSC_LINK` and `CSC_KEY_PASSWORD` variables.

Large native dependencies can make compression slow. `ELECTRON_BUILDER_COMPRESSION_LEVEL=0` can reduce overhead for a local build. Always remove an interrupted version-specific archive cache before retrying: the builder may otherwise consider a partial archive current. Verify the new payload after packaging.

The stabilization report records historical test evidence. Do not replace its measured results with unmeasured release claims.
