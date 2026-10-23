# podman-desktop review rules

Rules distilled from ~1200 real review comments by maintainer benoitf. Each has been raised on real PRs; do not soften them.

## 1. PR hygiene (most frequent feedback by far)

- issue: The PR does exactly what its title and body say. Any change not needed for the stated goal (reformatting, reordering imports, renames, quote changes, spacing, drive-by cleanups, touching `.gitignore` / `package.json` scripts / workspace config / other components) goes to a separate PR. When a PR touches a file its title does not explain, ask why.
- issue: One concern per PR (or at least per commit): API change, extension change, UI change, refactor, docs and bug fix are reviewed separately. Prerequisite refactors (making a class injectable, extracting an `init()`, moving instance creation to `beforeEach`) land first in their own PR.
- issue: A Svelte 4→5 migration PR contains only the mechanical migration (`export let`→`$props()`, `$:`→`$derived`, `on:click`→`onclick`). No renames, no style→class conversion, no touching other components or callers.
- issue: Do not rename variables, methods or files without a need. A file move is a pure move with no content change so git shows a rename.
- issue: Do not change existing tests and implementation in the same PR; fix wrong tests separately so it is clear which side was wrong.
- issue: Title and body match the final content and use the right semantic type (`fix`, `feat`, `refactor`, `test`, `chore`, `docs`) with a `(scope)`. The body explains the problem, not only the solution, and is updated when scope changes during review. UI changes include before/after screenshots. Reference a GitHub issue.
- issue: CI green before review: typecheck, lint, formatter, unit tests, DCO sign-off, semantic PR title. Every commit signed. No merge commits; squash or keep atomic commits; rebase when conflicting.
- issue: Address CodeRabbit/automated review findings, or explain why they are wrong, before asking for human review. Reply to every reviewer comment.
- issue: Platform-specific or engine-level changes (Windows, macOS, ARM, installers, Podman bumps, native fetch) need validation on that platform or QE approval; visible UI changes need UX designer approval. State which platforms you verified on.
- issue: Before removing or changing existing behaviour, check `git log`/`git blame` for why it was introduced; a "dead" store may be an unfinished feature, and removing a guard may reintroduce a fixed bug.
- issue: Follow the existing design patterns and screens; a change inventing a new pattern where a sibling pattern exists is rejected even if the underlying bug is real. New extensibility domains and public API changes are discussed in an issue first.
- nit: Manually verify end-to-end (run the app, open the page, check the produced artifact) before approving; don't land risky changes right before a release.
- nit: Every new file carries the Apache-2.0 header with the current year only (no copied `2022-2024` range), including GitHub workflow YAML files.
- nit: No typos in identifiers, comments or user-facing text (palette not pallet). Brand spellings: `macOS`→`MacOSPlatform`, `Hyper-V`→`HYPER_V` / `hyper-v-installed-check`.

## 2. Unit tests (Vitest)

- issue: Every new or changed behaviour, including bug fixes and error paths, ships with unit tests in the same PR.
- issue: Mock modules with `vi.mock(import('./module'))` automocking and configure with `vi.mocked(fn)` / `vi.mocked(Class.prototype.method)`. No `vi.spyOn`, no hand-written factories, no custom mock subclasses, no typed `Mock` constants, no `vi.hoisted`, when automocking suffices.
- issue: Renderer tests: every `window.*` preload method is already auto-mocked by `vite.tests.setup`. Never `Object.defineProperty(window, ...)` or `vi.stubGlobal` for them; just `vi.mocked(window.xxx).mockResolvedValue(...)` in `beforeEach`. Missing globals (`matchMedia`, timeouts) go into the shared setup file, not into specs.
- issue: `vi.resetAllMocks()` in `beforeEach`. No `vi.clearAllMocks`, no `vi.restoreAllMocks`, no `afterEach`/`afterAll` cleanup, no `beforeAll`: every test starts from a fresh state built in `beforeEach`.
- issue: Do not touch `vitest` config files or shared test helpers/stores just to make one new test pass; fix the test.
- issue: Do not duplicate production logic or source constants in specs; read the real values from the object under test, use the same library the implementation uses, and call the real protected method through a `TestXxx extends Xxx` subclass declared in the spec instead of exporting internals.
- issue: Test the contract of an injected dependency by mocking its methods, not by reproducing its internals (e.g. setting every CI env var). If a test needs to mock something that should be injected, inject it.
- issue: No real network in unit tests (`msw` for HTTP; `nock` was dropped). Tests assert the actual outcome (resulting order, rendered value), not merely that something was called.
- issue: Keep default `waitFor`/polling intervals and timeouts; no few-millisecond intervals, no real debounce delays. Unit-test extracted logic or use fake timers. In components use `waitFor`/`vi.waitUntil`, never `await tick()`; prefer `findBy`/`getBy` over `vi.waitFor(() => queryBy...)`; prefer positive assertions over `waitUntil(() => !!x)`.
- issue: Do not flip an existing assertion to codify a regression.
- nit: `mockResolvedValue`/`mockReturnValue` over `mockImplementation(async () => ...)`; resolve void functions to `undefined`, not `''`. For a never-resolving mock use one `never = (): Promise<never> => new Promise<never>(() => {})` helper.
- nit: `test.each` for repetitive cases; no `SCREAMING_SNAKE_CASE` mock instances; no mocks copy-pasted from other specs that this test does not need; realistic, coherent fixtures with correct types (`readdir` returns Dirent-like values); update test names when the code they describe is renamed.
- nit: Snapshot tests and new fixture-directory conventions need a team discussion first.

