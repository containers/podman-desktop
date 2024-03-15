# Podman Desktop Test Framework

Testing Framework dedicated to a Podman Desktop and its extensions.

## How to build locally

1. Node 20 (ideal is to use `nvm`)
2. Install local dependencies: `npm install`
3. Build: `npm run build`
4. Create Local package `npm run package`
5. Connect to the repository where you want to write your tests

## Usage

1. Add necessary dependencies, ie. devDependencies: "podman-desktop-test-framework": "0.0.1"
2. Additional dependencies like vitest or playwright

### Test Runner Context and Hook extending

Extending afterEach Hook using custom TestContext
In your project, you need to define the TestContext interface to be passed into extended hook
```runner-test-context.ts
import type { TestContext } from 'vitest';
import { PodmanDesktopRunner } from 'podman-desktop-tester';

export interface RunnerTestContext extends TestContext {
  pdRunner: PodmanDesktopRunner;
}
```

```extended-hook.ts
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { afterEach } from 'vitest';
import { takeScreenshotHook } from 'podman-desktop-tester';

afterEach(async (context: RunnerTestContext) => {
  context.onTestFailed(async () => await takeScreenshotHook(context.pdRunner, context.task.name));
});
```

### Global Setup file configuraiton
Adding Global Setup/teardown module
```global-setup.ts
import { removeFolderIfExists } from 'podman-desktop-tester';

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
    globalSetup: './path/to/globalSetup/global-setup.ts',
    setupFiles: './path/to/hooks/extended-hooks.ts',
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
Since you have your tests and testing frameworked at place, you can now run your tests from the repository.

You will to checkout podman-desktop repository and build it first.
1. `git clone https://github.com/containers/podman-desktop`
2. `cd podman-desktop`
3. `yarn install`
4. `yarn test:e2e:build` -> this step is essential

Then you need to prepare your tests to be run from your repository
0. Add dependency for `podman-desktop-tester` in `devDependencies`
1. add npm script target to run E2E tests:
```package.json
  "scripts": {
    "test:e2e": "PODMAN_DESKTOP_ARGS='/path/to/podman-desktop' vitest run tests/src/ --pool=threads --poolOptions.threads.singleThread --poolOptions.threads.isolate --no-file-parallelism",
  }
```
2. Implement your E2E tests in `tests` folder
3. Run `npm test:e2e`
4. Artifacts logs are available under `./tests/output`