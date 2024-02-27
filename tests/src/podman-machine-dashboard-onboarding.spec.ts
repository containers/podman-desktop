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

import type { Page } from '@playwright/test';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { DashboardPage } from './model/pages/dashboard-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('podman-machine-dashboard');

  await new WelcomePage(page).handleWelcomePage(true);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await pdRunner.close();
});

describe(`Podman machine onboarding from DP Dashboard`, async () => {
  test('Create Podman machine from PD Dashboard', async () => {
    const dashboardPage = new DashboardPage(page);
    await playExpect(dashboardPage.initilizeAndStartButton).toBeEnabled();
    await dashboardPage.initilizeAndStartButton.click();
    await playExpect(dashboardPage.podmanMachineConnectionStatus).toHaveText('RUNNING', { timeout: 300000 });
  }, 320000);
});
