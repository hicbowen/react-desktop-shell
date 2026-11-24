# Release process

## Before publishing

1. Add user-visible changes to the `Unreleased` section of
   [CHANGELOG.md](../CHANGELOG.md).
2. Update [migration.md](migration.md) for a breaking change or deprecation.
   Update the affected [consumer skill references](../skills/react-desktop-shell/SKILL.md)
   when changing public imports, props, or component behavior.
3. Run `npm run verify` during normal development.
4. Run `npm pack --dry-run` and inspect the file list and package size, including
   `skills/react-desktop-shell/SKILL.md` and its `references/` directory.
5. Bump the version only after the release contents are final.

`npm run verify:publish` is also run automatically by `prepack`. It checks
formatting for release-owned files, lint, the production build, every export
target, declaration hygiene, and an 8 MiB unpacked `dist` budget. The full test
suite intentionally remains in `verify`, not `prepack`, so packaging stays a
lightweight deterministic gate.

## Formatting rollout

The repository predates one consistent formatter. Prettier currently owns
release documents, manifests, and scripts. Source formatting remains enforced
by ESLint and should be migrated component-by-component to avoid format-only
changes obscuring behavioral reviews.

## Changelog style

Use Keep a Changelog headings: `Added`, `Changed`, `Deprecated`, `Removed`,
`Fixed`, and `Security`. Describe consumer-visible outcomes, not internal commit
history. Move `Unreleased` entries under the new version and release date.
