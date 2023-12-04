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
import { BasePage } from './base-page';
import { ContainersPage } from './containers-page';

export class RunImagePage extends BasePage {
  readonly name: Locator;
  readonly heading: Locator;
  readonly closeLink: Locator;
  readonly backToImageDetailsLink: Locator;
  readonly imageName: string;
  readonly startContainerButton: Locator;

  constructor(page: Page, name: string) {
    super(page);
    this.imageName = name;
    this.name = page.getByLabel('name').and(page.getByText('Run Image'));
    this.heading = page.getByRole('heading', { name: this.imageName });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImageDetailsLink = page.getByRole('link', { name: 'Go back to Image Details' });
    this.startContainerButton = page.getByRole('button', { name: 'Start Container' });
  }

  async activateTab(name: string) {
    const tabactive = this.page.getByRole('link', { name: name, exact: true }).and(this.page.getByText(name));
    await tabactive.click();
  }

  async startContainer(customName = '', interactive?: boolean): Promise<ContainersPage> {
    if (customName !== '') {
      await this.activateTab('Basic');
      // ToDo: improve UI side with aria-labels
      const textbox = this.page.locator(`input[type='text'][name='modalContainerName']`);
      await textbox.fill(customName);
    }

    if (!interactive) {
      // disable the checkbox in advanced tab
      await this.activateTab('Advanced');
      const checkbox = this.page.getByRole('checkbox', { name: 'Attach a pseudo terminal' });
      await checkbox.uncheck();
    }

    await this.startContainerButton.waitFor({ state: 'visible', timeout: 1000 });
    await this.startContainerButton.click();
    // wait for containers page to appear
    const containers = new ContainersPage(this.page);
    try {
      await containers.heading.waitFor({ state: 'visible', timeout: 3000 });
    } catch (error) {
      console.log(`Containers Page seems not to be visible`);
      // consume the error
    }
    return containers;
  }

  async setCustomPortMapping(customPortMapping: string): Promise<void> {
    // add port mapping
    await this.activateTab('Basic');
    const addPortMappingButton = this.page.getByRole('button', { name: 'Add custom port mapping' });
    await addPortMappingButton.click();
    const hostPort = this.page.getByLabel('host port');
    const containerPort = this.page.getByLabel('container port');
    await hostPort.fill(customPortMapping.split(':')[0]);
    await containerPort.fill(customPortMapping.split(':')[1]);
  }
}
