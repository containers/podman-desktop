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

import type { expect as playExpect, Locator, Page } from '@playwright/test';

import { BasePage } from '../base-page';

export class MachineCreationForm extends BasePage {
  readonly podmanMachineConfiguration: Locator;
  readonly podmanMachineName: Locator;
  readonly imagePathBox: Locator;
  readonly browseImagesButton: Locator;
  readonly podmanMachineCPUs: Locator;
  readonly podmanMachineMemory: Locator;
  readonly podmanMachineDiskSize: Locator;
  readonly rootPriviledgesCheckbox: Locator;
  readonly userModeNetworkingCheckbox: Locator;
  readonly startNowCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.podmanMachineConfiguration = this.page.getByRole('form', { name: 'Properties Information' });
    this.podmanMachineName = this.podmanMachineConfiguration.getByRole('textbox', { name: 'Name' });
    this.imagePathBox = this.podmanMachineConfiguration.getByRole('textbox', { name: 'Image Path (Optional) ' });
    this.browseImagesButton = this.podmanMachineConfiguration.getByRole('button', {
      name: 'button-Image Path (Optional)',
    });
    this.podmanMachineCPUs = this.podmanMachineConfiguration.getByRole('slider', { name: 'CPU(s)' });
    this.podmanMachineMemory = this.podmanMachineConfiguration.getByRole('slider', { name: 'Memory' });
    this.podmanMachineDiskSize = this.podmanMachineConfiguration.getByRole('slider', { name: 'Disk size' });
    this.rootPriviledgesCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'Machine with root privileges',
    });
    this.userModeNetworkingCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'User mode networking',
    });
    this.startNowCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', { name: 'Start the machine now' });
  }

  async configureMachine(
    machineName: string,
    isRootful: boolean = true,
    enableUserNet: boolean = false,
    startNow: boolean = true,
  ): Promise<void> {
    await playExpect(this.podmanMachineConfiguration).toBeVisible();
    await this.podmanMachineName.fill(machineName);

    if (isRootful !== (await this.rootPriviledgesCheckbox.isChecked())) {
      await this.rootPriviledgesCheckbox.locator('..').click();
      playExpect(await this.rootPriviledgesCheckbox.isChecked()).toBe(isRootful);
    }

    if (enableUserNet !== (await this.userModeNetworkingCheckbox.isChecked())) {
      await this.userModeNetworkingCheckbox.locator('..').click();
      playExpect(await this.userModeNetworkingCheckbox.isChecked()).toBe(enableUserNet);
    }

    if (startNow !== (await this.startNowCheckbox.isChecked())) {
      await this.startNowCheckbox.locator('..').click();
      playExpect(await this.startNowCheckbox.isChecked()).toBe(startNow);
    }
  }
}
