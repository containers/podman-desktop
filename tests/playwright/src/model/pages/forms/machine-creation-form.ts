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
import test, { expect as playExpect } from '@playwright/test';

import { DropdownComponent } from '/@/model/components/dropdown-component';
import {
  matchesProviderVariant,
  PodmanVirtualizationProviders,
  PodmanVirtualizationProviderVariants,
} from '/@/model/core/types';
import { BasePage } from '/@/model/pages/base-page';
import { isWindows } from '/@/utility/platform';
import { getDefaultVirtualizationProvider, getVirtualizationProvider } from '/@/utility/provider';

export class MachineCreationForm extends BasePage {
  readonly podmanMachineConfiguration: Locator;
  readonly podmanMachineName: Locator;
  readonly imagePathBox: Locator;
  readonly browseImagesButton: Locator;
  readonly podmanMachineCPUs: Locator;
  readonly podmanMachineMemory: Locator;
  readonly podmanMachineDiskSize: Locator;
  readonly rootPrivilegesCheckbox: Locator;
  readonly userModeNetworkingCheckbox: Locator;
  readonly importNativeCACheckbox: Locator;
  readonly providerTypeDropdown: DropdownComponent;
  readonly startNowCheckbox: Locator;
  readonly createMachineButton: Locator;

  constructor(page: Page) {
    super(page);
    this.podmanMachineConfiguration = this.page.getByRole('form', {
      name: 'Properties Information',
    });
    this.podmanMachineName = this.podmanMachineConfiguration.getByRole('textbox', { name: 'Name' });
    this.imagePathBox = this.podmanMachineConfiguration.getByRole('textbox', {
      name: 'Image Path (Optional) ',
    });
    this.browseImagesButton = this.podmanMachineConfiguration.getByRole('button', {
      name: 'button-Image Path (Optional)',
    });
    this.podmanMachineCPUs = this.podmanMachineConfiguration.getByRole('slider', { name: 'CPU(s)' });
    this.podmanMachineMemory = this.podmanMachineConfiguration.getByRole('slider', { name: 'Memory' });
    this.podmanMachineDiskSize = this.podmanMachineConfiguration.getByRole('slider', { name: 'Disk size' });
    this.rootPrivilegesCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'Machine with root privileges',
    });
    this.userModeNetworkingCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'User mode networking',
    });
    this.importNativeCACheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: /Import host trusted CA certificates/,
    });
    this.providerTypeDropdown = new DropdownComponent(page, 'Provider Type');

    this.startNowCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', { name: 'Start the machine now' });
    this.createMachineButton = this.podmanMachineConfiguration.getByRole('button', { name: 'Create' });
  }

  async setupAndCreateMachine(
    machineName: string,
    {
      isRootful = true,
      enableUserNet = false,
      startNow = true,
      virtualizationProvider,
      imagePath,
    }: {
      isRootful?: boolean;
      enableUserNet?: boolean;
      startNow?: boolean;
      virtualizationProvider?: PodmanVirtualizationProviders;
      imagePath?: string;
    } = {},
  ): Promise<void> {
    return test.step(`Create Podman Machine '${machineName}' with settings: ${isRootful ? 'rootful' : 'rootless'}, ${enableUserNet ? 'usernet enabled' : 'usernet disabled'}, ${startNow ? 'startnow enabled' : 'startnow disabled'}${virtualizationProvider ? ', and ' + virtualizationProvider : ''}${imagePath ? ', image: ' + imagePath : ''}`, async () => {
      await playExpect(this.podmanMachineConfiguration).toBeVisible({
        timeout: 10_000,
      });
      await this.podmanMachineName.clear();
      await playExpect(this.podmanMachineName).toHaveValue('');

      await this.podmanMachineName.fill(machineName);
      await playExpect(this.podmanMachineName).toHaveValue(machineName);

      if (imagePath) {
        await this.imagePathBox.clear();
        await this.imagePathBox.fill(imagePath);
        await playExpect(this.imagePathBox).toHaveValue(imagePath);
      }

      await this.ensureCheckboxState(isRootful, this.rootPrivilegesCheckbox);
      if (!!isWindows && getVirtualizationProvider() === PodmanVirtualizationProviders.WSL) {
        await this.ensureCheckboxState(enableUserNet, this.userModeNetworkingCheckbox);
      }
      if (virtualizationProvider) {
        await this.specifyVirtualizationProvider(virtualizationProvider);
      }
      await this.ensureCheckboxState(startNow, this.startNowCheckbox);

      await playExpect(this.createMachineButton).toBeEnabled();
      await this.createMachineButton.click();
    });
  }

  async ensureCheckboxState(desiredState: boolean, checkbox: Locator): Promise<void> {
    return test.step(`Ensure checkbox is ${desiredState ? 'checked' : 'unchecked'}`, async () => {
      if (desiredState !== (await checkbox.isChecked())) {
        await checkbox.locator('..').click();
      }

      await playExpect.poll(async () => await checkbox.isChecked()).toBe(desiredState);
    });
  }

  async specifyVirtualizationProvider(
    virtualizationProvider: PodmanVirtualizationProviders | undefined,
  ): Promise<void> {
    return test.step(`Set Podman Provider to ${virtualizationProvider ?? getDefaultVirtualizationProvider()}`, async () => {
      if (!virtualizationProvider) return;
      // Only select if the dropdown is actually present/visible
      if (!(await this.providerTypeDropdown.getContainer().isVisible())) return;
      await this.providerTypeDropdown.waitForReady();
      // Compare by the hidden input value using variant matching to handle version differences
      const currentValue = await this.providerTypeDropdown.getCurrentValue();
      if (!matchesProviderVariant(virtualizationProvider, currentValue)) {
        // Try to find which variant actually exists in the dropdown
        const availableOptions = await this.providerTypeDropdown.getAvailableOptions();
        const variants = PodmanVirtualizationProviderVariants[virtualizationProvider];
        // Find the first variant that matches any available option
        const matchingVariant = variants.find(variant =>
          availableOptions.some(option => option.toLowerCase().trim() === variant.toLowerCase().trim()),
        );
        if (!matchingVariant) {
          throw new Error(
            `No matching variant found for provider ${virtualizationProvider}. Available options: ${availableOptions.join(', ')}. Expected variants: ${variants.join(', ')}`,
          );
        }
        await this.providerTypeDropdown.selectOption(matchingVariant, matchingVariant, false);
        await this.providerTypeDropdown.verifyState(matchingVariant, matchingVariant);
      }
    });
  }
}
