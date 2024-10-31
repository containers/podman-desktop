# Podman Desktop Playwright Tests

This document contains information on how to use the E2E testing framework of Podman Desktop from an external project.
This is particularly useful if you want to execute the tests from a Podman Desktop extension or you want to develop your own.

## Usage of @podman-desktop/tests-playwright locally

Prerequisites:

- Have Node.js 20 installed (ideally using `nvm`)
- Have a clone of the Podman Desktop repo (you can get it [here](https://github.com/containers/podman-desktop/tree/main))
- Have pnpm installed (you can get it [here](https://pnpm.io/installation))

Steps:

1. Get into the Podman Desktop repo folder (should be named `podman-desktop`)
2. Install its local dependencies by executing `pnpm install`
3. Implement your changes to the E2E tests library (optional)
4. Build the application with `pnpm build`
5. Build the application's tests with `pnpm test:e2e:build`
6. Set an environment variable by executing: `export PODMAN_DESKTOP_ARGS="/complete/path/to/podman-desktop-repo"` (the current directory) [¹]
7. Get into YOUR repository and update the `package.json` file to have the following contents:

- Under `devDependencies`:
  - `"@podman-desktop/tests-playwright": "next",`[²]
  - `"@playwright/test": "^1.48.1"` (or the current latest)
- Under `scripts`:
  - `"test:e2e:setup": "xvfb-maybe --auto-servernum --server-args='-screen 0 1280x960x24' --"` [³]
  - `"test:e2e": "cross-env E2E_TESTS=true npm run test:e2e:setup npx playwright test tests/src"`

8. Execute `pnpm install`, which should extract the contents of the previously built Podman Desktop into the `node_modules` folder in your repo
9. Write your E2E tests on your repo, which may use your changes to `@podman-desktop/tests-playwright` from step 3 (optional)
10. Run your E2E tests by executing `pnpm test:e2e`

[¹] Remember that environment variables defined this way only work on the terminal they were defined and only for as long as the terminal is active.

[²] Using the value "next" works for local executions of the tests, but if you want to execute the tests remotely you should specify the latest version of the framework, you can find that value [here](https://www.npmjs.com/package/@podman-desktop/tests-playwright).

[³] If your project does not already have the `xvfb-maybe` dependency, you'll need to add it as well

## Usage of @podman-desktop/tests-playwright in your remote repository

1. Add necessary dependencies, ie. `devDependencies`: `"@podman-desktop/tests-playwright": "^1.8.0"`
2. Add additional dependencies: `playwright`

### Setting and Running the E2E tests with @podman-desktop/tests-playwright npm package

Since you have your tests and testing framework at place, you can now run your tests from the repository.

You will have to checkout podman-desktop repository and build it first.

1. `git clone https://github.com/containers/podman-desktop`
2. `cd podman-desktop`
3. `pnpm install`
4. `pnpm test:e2e:build` -> this step is essential

Then you need to prepare your tests to be run from your repository

1. Add dependency for `@podman-desktop/tests-playwright` in `devDependencies`
2. add npm script target to run E2E tests:

```package.json
  "scripts": {
    "test:e2e": "PODMAN_DESKTOP_ARGS='/path/to/podman-desktop' vitest run tests/src/ --pool=threads --poolOptions.threads.singleThread --poolOptions.threads.isolate --no-file-parallelism",
  }
```

3. Implement your E2E tests in `tests` folder of YOUR repo
4. Run `npm test:e2e`
5. Artifacts logs are available under `./tests/output`
