# Podman Desktop Playwright Tests

This document contains information on how to use the E2E testing framework of Podman Desktop on different scenarios.
This is particularly useful if you want to execute the tests from a Podman Desktop extension or you want to develop your own.

Prerequisites:

- Have Node.js 20 installed (ideally using `nvm`)
- Have a clone of the Podman Desktop repo (you can get it [here](https://github.com/containers/podman-desktop/tree/main))
- Have pnpm installed (you can get it [here](https://pnpm.io/installation))

## Usage of @podman-desktop/tests-playwright to develop the podman-desktop tests

This section explains how to reference and import the test modules from a folder without using the npm package.

Steps:

1. Go to your project and add the necessary `devDependencies` to your package.json file:

- `"@podman-desktop/tests-playwright": "^1.8.0,"`
- `"@playwright/test": "1.47.1",`

2. Set up playwright in your project, you have some options:

- Run `pnpm playwright init`, which will generate the `playwright.config` file, set up the testing folder structure and install playwright, or
- Run `pnpm playwright install`, which will install the necessary binaries, and then run `playwright codegen --save-config=playwright.config.ts` which will generate the default `playwright.config` file, or
- Add manually to your project the default `playwright.config` file:

```
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

3. Get into the Podman Desktop repo folder (should be named `podman-desktop`)
4. Install its local dependencies by executing `pnpm install`
5. Build the application's tests with `pnpm test:e2e:build`
6. Go back into your repo folder and add the following script target to your package.json file, changing **'/path/to/podman-desktop'** by the actual absolute path of your `podman-desktop` repo folder:

```
  "scripts": {
    "test:e2e": "PODMAN_DESKTOP_ARGS='/path/to/podman-desktop' playwright test tests/src/ --workers=1 --no-parallel",
  }
```

7. Now you can implement your E2E tests in the `tests` folder of YOUR repo
8. Execute `npm test:e2e` in order to run them
9. When the tests finish you will find the test artifacts and logs available under `./tests/output`

## Usage of @podman-desktop/tests-playwright in an external repository

This section explains how to add the npm package to a repository external to podman-desktop.

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

## How to develop using locally built @podman-desktop/tests-playwright

This section references how to use @podman-desktop/tests-playwright generated archive file for local development

1. Get into the Podman Desktop repo folder (should be named `podman-desktop`)
2. Install its local dependencies by executing `pnpm install`
3. Implement your changes to the E2E tests library (it can be found under `tests/playwright`)
4. Build the application with `pnpm build`
5. Create the local package with `pnpm run package`, this will produce a .tgz archive
6. In YOUR repository, update the `package.json` file to have the following contents under `devDependencies`:
   `"@podman-desktop/tests-playwright": "file:../podman-desktop/tests/playwright/podman-desktop-tests-playwright-1.9.0.tgz"`
7. Execute `pnpm install`, which should extract the contents of the previously built Podman Desktop into the `node_modules` folder in your repo
8. Now, the changes you made to `@podman-desktop/tests-playwright` should be available in your project. If the process was successful, you should be able to find the classes you added on the `index.d.ts` file under `node_modules/@podman_desktop/tests_playwright/dist`
