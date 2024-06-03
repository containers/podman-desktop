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

import type { Locator, Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { BasePage } from './base-page';
import { ResourcesPage } from './resources-page';

export class CreateMachinePage extends BasePage {
  readonly heading: Locator;
  readonly podmanMachineName: Locator;
  readonly podmanMachineConfiguration: Locator;
  readonly imagePathBox: Locator;
  readonly browseImagesButton: Locator;
  readonly podmanMachineCPUs: Locator;
  readonly podmanMachineMemory: Locator;
  readonly podmanMachineDiskSize: Locator;
  readonly rootPriviledgesCheckbox: Locator;
  readonly userModeNetworkingCheckbox: Locator;
  readonly startNowCheckbox: Locator;
  readonly closeButton: Locator;
  readonly createMachineButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Create Podman Machine' });
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
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
    this.createMachineButton = this.page.getByRole('button', { name: 'Create' });
  }

  async createMachine(
    machineName: string,
    isRootful: boolean = true,
    enableUserNet: boolean = false,
    startNow: boolean = true,
    setAsDefault: boolean = true,
  ): Promise<ResourcesPage> {
    await playExpect(this.podmanMachineConfiguration).toBeVisible();
    await this.podmanMachineName.fill(machineName);

    if (isRootful !== (await this.isEnabled(this.rootPriviledgesCheckbox))) {
      await this.switchCheckbox(this.rootPriviledgesCheckbox);
    }

    if (enableUserNet !== (await this.isEnabled(this.userModeNetworkingCheckbox))) {
      await this.switchCheckbox(this.userModeNetworkingCheckbox);
    }

    if (startNow !== (await this.isEnabled(this.startNowCheckbox))) {
      await this.switchCheckbox(this.startNowCheckbox);
    }

    await this.createMachineButton.click();
    await this.page.waitForTimeout(60000);

    const successfulCreationMessage = this.page.getByText('Successful operation');
    const goBackToResourcesButton = this.page.getByRole('button', { name: 'Go back to resources' });

    await this.handleConnectionDialog(machineName, setAsDefault);

    await playExpect(successfulCreationMessage).toBeVisible({ timeout: 10000 });
    await playExpect(goBackToResourcesButton).toBeVisible();
    await goBackToResourcesButton.click();

    return new ResourcesPage(this.page);
  }

  async isEnabled(checkbox: Locator): Promise<boolean> {
    await playExpect(checkbox).toBeVisible();
    const upperElement = checkbox.locator('..').locator('..');
    const clickableCheckbox = upperElement.getByText('Enabled');
    return await clickableCheckbox.isVisible();
  }

  async switchCheckbox(checkbox: Locator): Promise<void> {
    await playExpect(checkbox).toBeVisible();
    const upperElement = checkbox.locator('..').locator('..');

    const wasEnabled = await this.isEnabled(checkbox);
    let checkText;
    if (wasEnabled) {
      checkText = 'Enabled';
    } else {
      checkText = 'Disabled';
    }

    const clickableCheckbox = upperElement.getByText(checkText);
    await clickableCheckbox.click();
  }

  async handleConnectionDialog(machineName: string, setAsDefault: boolean): Promise<void> {
    const connectionDialog = this.page.getByRole('dialog', { name: 'Podman' });
    const dialogMessage = connectionDialog.getByText(
      new RegExp(
        "Podman Machine '" +
          machineName +
          "' is running but not the default machine .+ Do you want to set it as default?",
      ),
    );
    if ((await connectionDialog.isVisible()) && (await dialogMessage.isVisible())) {
      let handleButtonName = 'Yes';
      if (!setAsDefault) {
        handleButtonName = 'Ignore';
      }
      const handleButton = connectionDialog.getByRole('button', { name: handleButtonName });
      await handleButton.click();
    }
  }
}
