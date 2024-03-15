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

import { OnboardingPage } from './onboarding-page';

export class PodmanOnboardingPage extends OnboardingPage {
  readonly podmanAutostartToggle: Locator;
  readonly createMachinePageTitle: Locator;
  readonly podmanMachineConfiguration: Locator;
  readonly podmanMachineName: Locator;
  readonly podmanMachineCPUs: Locator;
  readonly podmanMachineMemory: Locator;
  readonly podmanMachineDiskSize: Locator;
  readonly podmanMachineImage: Locator;
  readonly podmanMachineRootfulCheckbox: Locator;
  readonly podmanMachineUserModeNetworkingCheckbox: Locator;
  readonly podmanMachineStartAfterCreationCheckbox: Locator;
  readonly podmanMachineCreateButton: Locator;
  readonly podmanMachineShowLogsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.podmanAutostartToggle = this.mainPage.getByRole('checkbox', {
      name: 'Autostart Podman engine when launching Podman Desktop',
    });
    this.createMachinePageTitle = this.onboardingComponent.getByLabel('title');
    this.podmanMachineConfiguration = this.mainPage.getByRole('form', { name: 'Properties Information' });
    this.podmanMachineName = this.podmanMachineConfiguration.getByRole('textbox', { name: 'Name' });
    this.podmanMachineCPUs = this.podmanMachineConfiguration.getByRole('slider', { name: 'CPU(s)' });
    this.podmanMachineMemory = this.podmanMachineConfiguration.getByRole('slider', { name: 'Memory' });
    this.podmanMachineDiskSize = this.podmanMachineConfiguration.getByRole('slider', { name: 'Disk size' });
    this.podmanMachineImage = this.podmanMachineConfiguration.getByRole('textbox', { name: 'Image Path (Optional)' });
    this.podmanMachineRootfulCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'Machine with root privileges',
    });
    this.podmanMachineUserModeNetworkingCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'User mode networking',
      exact: false,
    });
    this.podmanMachineStartAfterCreationCheckbox = this.podmanMachineConfiguration.getByRole('checkbox', {
      name: 'Start the machine now',
    });
    this.podmanMachineCreateButton = this.podmanMachineConfiguration.getByRole('button', { name: 'Create' });
    this.podmanMachineShowLogsButton = this.mainPage.getByRole('button', { name: 'Show Logs' });
  }
}
