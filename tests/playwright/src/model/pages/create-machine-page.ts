/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { Locator, Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { BasePage } from './base-page';
import { ResourcesPage } from './resources-page';

export class CreateMachinePage extends BasePage {
  readonly heading: Locator;
  readonly machineNameBox: Locator;
  readonly cpuSlider: Locator;
  readonly memorySlider: Locator;
  readonly diskSlider: Locator;
  readonly imagePathBox: Locator;
  readonly browseImagesButton: Locator;
  readonly rootPriviledgesCheckbox: Locator;
  readonly userModeNetworkingCheckbox: Locator;
  readonly startNowCheckbox: Locator;
  readonly closeButton: Locator;
  readonly createMachineButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Create Podman Machine' });
    this.machineNameBox = this.page.getByRole('textbox', { name: 'Name' });
    this.cpuSlider = this.page.getByRole('slider', { name: 'CPU(s)' });
    this.memorySlider = this.page.getByRole('slider', { name: 'Memory' });
    this.diskSlider = this.page.getByRole('slider', { name: 'Disk size' });
    this.imagePathBox = this.page.getByRole('textbox', { name: 'Image Path (Optional) ' });
    this.browseImagesButton = this.page.getByRole('button', { name: 'button-Image Path (Optional)' });
    this.rootPriviledgesCheckbox = this.page.getByRole('checkbox', { name: 'Machine with root priviledges' });
    this.userModeNetworkingCheckbox = this.page.getByRole('checkbox', {
      name: 'User mode networking (traffic relayed by a user process). See [documentation](https://docs.podman.io/en/latest/markdown/podman-machine-init.1.html#user-mode-networking).',
    });
    this.startNowCheckbox = this.page.getByRole('checkbox', { name: 'Start the machine now' });
    this.closeButton = this.page.getByRole('button', { name: 'Close page' });
    this.createMachineButton = this.page.getByRole('button', { name: 'Create Pod' });
  }

  async createMachine(machineName: string, isRootless: boolean): Promise<ResourcesPage> {
    //can be extended
    await this.machineNameBox.fill(machineName);
    if (!isRootless) {
      await this.rootPriviledgesCheckbox.uncheck();
      playExpect(this.rootPriviledgesCheckbox.isChecked()).toBeFalsy();
    }

    await this.createMachineButton.click();

    const successfulCreationMessage = this.page.getByLabel('Successful operation');
    const goBackToResourcesButton = this.page.getByRole('button', { name: 'Go back to resources' });

    await playExpect(successfulCreationMessage).toBeVisible({ timeout: 50000 });
    await playExpect(goBackToResourcesButton).toBeVisible();
    await goBackToResourcesButton.click();

    return new ResourcesPage(this.page);
  }
}
