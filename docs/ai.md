# Use the library with an AI coding assistant

The package includes a consumer-facing
[react-desktop-shell skill](../skills/react-desktop-shell/SKILL.md). It helps
an assistant select components, check the installed API, connect state and
events, import styles, and compose UI from the public package exports.
Recipes are adapted from this repository's `example/` pages, with demo-only
wrappers and internal imports removed.

The skill is documentation, not a runtime dependency. Installing the npm
package makes the files available; it does not automatically activate a skill
in your editor or change your project's agent instructions.

## Install as a project skill in Codex

From the consuming application's directory, after installing a release that
includes `skills/react-desktop-shell`, copy the entire skill directory into
`.agents/skills/react-desktop-shell`. For a typical Node installation, this
command resolves the actual package location and refuses to overwrite an
existing skill:

```sh
node --input-type=module <<'NODE'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

const require = createRequire(join(process.cwd(), 'package.json'))
const packageRoot = dirname(require.resolve('react-desktop-shell/package.json'))
const source = join(packageRoot, 'skills', 'react-desktop-shell')
const destination = resolve('.agents/skills/react-desktop-shell')
if (!existsSync(source)) throw new Error('This release does not include the skill.')
if (existsSync(destination)) throw new Error('Skill already exists; review it before replacing it.')
mkdirSync(dirname(destination), { recursive: true })
cpSync(source, destination, { recursive: true, force: false, errorOnExist: true })
console.log(`Installed ${destination}`)
NODE
```

Use the Node launcher configured by your package manager if it needs a custom
resolver. Commit the copied directory if the skill should be shared by your
team. After upgrading the dependency, review and refresh the copy from the
installed release, preserving any intentional local changes.

Ask Codex, for example:

```text
Use $react-desktop-shell to add a validated settings form to this project.
Keep the existing application layout and use the installed library version.
```

Codex discovers project skills in `.agents/skills`; other assistants may use
different installation locations or loading mechanisms. See the
[official Codex skill documentation](https://developers.openai.com/zh-Hans/docs/build-skills).

## Use without installing a skill

For an assistant with project-file access, copy this prompt. Replace the last
line with the actual task:

```text
This project uses react-desktop-shell. Resolve the package from this application's
directory and inspect its installed version and public exports. Read its
skills/react-desktop-shell/SKILL.md and only the references relevant to this task.
If this release has no skill, use its available README, docs/components.md, and
public TypeScript declarations instead.

Use components that fit the request, preserve the project's architecture, and
follow the installed version's actual props and event signatures. Include the
required styles and reuse existing shell/provider boundaries. Do not copy demo
internals or guess APIs from other UI libraries. Explain any missing capability.

Task: Add a validated settings form to this project.
```

For an assistant without file access, attach `SKILL.md`, the relevant reference
files, and the installed component declarations or matching documentation.
A file path in a prompt does not give a remote chat access to your filesystem.

## Contents and versioning

The [component selection map](../skills/react-desktop-shell/references/components.md)
routes to composition, forms, data/collections, navigation/commands, feedback,
and conversation recipes. Each recipe identifies its source example where
applicable; those source files are optional maintainer context, not required
consumer dependencies.

The skill is distributed with the same npm artifact as the implementation and
declarations. Copied skills can drift, so the entry point instructs assistants
to prefer the resolved dependency's exports, declarations, and bundled
references. A capability on the repository's main branch or in `Unreleased`
does not imply that an older published version supports it.

When changing a public API, update its affected recipe and selection entry as
part of the same change. Keep exact signatures in the declarations and explain
behavior/decisions in the skill, rather than maintaining a second exhaustive
API manual. No MCP server or runtime installer is required for this workflow.