## 3. Svelte 5 / renderer

- issue: Computed values use `$derived` / `$derived.by` (including `await` inside `$derived` for async data). `$effect` is only for side effects such as `router.goto`, never to assign state. Never disable `svelte/prefer-writable-derived`; restructure the state instead. No `$:` in new code.
- issue: Data loading must be reactive to prop changes: no fetching in `onMount`, no raw Promise stored in state, no id snapshots kept from `onMount`. Derived state must not be frozen by `undefined` guards or `{@const}` workarounds that keep a previous item's value.
- issue: Migrating `$:` to runes preserves the full original semantics (initial derivation, `.then` handlers, try/catch, intermediate status updates). Diff the old and new behaviour line by line.
- issue: Props: always a `Props` interface; extend `HTMLAttributes<HTMLXElement>` (or the element-specific type) instead of ad-hoc `class?`/`style` props; append `{className}` at the end of the class string (see `packages/ui/src/lib/progress/ProgressBar.svelte`), do not convert `class` to an array.
- issue: Tailwind utility classes only; no `<style>` blocks, no inline `style=`; add an `@utility` if a value is missing. New code uses the short variable syntax `text-(--pd-var)` without rewriting existing lines.
- issue: Logic (parsing, validation, computation) lives in a `.ts` class so it can be unit-tested; the component only passes arguments and renders. Filtering by feature/setting belongs in the store; renderer stores are fed by IPC events through `EventStore`, never by fetch calls.
- issue: A component decides its own visibility (render nothing when its feature is disabled) instead of every caller guarding it. Cross-cutting behaviour (table persistence, layout) belongs in the podman-desktop wrapper around the agnostic `packages/ui` component, which never calls `window.*`.
- issue: No feature-specific code in `App.svelte` or other once-loaded roots; use a generic mechanism.
- issue: `{#each}`/table keys must be unique across engines (include `engineId` for images) and tolerate objects missing metadata.
- issue: Migrate components in place, never a duplicated `XxxV5` copy; keep existing prop/slot names; when a shared UI component moves to `on*` callbacks keep dispatching the legacy event if no callback is given.
- issue: No `tick()` in component code. Never use Node types (`NodeJS.Timeout`) in renderer code; fix tsconfig libs instead of `ReturnType<typeof setTimeout>`.
- nit: Inside `{#if value}` use `{@const current = value}` instead of re-checking or optional-chaining `value`. Attribute shorthand `{name}` when names match. `$state()` not `$state(undefined)`. Pass `$state.snapshot()` through `window.*` IPC calls. Don't clone `$state` collections when a `map` replacing one entry suffices.
- nit: Prefer `$derived(helper(...))` with a small undefined-safe helper over `$derived.by` blocks with intermediate state. Validate required props once right after `$props()`. Reuse components and data-driven `{#each}` loops instead of near-identical markup. Import typed FontAwesome definitions (`faGear`), not class strings. Name components after what they display, not an assumed usage (`Manager`, `Generic`).
- nit: Defaults are owned by the component or the configuration key definition, not repeated by every caller. Router helpers guarantee defined values so routes don't need `{#if request}` guards.

## 4. TypeScript

