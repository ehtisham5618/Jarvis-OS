# Contributing

Use Node.js 24, npm, and the committed `package-lock.json`. Read [development and testing](docs/DEVELOPMENT.md) before changing native services.

Keep UI routes dependent on service interfaces. Register native handlers once, avoid synchronous main-thread work, bound external requests, and clean up subscriptions/timers. Do not replace unavailable native or AI services with fabricated success in the desktop application.

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run electron:build-main`, and `npm run build`. Run the native smoke suite when changing Electron, IPC, startup, or native services. Describe untested interactions explicitly.

Use focused commits (for example `fix(startup): recover from renderer failure`) and explain behavior, validation, and limitations in pull requests. Update the relevant documentation and changelog when behavior changes. Keep generated binaries, personal profiles, logs, and credentials out of commits. Release publication follows [the release procedure](docs/RELEASING.md).
