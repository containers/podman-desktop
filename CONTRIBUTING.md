# Contributing to Podman Desktop

<p align="center">
  <img alt="Podman Desktop" src="https://raw.githubusercontent.com/containers/podman-desktop/media/screenshot.png">
</p>

We'd love to have you join the community! Below summarizes the processes
that we follow.

## Topics

- [Reporting Issues](#reporting-issues)
- [Working On Issues](#working-on-issues)
- [Contributing](#contributing)
- [Continuous Integration](#continuous-integration)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Communication](#communication)
- [Code Architecture](#code-architecture)
- [Maintainer Tasks](#maintainer-tasks)
- [Website Contributions](#website-contributions)

## Reporting Issues

Before opening an issue, check the backlog of
[open issues](https://github.com/containers/podman-desktop/issues)
to see if someone else has already reported it.

If so, feel free to add
your scenario, or additional information, to the discussion. Or simply
"subscribe" to it to be notified when it is updated.

If you find a new issue with the project we'd love to hear about it! The most
important aspect of a bug report is that it includes enough information for
us to reproduce it. So, please include as much detail as possible and try
to remove the extra stuff that doesn't really relate to the issue itself.
The easier it is for us to reproduce it, the faster it'll be fixed!

Please don't include any private/sensitive information in your issue!

## Working On Issues

Often issues will be assigned to someone, to be worked on at a later time.

If you are a member of the [Containers](https://github.com/containers) organization,
self-assign the issue with the `status/in-progress` label.

If you can not set the label: add a quick comment in the issue asking that
the `status/in-progress` label to be set and a maintainer will label it.

## Contributing

This section describes how to start a contribution to Podman Desktop.

### Prerequisites: Prepare your environment

You can develop on either: `Windows`, `macOS` or `Linux`.

Requirements:

- [Node.js 20+](https://nodejs.org/en/)
- [yarn v1.x](https://yarnpkg.com/) (`npm i -g yarn@1)

Optional Linux requirements:

- [Flatpak builder, runtime, and SDK, version 23.08](https://docs.flatpak.org/en/latest/first-build.html)
  ```sh
  flatpak remote-add --if-not-exists flathub --user https://flathub.org/repo/flathub.flatpakrepo
  flatpak install --user flathub org.flatpak.Builder org.freedesktop.Platform//23.08 org.freedesktop.Sdk//23.08
  ```
- GNU C and C++ compiler
  Fedora/RHEL
  ```sh
  dnf install gcc-c++
  ```
  Ubuntu/Debian
  ```sh
  apt-get install build-essential
  ```

On Windows:

- [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170#visual-studio-2015-2017-2019-and-2022)

### Step 1. Fork and clone Podman Desktop

Clone and fork the project.

Fork the repo using GitHub site and then clone the directory:

```sh
git clone https://github.com/<you>/podman-desktop && cd podman-desktop
```

### Step 2. Install dependencies

Fetch all dependencies using the command `yarn`:

```sh
yarn install
```

### Step 3. Start in watch mode

Run the application in watch mode:

```sh
yarn watch
```

The dev environment will track all files changes and reload the application respectively.

### Step 4. Write and run tests

Write tests! Please try to write some unit tests when submitting your PR.

Run the unit and component tests using `yarn`:

```sh
yarn test:unit
```

Depending on to what part of project you contribute to, you can specify to run tests for the given module only, ie., if you are working on extensions, you can run the tests for extensions and have faster feedback:

```sh
yarn test:extensions
```

or if you are contributing to a particular extension, you can call:

```sh
yarn test:extensions:compose
```

This will show a test results for restricted amount of tests:

```
 ✓ src/os.spec.ts (3)
 ✓ src/detect.spec.ts (10) 518ms
 ✓ src/compose-github-releases.spec.ts (10)
 ✓ src/compose-extension.spec.ts (16)
 ✓ src/compose-wrapper-generator.spec.ts (4)

 Test Files  5 passed (5)
      Tests  43 passed (43)
   Start at  17:17:07
   Duration  1.27s (transform 562ms, setup 0ms, collect 1.25s, tests 587ms)
```

Check the npm script tasks in our `package.json` for more options.

### Step 5. Run E2E tests

In case of adding new feature, it is always suitable to make sure we do not bring any new regression. For this purpose we are using the E2E tests. They can be run using `yarn`:

```sh
yarn test:e2e:smoke
```

Although, there are requirements that need to be fulfilled before running the tests in order to make them pass:

- remove `settings.json` from `~/.local/share/containers/podman-desktop/configuration/` or if you do not want to lose your settings, remove the objects from the file with keys `"welcome.version"` and `"telemetry.*"`

### Step 6. Code coverage

Part of every test is also a code coverage report which can be obtain from the test run output (using simple text reporter)
found in project root `./test-resources/coverage/*`. Depending if you have run all or just a part of the tests, you will have partial test coverage report generated, example:

```
 % Coverage report from c8
------------------------------|---------|----------|---------|---------|-------------------
File                          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------------|---------|----------|---------|---------|-------------------
All files                     |    75.1 |    97.22 |   93.75 |    75.1 |
 cli-run.ts                   |       0 |        0 |       0 |       0 | 1-119
 compose-extension.ts         |     100 |      100 |     100 |     100 |
 compose-github-releases.ts   |     100 |      100 |     100 |     100 |
 compose-wrapper-generator.ts |     100 |      100 |     100 |     100 |
 detect.ts                    |     100 |      100 |     100 |     100 |
 extension.ts                 |       0 |        0 |       0 |       0 | 1-54
 os.ts                        |     100 |      100 |     100 |     100 |
------------------------------|---------|----------|---------|---------|-------------------
```

For a detailed information about the code coverage you can search the mentioned folder and find `html` lcov report:
`test-resources/coverage/extensions/compose/lcov-report/index.html`

When contributing the new code, you should consider not lowering overall code coverage.

### Step 7. Code formatter / linter

We use `prettier` as a formatter and `eslint` for linting.

Check that your code is properly formatted with the linter and formatter:

Checking:

```sh
yarn lint:check && yarn format:check
```

Fix:

```sh
yarn lint:fix && yarn format:fix
```

### Step 8. Compile production binaries (optional)

You may want to test the binary against your local system before pushing a PR, you can do so by running the following command:

```sh
yarn compile:current
```

This will create a binary according to your local system and output it to the `dist/` folder.

> **_NOTE:_** macOS and Windows create binaries while Linux will create a `.flatpak`. Make sure your flatpak dependencies are installed for successful compiling on Linux.

> **_macOS NOTE:_** On macOS the `dist/` folder will contain folders for `arm64` and `universal` `.app` files. Ignore these and use the `.app` file in the `dist/mac/` folder for testing.

## Submitting Pull Requests

### Process

Whether it is a large patch or a one-line bug fix, make sure you explain in detail what's changing!

Make sure you include the issue in your PR! For example, say: `Closes #XXX`.

PRs will be approved by an [approver][owners] listed in [`CODEOWNERS`](CODEOWNERS).

We typically require one approval for code as well as documentation-related PR's. If it is a large code-related PR, proof of review / testing (a video / screenshot) is required.

**Avoid enabling auto-merge** until the PR has undergone sufficient reviews and contributors have been given ample time for assessment. A maintainer will review the PR prior to the final merge. It's common for code PRs to require up to a week before merging due to reasons such as ongoing releases or dependencies on other PRs. Additionally, documentation PRs might take a few days for integration.

Some tips for the PR process:

- No PR too small! Feel free to open a PR against tests, bugs, new features, docs, etc.
- Make sure you include as much information as possible in your PR so maintainers can understand.
- Try to break up larger PRs into smaller ones for easier reviewing
- Any additional code changes should be in a new commit so we can see what has changed between reviews.
- Squash your commits into logical pieces of work.

### Use the correct commit message semantics

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Some examples for correct titles would be:

- `fix: prevent racing of requests`
- `chore: drop support for Node 6`
- `docs: add quickstart guide`

For Podman Desktop we use the following types:

- `fix:` A bug fix
- `chore:` Very small change / insignificant impact
- `docs:` Documentation only changes (ex. website)
- `build:` Changes that affect the build system
- `ci:` Changes to the CI (ex. GitHub actions)
- `feat:` A new feature
- `perf:` A code change that improves performance
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `style:` Changes that affect the formatting, but not the ability of the code
- `test:` Adding missing tests / new tests

Title formatting:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Sign your PRs

The sign-off is a line at the end of the explanation for the patch. Your
signature certifies that you wrote the patch or otherwise have the right to pass
it on as an open-source patch.

Then you just add a line to every git commit message:

    Signed-off-by: Joe Smith <joe.smith@email.com>

Legal name must be used (no pseudonyms or anonymous contributions)

If you set your `user.name` and `user.email` git configs, you can sign your
commit automatically with `git commit -s`.

### Review process

1. Submit your PR
2. Reviewers are assigned by GitHub to two Podman Desktop developers
3. PR's require 1 LGTM / Approval (2 if it's a large code change)

> **_NOTE:_** Confirm that your PR works on macOS, Windows and Linux if it's a significant change (not a UI improvement)

> **_NOTE:_** If your PR hasn't been merged in an appropriate amount of time, ping the two developers assigned to the issue with `@`

## Continuous Integration

All pull requests and branch-merges automatically run:

- Format and lint checking
- Cross-platform builds (Windows, macOS, Linux)
- Unit test (Linux)
- E2E tests (Linux, triggered by PR check, do not prevent merging of the PR in case of instability)

You can follow these jobs in Github Actions https://github.com/containers/podman-desktop/actions

## Communication

For bugs/feature requests please [file issues](https://github.com/containers/podman-desktop/issues/new/choose)

Discussions are possible using Github Discussions https://github.com/containers/podman-desktop/discussions/

## Code Architecture

### Frameworks and tooling

Within Podman Desktop, we use the following frameworks and tools to build the desktop application:

- [Electron](https://www.electronjs.org/): In order to deploy cross-platform to multiple operating systems.
- [Svelte](https://svelte.dev/): The reactive UI/UX framework for building the interface.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for the UI/UX framework.
- [Vite](https://vitejs.dev/): Dev tooling for rapid development, debugging and deployment.

> **_NOTE:_** We also use TypeScript instead of JavaScript for strongly typed programming language development.

### Testing

Within Podman Desktop, we use the following for testing:

- [Vitest](https://vitest.dev/): Unit tests - Written as `spec.ts` files.
- [Testing Library](https://testing-library.com/): Component tests - Utilities and best practices for writing component tests.
- [Playwright](https://playwright.dev/): Integration and E2E tests.

### Folders

Below are brief descriptions on the architecture on each folder of Podman Desktop and how it's organized.

If you're unsure where to add code (renderer, UI, extensions, plugins) see the below TLDR:

- `__mocks__/`: Mock packages for Vitest.
- `buildResources`: Podman Desktop logo location / build resources for electron
- `extensions`: We separate functionality into separate "extensions" to keep Podman Desktop modular. Here you'll find extensions such as Kubernetes, CRC, Podman and Docker functionality that Podman Desktop interacts with and integrates into the API (see `packages/extension-api`). Examples include `extensions/crc`, `extensions/podman`, `extensions/docker`.
- `packages/extension-api`: The extension API for extensions such as `extensions/podman` to interact with the Podman Desktop GUI. This API acts as a "middleware" to the main Electron functionality such as displaying notifications, progress messages, configuration changes, etc.
- `packages/main`: Electron process code that is responsible for creating the app's main windows, setting up system events and communicating with other processes
- `packages/preload`: Electron code that runs before the page gets rendered. Typically has access to APIs and used to setup communication processes between the main and renderer code.
- `packages/preload-docker-extension`: Electron preload code specific to the Docker Desktop extension.
- `packages/renderer`: Electron code that runs in the renderer process. The renderer runs separate to the main process and is responsible for typically rendering the main pages of Podman Desktop. Typically, this is where you find the `.svelte` code that renders the main Podman Desktop UI.
- `scripts`: Scripts Podman Desktop requires such as `yarn watch` functionality and updating Electron vendorered modules.
- `tests`: Contains e2e tests for Podman Desktop.
- `types`: Additional types required for TypeScript.
- `website`: The documentation as well as [Podman Desktop website](https://podman-desktop.io) developed in [Docusaurus](https://docusaurus.io).
- `node_modules`: Location for Node.JS packages / dependencies.

> **_NOTE:_** Each `extension` folder is a separately packaged module. If there are any issues with loading, make sure your module is packaged correctly.

### Extensions

Podman Desktop is modularized into extensions for each 'Provider'. You can also create and add your own extension.

See our [extensions documentation](https://podman-desktop.io/docs/extensions) on our website for more information.

### UI colors

Colors in Podman Desktop are now managed by a [`color-registry.ts`](https://github.com/containers/podman-desktop/blob/main/packages/main/src/plugin/color-registry.ts) file in order to easily switch between light and dark mode.

When contributing a UI component to Podman Desktop that is colorized, you must go through some steps to figure out what color to use and how to reference it.

Steps:

1. Open the [`color-registry.ts`](https://github.com/containers/podman-desktop/blob/main/packages/main/src/plugin/color-registry.ts) file.
2. Figure out which color category from the `initColors()` function.
3. Use the referenced color with the format `[var(--pd-<color>)]`

Example:

1. Choose what UI component you want to add: Ex. I want to add a new primary button.
2. Look under `initColors()` and pick `this.initButton()` and scroll down to `protected initButton()`.
3. Pick a color. I want to use the the "primary" button. So I will pick: `${button}primary-bg`.
4. Scroll up and note the `const` below `protected initButton()` which is `const button = 'button-';`
5. The color can be referenced with `[var(--pd-button-primary-bg)]`. The `[var(--pd-` portion will always be consistent when refering to a color variable.
6. For example:

```ts
<Button class="bg-[var(--pd-button-primary-bg)]"/>
```

## Maintainer tasks

List of maintainer tasks to help the project run smoothly.

### Triage manager

Each sprint a new "Triage manager" will be assigned.

Your responsibilities include:

- Reviewing the [status/need-triage](https://github.com/containers/podman-desktop/issues?q=is%3Aopen+is%3Aissue+label%3Astatus%2Fneed-triage) label on new issues. As a maintainer, you will need to categorize these issues under the correct [area labels](https://github.com/containers/podman-desktop/labels?q=area%2F). Once categorized, remove the `status/need-triage` label and apply the appropriate area label.
- Evaluating the severity of new issues. If an issue is classified as "critical" or "high priority" and requires immediate attention, tag a maintainer in the issue and notify them via the public community channel.
- Identifying issues that are simple to resolve and marking them as "good first issue," thereby encouraging newcomers to contribute to the project.
- Evaluating any stale / lingering pull requests and pinging the respective contributors. If the pull request has been opened for an extensive amount of time, ping someone to contact the contributor / push any changes required to get it merged in. If there is no communication / the pull request is stale, close them.

## Website Contributions

See our [WEBSITE_CONTRIBUTING](/WEBSITE_CONTRIBUTING.md) documentation for more details on how to contribute to the website.
