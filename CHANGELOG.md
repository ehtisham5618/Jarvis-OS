# Changelog

## 0.1.22 - 2026-09-19

### Fixed

- Removed a Node crypto import that prevented renderer hydration.
- Replaced production startup timing/port guessing with bounded readiness checks and recovery UI.
- Made authentication asynchronous, deferred heavy native imports, bounded IPC waits, and prevented overlapping telemetry work.
- Preserved real Ollama offline/error behavior; corrected installed-model discovery, fragmented streaming, and cancellation.
- Corrected memory serialization/query handling, file shortcuts, chat layout, and close-to-tray behavior.
- Reduced idle wallpaper compositing and excluded generated artifacts from development watching.

### Build and documentation

- Align package version, installer filename, release tag, update metadata, and release notes at 0.1.22.
- Add targeted tests, native smoke tests, package verification, and explicit publication steps.
- Document supported behavior and verification limits instead of unverified performance/security guarantees.
- Use unpacked application resources after repeated ASAR assembly stalls on the verification machine.

See [release notes](docs/releases/v0.1.22.md) and [verification evidence](STABILIZATION.md).

## Earlier releases

The previous latest GitHub release was tagged `v0.1.21` but contained an installer and update metadata reporting `0.1.19`. Its release body did not document changes. Historical tags and assets are preserved; this release does not rewrite them.

The repository's earlier 0.1.0 notes described the initial chat, memory, voice, vision, automation, plugin, authentication, and desktop scaffolding. Those notes included performance and validation claims that were not established by the stabilization tests. Current support and test coverage are stated in the README and verification report.
