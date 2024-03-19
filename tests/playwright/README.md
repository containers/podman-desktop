# Podman Desktop Playwright Tests

Testing Framework dedicated to a Podman Desktop and its extensions.

## How to build locally from podman-desktop repo

0. git clone podman-desktop
1. Install Node.js 20 (ideal is to use `nvm`)
2. checkout to `tests/playwright`
3. Install local dependencies: `yarn install`
4. Build: `yarn build`
5. Create Local package `npm run package`
6. In YOUR repository, update `package.json` file
7. Create a devDependencies on `@podman-desktop/tests-playwright`
8. Write your E2E tests

## Usage

1. Add necessary dependencies, ie. devDependencies: "@podman-desktop/tests-playwright": "^1.8.0"
2. Additional dependencies like vitest or playwright

### Test Runner Context and Hook extending

Extending afterEach Hook using custom TestContext
In your project, you can define custom CustomTestContext interface to be passed into extended hook or use existing from the library

```my-test-context.ts
import type { TestContext } from 'vitest';
import { PodmanDesktopRunner } from '@podman-desktop/tests-playwright';

export interface MyTestContext extends TestContext {
  pdRunner: PodmanDesktopRunner;
}
```

```custom-extended-hook.ts
import type { MyTestContext } from '../testContext/my-test-context';
// or use one provided in @podman-desktop/tests-playwright
import { afterEach } from 'vitest';
import { takeScreenshotHook } from '@podman-desktop/tests-playwright';

afterEach(async (context: MyTestContext) => {
  context.onTestFailed(async () => await takeScreenshotHook(context.pdRunner, context.task.name));
});
```

### Global Setup file configuraiton

Adding Global Setup/teardown module, class available in @podman-desktop/tests-playwright

```global-setup.ts
import { removeFolderIfExists } from '@podman-desktop/tests-playwright';

let setupCalled = false;
let teardownCalled = false;

export async function setup() {
  if (!setupCalled) {
    // remove all previous testing output files
    // Junit reporter output file is created before we can clean up output folders
    // It is not possible to remove junit output file because it is opened by the process already, at least on windows
    if (!process.env.CI) {
      await removeFolderIfExists('tests/output');
    } else {
      console.log(
        `On CI, skipping before All tests/output cleanup, see https://github.com/containers/podman-desktop/issues/5460`,
      );
    }
    setupCalled = true;
  }
}

export async function teardown() {
  if (!teardownCalled) {
    // here comes teardown logic
    teardownCalled = true;
  }
}
```

### Vitest Config

Example of the vitest test configuration file.

```
const config = {
  test: {
    globals: true,
    // or use one shipped with `@podman-desktop/tests-playwright`
    // globalSetup: './node_modules/@podman-desktop/tests/playwright/globalSetup/global-setup.ts',
    globalSetup: './path/to/globalSetup/global-setup.ts',
    setupFiles: './path/to/hooks/custom-extended-hooks.ts',
    /**
     * By default, vitest search test files in all packages.
     * For e2e tests have sense search only is project root tests folder
     */
    include: ['**/tests/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/builtin/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp,cdix}/**',
      '**/{.electron-builder,babel,changelog,docusaurus,jest,postcss,prettier,rollup,svelte,tailwind,vite,vitest*,webpack}.config.*',
    ],

    /**
     * A default timeout of 5000ms is sometimes not enough for playwright.
     */
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // test reporters - default for all and junit for CI
    reporters: process.env.CI ? ['default', 'junit'] : ['verbose'],
    outputFile: process.env.CI ? { junit: 'tests/output/junit-results.xml' } : {},
  },
};

export default config;
```

### Setting and Running the E2E tests

Since you have your tests and testing framework at place, you can now run your tests from the repository.

You will to checkout podman-desktop repository and build it first.

1. `git clone https://github.com/containers/podman-desktop`
2. `cd podman-desktop`
3. `yarn install`
4. `yarn test:e2e:build` -> this step is essential

Then you need to prepare your tests to be run from your repository

0. Add dependency for `@podman-desktop/tests-playwright` in `devDependencies`
1. add npm script target to run E2E tests:

```package.json
  "scripts": {
    "test:e2e": "PODMAN_DESKTOP_ARGS='/path/to/podman-desktop' vitest run tests/src/ --pool=threads --poolOptions.threads.singleThread --poolOptions.threads.isolate --no-file-parallelism",
  }
```

2. Implement your E2E tests in `tests` folder of YOUR repo
3. Run `npm test:e2e`
4. Artifacts logs are available under `./tests/output`
