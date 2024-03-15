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

import * as os from 'node:os';

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { deletePodmanMachine } from '../utility/operations';

let pdRunner: PodmanDesktopRunner;
let page: Page;
const PODMAN_MACHINE_NAME = 'Podman Machine';

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('podman-machine-dashboard');

  await new WelcomePage(page).handleWelcomePage(true);

  if (
    (process.env.TEST_PODMAN_MACHINE !== undefined && process.env.TEST_PODMAN_MACHINE === 'true') ||
    (process.env.MACHINE_CLEANUP !== undefined && process.env.MACHINE_CLEANUP === 'true')
  ) {
    await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
  }
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await pdRunner.close();
});

describe.skipIf(os.platform() === 'linux')(async () => {
  describe.runIf(process.env.TEST_PODMAN_MACHINE !== undefined && process.env.TEST_PODMAN_MACHINE === 'true')(
    `Podman machine onboarding from Dashboard`,
    async () => {
      test('Create Podman machine from Dashboard', async () => {
        const navigationBar = new NavigationBar(page);
        const dashboardPage = await navigationBar.openDashboard();
        await playExpect(dashboardPage.initilizeAndStartButton).toBeEnabled();
        await dashboardPage.initilizeAndStartButton.click();
        await playExpect(dashboardPage.podmanMachineConnectionStatus).toHaveText('RUNNING', { timeout: 300000 });
      }, 320000);

      test.runIf(process.env.MACHINE_CLEANUP !== undefined && process.env.MACHINE_CLEANUP === 'true')(
        'Clean Up Podman Machine',
        async () => {
          await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
        },
      );
    },
  );
});
