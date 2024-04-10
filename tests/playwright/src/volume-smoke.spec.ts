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
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { WelcomePage } from './model/pages/welcome-page';
import { NavigationBar } from './model/workbench/navigation';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { waitWhile } from './utility/wait';
import { handleConfirmationDialog } from './utility/operations';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('volume-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page);
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

const volumeName = 'e2eVolume';

describe('Volume workflow verification', async () => {
  test('Create new Volume', async () => {
    const volumesPage = await navBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();

    const createVolumePage = await volumesPage.openCreateVolumePage(volumeName);

    await createVolumePage.volumeNameBox.fill(volumeName);
    await createVolumePage.createVolumeButton.click();

    await waitWhile(async () => await createVolumePage.createVolumeButton.isVisible(), 20000, 700);
    await createVolumePage.doneButton.click();

    const exists = await volumesPage.waitForVolumeExists(volumeName);
    expect(exists).toBeTruthy();
  });

  test('Delete volume trough details page', async () => {
    const volumesPage = await navBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();

    const volumeRow = await volumesPage.getVolumeRowByName(volumeName);
    expect(volumeRow).not.toBeUndefined();

    const volumeDetails = await volumesPage.openVolumeDetails(volumeName);
    await volumeDetails.deleteButton.click();
    await handleConfirmationDialog(page);

    await waitWhile(async () => await volumeDetails.heading.isVisible(), 20000, 700);

    const deleted = await volumesPage.waitForVolumeDelete(volumeName);
    expect(deleted).toBeTruthy();
  });
});