- issue: No `!` non-null assertion. In tests use `assert(value)` (narrows) instead of `expect(value).toBeDefined()`. No `as X` / `as unknown as X` without a runtime check: fix the type at the source or narrow with a real check; `isXxx()` helpers are type guards returning `boolean` and throw on failure, never a third `undefined` state.
- issue: `undefined`, never `null` (eslint no-null). Optional members declared as `name?: T`, not `T | undefined`. Boolean capability flags in shared API types are required (defaulting to false). No `any`; use generics or existing sibling types.
- issue: No `eslint-disable` comments; make the code compliant (exception: intentionally empty interfaces extending `Omit<...>` disable the rule locally rather than adding a dummy field).
- issue: No synchronous APIs (`execSync`, `fs.*Sync`) in async code; use `fs/promises` and promisified equivalents. No `void promise` to discard a promise: handle or await it. Prefer `async/await` over `.then` chains.
- issue: Never swallow errors: every `catch` logs (`console.error` for failures, `debug` at minimum) with identifying context (which entity/table failed); resilient loading (`allSettled`) still logs root causes; cleanup that must always run goes in `finally`. Validation warnings belong inside the helper that validates, not in callers or a Svelte `$effect`.
- issue: Refactors preserve semantics: optional chaining applied consistently on both sides; `String(value ?? '')` when the value may be undefined; assign a value once (`x ??= await compute()`); no checks impossible by construction; no guards for compile-time JSON imports.
- issue: Helpers are methods on the class/object they operate on, added only where used. Module-level constants and helpers live inside the class (`protected static readonly`, private methods), not at file scope. Exported constants/types get scoped names (`HEALTH_MONITOR_STATUS`, not `STATUS`).
- issue: Plain string literals unless interpolating; extract repeated literals (paths, config keys) into well-named constants, separating folder and filename; no `import X = NodeJS.X` aliases.
- issue: Add rule enforcement at lint/CI time rather than runtime warnings when a constraint must hold.
- nit: `??` not `||` for defaults; object shorthand `{ foo }`; `toSorted()` not `sort()` (migrate the touched file); enums or discriminated unions (`{ kind: 'Pod' } & PodInfo`) over loose strings; options object over many positional optionals; build strings by pushing to an array and `join(' ')`; arrow functions consistently; generic type params `T` or `XxxType`, never shadowing globals like `Request`.
- nit: Prefer an info object or an order value over a bare boolean when consumers may need more later (theme info vs `isDark`). Name parameters after their type/role (`menu`, not `action`), grammatically (`overridden`). Remove comments, JSDoc and empty constructors that add nothing; TSDoc must add value beyond the signature; consistent indentation.

## 5. Imports & package boundaries

- issue: Path aliases only: `/@/` inside a package, `/@api/` for `packages/api`, `/@product.json`. No relative `../` cross-directory imports, never `../../../<pkg>/src`. Do not add new tsconfig path aliases into other packages: consume them via their `package.json` exports, and move shared code to `packages/ui`/`packages/api` first.
- issue: Shared types live in `packages/api`, which never imports from `packages/main`. UI/renderer objects never leak into `packages/main`: main holds domain models, renderer maps them.
- issue: Extensions depend on core only through `@podman-desktop/api`. Kubernetes features go to the Kubernetes extension, engine-specific logic (podman config, `.containers` folder, podman CLI calls, Hyper-V) goes to that engine's extension; core and renderer stay provider-agnostic.
- issue: All `import`/`require` at the top of the file; no dynamic path-resolving imports in the body. Node built-ins use the `node:` prefix.

## 6. Main process, DI (Inversify) and IPC

