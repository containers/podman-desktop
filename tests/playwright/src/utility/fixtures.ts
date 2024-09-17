/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { BrowserContext, Page } from '@playwright/test';
import { test as base } from '@playwright/test';

import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { StatusBar } from '../model/workbench/status-bar';
import { Runner } from '../runner/podman-desktop-runner';
import { RunnerOptions } from '../runner/runner-options';

export type TestFixtures = {
  runner: Runner;
  navigationBar: NavigationBar;
  welcomePage: WelcomePage;
  page: Page;
  context: BrowserContext;
  statusBar: StatusBar;
};

export type FixtureOptions = {
  runnerOptions: RunnerOptions;
};

let newContext = false;

export const test = base.extend<TestFixtures & FixtureOptions>({
  runnerOptions: [new RunnerOptions(), { option: true }],
  runner: async ({ runnerOptions }, use) => {
    const runner = await Runner.getInstance({ runnerOptions });
    await use(runner);
  },
  context: async ({ runner }, use) => {
    newContext = true;
    await use(runner.getNewContext());
  },
  page: async ({ runner, context }, use) => {
    const page = newContext ? context.pages()[0] : runner.getPage();
    await use(page);
  },
  navigationBar: async ({ page }, use) => {
    const navigationBar = new NavigationBar(page);
    await use(navigationBar);
  },
  welcomePage: async ({ page }, use) => {
    const welcomePage = new WelcomePage(page);
    await use(welcomePage);
  },
  statusBar: async ({ page }, use) => {
    const statusBar = new StatusBar(page);
    await use(statusBar);
  },
});
export { expect } from '@playwright/test';
