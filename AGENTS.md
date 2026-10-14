# AGENTS.md

Podman Desktop is an Electron desktop app for managing containers and Kubernetes, built with Svelte 5+, TypeScript, and Tailwind CSS 4+. It supports Podman, Docker, Lima, and CRC engines via a plugin-based extension system.

## Quick Start

```bash
pnpm install    # Install all dependencies (one command setup)
pnpm watch      # Start development with hot reload
```

## Single-File Verification

Lint a single file:

```bash
npx eslint path/to/file.ts
```

Type-check a single file:

```bash
npx tsc --noEmit path/to/file.ts
```

Run a single test file:

```bash
npx vitest run path/to/file.spec.ts
```

## Essential Commands

```bash
pnpm build                # Build all packages
pnpm compile:current      # Create production binary for current platform
pnpm test:unit            # Run all unit tests (Vitest)
pnpm test:unit:coverage   # Run with coverage report
pnpm test:e2e             # Full E2E suite (Playwright)
pnpm test:e2e:smoke       # Smoke tests only
pnpm typecheck            # TypeScript type checking (all packages)
pnpm lint:check           # ESLint check
pnpm format:check         # Biome + Prettier check
```

## Architecture

Electron multi-process architecture with pnpm monorepo. See [docs/adr/](docs/adr/) for decision records.

**Preconditions & invariants:**

- All IPC channels must be registered before the renderer window loads
- Extension API calls always go through the preload bridge — never bypass it
- Container provider registry is the single source of truth for engine state
- Extensions must not access Electron APIs directly; they use `@podman-desktop/api`

| Process  | Package             | Role                                                   |
| -------- | ------------------- | ------------------------------------------------------ |
| Main     | `packages/main`     | Node.js backend: engines, Kubernetes, extensions, tray |
| Renderer | `packages/renderer` | Svelte 5+ UI in Chromium, IPC to main                  |
| Preload  | `packages/preload*` | Security bridge exposing safe APIs                     |

### Key Packages

```
packages/main/          - Electron main process (Inversify DI, IPC handlers)
packages/renderer/      - Svelte UI (frontend)
packages/ui/            - Shared UI components (@podman-desktop/ui-svelte)
packages/api/           - Shared types between renderer, main, and preloads
packages/extension-api/ - Extension API (published as @podman-desktop/api)
extensions/             - Built-in extensions (podman, docker, compose, kind, etc.)
tests/playwright/       - E2E tests
storybook/              - UI component showcase
```

### Technology Stack

| Layer    | Technologies                       |
| -------- | ---------------------------------- |
| Runtime  | Electron 40+, Node.js 24+          |
| Language | TypeScript 5.9+ (strict mode)      |
| UI       | Svelte 5+, Tailwind CSS 4+         |
| Build    | Vite 7+, pnpm 10+                  |
| Testing  | Vitest 4+ (unit), Playwright (E2E) |
| Linting  | ESLint 9+, Biome                   |

## Guidelines

1. Read [CODE-GUIDELINES.md](CODE-GUIDELINES.md) before making changes
2. Run `pnpm lint-staged` before committing
3. Unit tests are mandatory for new features
4. Use Svelte 5 runes (`$state`, `$derived`, `$effect`) — see [CODE-GUIDELINES.md](CODE-GUIDELINES.md)
5. Use `vi.mock(import('./module'))` not `vi.mock('./module')` — see [CODE-GUIDELINES.md](CODE-GUIDELINES.md)
6. IPC patterns and DI — see [docs/adr/](docs/adr/)
7. Extension development — see `website/docs/extensions/`
8. We use semantic commits (e.g. `feat(renderer): add feature`)
9. Every commit must be signed; mention AI assistance

## Pull requests

- Never make a PR unless the developer explicitly asks you to do so.
- Body: Use the template defined in `.github/PULL_REQUEST_TEMPLATE.md`. Fill in every required section — no empty or placeholder descriptions.
- UI changes need before/after images or a short video. Use `mcp-testing` skill to capture screenshots
- Disclose AI-assisted work — add a `Co-authored-by:` trailer or a brief note in the PR description, and flag if the change was made only by AI without human review.
- Stand behind the change: the PR must be reviewable, explainable, and able to respond to review feedback.
- One concern per PR. If the description says "also", split it.
- See [LLM_POLICY.md](LLM_POLICY.md) for the full AI (LLM) development policy.

## Pattern References

- **Coding standards & Svelte patterns**: [CODE-GUIDELINES.md](CODE-GUIDELINES.md)
- **Contributing & development setup**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Architecture decisions**: [docs/adr/](docs/adr/)
- **Extension API docs**: `website/docs/extensions/`
- **Component library**: Run `pnpm --filter storybook dev`