- issue: No exported or file-scope standalone functions in Inversify-managed packages, even when the touched file already has one (existing precedent is not a licence to add more): logic goes in an injectable class bound as a singleton, or a private/protected method. Never `new` a collaborator; inject it (or an injected builder/factory). No static methods/fields on injected singletons. Prefer polymorphism (a subclass for dev mode) over `if (mode)` branches.
- issue: Bindings: `bind(X).toSelf().inSingletonScope()` for classes, `toService()` to map interfaces; symbol declared right before its interface with the same name (no `*Symbol` suffix); every injectable has a binding; `@optional()` for platform-specific ones; don't reorder container bindings, ordering lives where `init()` is called.
- issue: Empty constructors; initialisation in `init()`/`@postConstruct()`. Dispose every `Disposable` returned by `onDidChange*` subscriptions. Every registered configuration property declares a default. Each property injection (`@inject` on fields) is fine and preferred for new classes.
- issue: Main stays generic: no frontend identifiers (`dashboard`), no hardcoded ids, no hardcoded product name (read `product.json`), no hardcoded CLI defaults (pass the flag only when the user set a value), no probing URLs when a configured value exists, no Docker Hub image dependencies in core, no docker/podman CLI in core.
- issue: Single source of truth: sections/columns/features register themselves; never duplicate name lists between main and renderer; share configuration keys via a `*Settings` object in `packages/api`; use `when` clauses in JSON definitions for conditional visibility; add build-time validation when JSON references assets.
- issue: Filesystem paths come from the `Directories` object; path constants are main internals never exposed to api/renderer. Tool paths (kubeconfig) come from settings, not env vars. Temp file names are unique so multiple instances can run. Application lifecycle state lives in main, not renderer stores.
- issue: Build-time metadata is passed through `VITE_*` env variables set by `scripts/watch.mjs` and read via `import.meta.env`; no `define` in vite configs, no `declare const` globals. Each package's vite config stays minimal and never watches other packages.
- issue: Renderer never reads `product.json` or other main-only data directly; main exposes processed domain-level data through IPC, exposing only what the consumer needs (not "everything by default"). IPC handlers are registered in the owning service, not in `plugin/index.ts`. Don't bypass abstractions (theming) with new IPC calls.
- issue: Cross-cutting policies (update permissions, allow-lists) are enforced centrally in core keyed by extension id, not per extension. New classes mirror their existing sibling (autostop like autostart). Encapsulate repeated async write logic (debounce/flush/dispose) in a dedicated class.
- issue: Don't log on every call of a hot method; not when an optional file is simply absent; telemetry is sent after the operation completes and only computed when telemetry is enabled; expensive checks (admin lookup) run only when needed; aggregate paginated data incrementally.
- issue: Keep intentionally OS-specific behaviour (macOS single-machine path) instead of unifying on one OS. Dev mode must not silently change runtime defaults.

## 7. Extension API (`packages/extension-api`)

- issue: Backward compatibility is absolute: never change exported signatures, return types or event payloads, never remove fields or color definitions. Add optional members; put new optional params into the existing `xxxOptions` object rather than new positional params.
- issue: Public API changes need a prior issue, discussion and a dedicated PR, and are rejected when an existing mechanism (provider status, warnings, connection factories, configuration `format`) already covers the need. Don't design around a single vendor; contributions reference a command id instead of accepting callbacks.
- issue: `xxxOptions` is an optional parameter; a required one is `xxxParams`. Every new field has a JSDoc description including the default. Options object over positional optionals. `activate`/`deactivate` may be synchronous.
- issue: Extension-specific data stays in that extension's own API; never expose internal representations, raw engine events or host-environment details (Flatpak, `HOME` on Windows). Internal core-api types may deliberately differ from published ones; don't unify blindly. Renaming for consistency removes engine prefixes across all methods and option types together.
- nit: Telemetry `logError(name, { error })` with the error object, not only `error.message`. Reuse the existing `Logger` abstraction for process output.

## 8. UI/UX, theming, a11y

- issue: Colors in `color-registry` reference `tailwind-color-palette.json` entries (or `black`/`white`), never hex or raw oklch; update existing values in place instead of adding `modern-*` duplicates; semantic status colors reuse green/red families; no CSS color string manipulation, use `culori` and the palette. `hcDark`/`hcLight` values are always defined with fallbacks in one central place; theme kinds follow VS Code naming; custom themes derive from one of the four root themes.
- issue: User-facing strings never hardcode "Podman Desktop" or use Electron `app.name`; read `product.json`. Consistent domain terminology (bundled vs built-in) aligned with API property names. Icons registered globally, not aliased inside one component. Contributed objects (menus, actions) honour all declared fields (`icon`, `disabled`, `when`).
- issue: Don't regress progress feedback (in-progress state visible without hover on icon-only buttons); cancelling a native dialog never surfaces an uncaught rejection; new API options are wired to the UI, never dead values; a single request does not turn an opt-in display option into a default.
- issue: a11y: no `title` tooltips on decorative `aria-hidden` icons; `aria-current="step"` on the active stepper item; animations respect reduce-motion; no DOM ids/a11y attributes without a justification tied to the issue.
- nit: Explanatory placeholders for defaults (`default (none)`); explicit `else if` branches for icon string formats instead of a catch-all; global notification when user action (restart) is needed.

## 9. Dependencies

- issue: No new dependency without discussion; check maintenance, prefer stdlib or an already-installed package; but prefer an existing library over a hand-written parser, and a library's programmatic API/promises over spawning its CLI and grepping stdout.
- issue: Don't add a dependency the project doesn't import directly; scope pnpm overrides to the requiring package (`parent>dep`), never globally. No transitive downgrades in `pnpm-lock.yaml` as a side effect. `@types/*` in devDependencies. No duplicate entries in `package.json`.
- issue: Use the latest released version; grouped bumps update all members together and honour migration notes; Electron/Node major bumps go to the latest beta with aligned `@types/node`. Verify a CVE affects the resolved version (`pnpm why`) before a security bump. Fixes to a failing dependabot PR target the dependabot branch. No `allowBuilds` entries for packages shipping prebuilt binaries unless proven required.
- nit: Published packages are named after the tooling they bind to (`api-mocks-vitest`), keep `exports`/`files` clean, and prefer shipping a plugin over multi-step README setup.

