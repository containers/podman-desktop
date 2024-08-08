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

import { CreateMachinePage } from '../model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { deletePodmanMachine } from '../utility/operations';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
const PODMAN_MACHINE_NAME: string = 'podman-machine-rootless';
const MACHINE_VISIBLE_NAME: string = 'Podman Machine rootless';

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('podman-rootless-machine-e2e');
  process.env.KEEP_TRACES_ON_PASS = 'true';

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page);
});

afterAll(async () => {
  await deletePodmanMachine(page, MACHINE_VISIBLE_NAME);
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe.skipIf(os.platform() === 'linux')('Rootless Podman machine Verification', async () => {
  test('Create a rootless machine', async () => {
    await navBar.openSettings();
    const podmanResources = new ResourceConnectionCardPage(page, 'podman');

    await podmanResources.createButton.click();

    const createMachinePage = new CreateMachinePage(page);
    await createMachinePage.createMachine(PODMAN_MACHINE_NAME, false, false, true, false);
    await createMachinePage.handleConnectionDialog(PODMAN_MACHINE_NAME, false);

    const machineBox = new ResourceConnectionCardPage(page, 'podman', MACHINE_VISIBLE_NAME);
    const connectionStatusLabel = await machineBox.resourceElementConnectionStatus.textContent();
    playExpect(connectionStatusLabel === 'RUNNING').toBeTruthy();
  }, 150000);
});
