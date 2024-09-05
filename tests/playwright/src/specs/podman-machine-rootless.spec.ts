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

import { ResourceElementState } from '../model/core/states';
import { CreateMachinePage } from '../model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { expect as playExpect, test } from '../utility/fixtures';
import { deletePodmanMachine } from '../utility/operations';

const PODMAN_MACHINE_NAME: string = 'podman-machine-rootless';

test.beforeAll(async ({ pdRunner, welcomePage }) => {
  pdRunner.setVideoAndTraceName('podman-rootless-machine-e2e');
  process.env.KEEP_TRACES_ON_PASS = 'true';

  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ pdRunner }) => {
  await pdRunner.close();
});

test.skip(os.platform() === 'linux', 'Runs only on Windows and Mac');
test.describe('Rootless Podman machine Verification', () => {
  test('Create a rootless machine', async ({ page, navigationBar }) => {
    test.setTimeout(200_000);

    await navigationBar.openSettings();
    const podmanResources = new ResourceConnectionCardPage(page, 'podman');
    await podmanResources.createButton.click();

    const createMachinePage = new CreateMachinePage(page);
    await createMachinePage.createMachine(PODMAN_MACHINE_NAME, { isRootful: false, setAsDefault: false });

    const machineBox = new ResourceConnectionCardPage(page, 'podman', PODMAN_MACHINE_NAME); //does not work with visible name
    await playExpect(machineBox.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running);
  });
  test('Clean up rootless machine', async ({ page }) => {
    test.setTimeout(150_000);
    await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
  });
});