## 10. Naming and structure

- issue: A file named `X` contains `X` and nothing unrelated. Names describe meaning, prefixed by topic (`CODE_CHANGED`, `PODMAN_DESKTOP_BOT_TOKEN`, `REMOTE_EXTENSIONS_*`), and follow sibling patterns (`navigateToCreateX` like `navigateToEditX`). No vague or redundant names (`array`, `Generic`, `PodmanBinary.getBinaryInfo`, `Default` prefix); booleans describe the action (`userDisabled`).
- issue: Builder pattern strictly: `withX()` builds state, `build()` produces the object, registration is a separate explicit call. Reuse existing code paths (refactor the old method to call the shared one, reuse computed results) instead of duplicating.
- issue: When removing a command/setting/feature, remove every reference in the same change; when adding assets, update existing files in place, keep SVG sources, and never add a second asset for the same purpose. Files vendored from VS Code (`contextKey.ts`) stay untouched.
- issue: `product.json` holds only what cannot live in `package.json`; no duplicated data, no nested `branding` section; group related keys, use macros (`${appId}`), URL fields hold full `https://` links, optional attributes have sensible defaults.
- nit: Simplest implementation that meets the intent (`split('\n')[0]` over a regex dance); avoid duplicated if/else branches and redundant guards at several layers; image reference parsing handles tags and digests.

## 11. Docs, website, blog

- issue: Technically accurate statements only (rootful vs rootless, API history). Step-by-step guides live in `website/tutorial`, not the blog; tutorial images under `website/tutorial/img`. No direct vendor/product links on the website or in-app text (CNCF rules) outside the dedicated support page. Website doesn't parse the extension catalog (catalog repo owns that).
- issue: Package READMEs document consumption only. Extension `package.json` `homepage` points to the extension folder README; `repository` stays a valid npm value. Docusaurus migrations are incremental (rename to `.mdx` first, flip version later), never via compatibility flags. Website telemetry helpers live in their own `.ts` module. Skills under `.claude/skills` are also linked from `.agents/skills`.
- nit: Link each prerequisite tool to its install page, CLI names in backticks, foreground commands (no `-d`) in tutorials, explain why an approach was chosen and its limits, leverage existing features (podify/kubify). Blog posts include motivation/history, filenames match the publication date, merge Tuesday/Thursday. Release notes lead with user-visible features, chores in a compact list, known bugs as issue links. Verify website fixes on the PR preview. Patterns meant for wide adoption go into `CODE-GUIDELINES.md` with a lint rule; `AGENTS.md`/`CLAUDE.md` reference it instead of duplicating.

## 12. GitHub workflows, scripts, security

- issue: Complex shell logic goes to `scripts/` so it runs locally; one workflow per concern, keep path filters, don't rename workflows that are required checks; guard repo-specific jobs with `if: github.repository == 'podman-desktop/podman-desktop'`; read Node from `.nvmrc`; pin runner versions; jobs have a green outcome when there is nothing to do.
- issue: Secrets used directly via `${{ secrets.X }}` where needed, never copied into job env, never added unless required; no personal emails (use `${{ github.actor }}@users.noreply.github.com`); bot token for comments; commits attributed to `github.actor`. Data between steps via `$GITHUB_OUTPUT` and camelCase output names.
- issue: Telemetry never sends raw user-provided values (hash/anonymise). Validate external input (semver from `product.json`, user paths at the IPC boundary: trim, cap length, reject control chars/UNC, read once to avoid TOCTOU, generic error messages with the original logged). Sanitize markdown on every update, not only on mount. Minimal Flatpak/sandbox permissions with a comment explaining each. Persist state in the existing configuration store; extensions must not tamper with security lists.
- nit: `curl -sL`; scripts resolve paths from the script location, not cwd; version bump automation replaces all occurrences of the version string; `String(process.env.X).toLowerCase() === 'true'` for boolean env vars; one parameterised script (`pnpm test:e2e <group>`) over many near-identical entries. E2E test semantics are owned by QE: review infra, defer content.

## When unsure

Say `question:` and ask for the explanation instead of asserting. Never invent a rule not in this list; if the code looks wrong for another reason, say so as a separate observation clearly marked as outside the distilled rule set.
