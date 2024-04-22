/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { ExtensionDetailsPage } from './extension-details-page';
import { MainPage } from './main-page';

export class ExtensionsPage extends MainPage {
  readonly heading: Locator;
  readonly header: Locator;
  readonly content: Locator;
  readonly imageInstallBox: Locator;

  constructor(page: Page) {
    super(page, 'extensions');
    this.header = page.getByRole('region', { name: 'Header' });
    this.content = page.getByRole('region', { name: 'Content' });
    this.heading = this.header.getByLabel('Title').getByText('Extensions');
    this.imageInstallBox = this.content.getByRole('region', { name: 'Install Extension from OCI image' });
  }

  public async installExtensionFromOCIImage(extension: string): Promise<ExtensionsPage> {
    console.log('installing extension from OCI image', extension);
    // open button to install extension from OCI image
    const instalButton = this.getInstallManuallyButton();
    console.log('instalButto', instalButton);
    await playExpect(instalButton).toBeEnabled();
    console.log('button is there, clicking on it');
    await instalButton.click();

    const imageInput = this.page.getByRole('textbox', { name: 'Image name to install custom extension' });
    // check visibility of the input
    console.log('imageInput is', imageInput);
    await playExpect(imageInput).toBeVisible();
    console.log('input is there, filling it with', extension);

    await imageInput.fill(extension);

    const installButton = this.page.getByRole('button', { name: 'Install', exact: true });
    console.log('Install button is', installButton);
    await playExpect(installButton).toBeEnabled();
    console.log('Install button is visible');

    await installButton.click();

    const doneButton = this.page.getByRole('button', { name: 'Done', exact: true });
    console.log('doneButton button is', installButton);
    await playExpect(doneButton).toBeEnabled({ timeout: 30000 });
    console.log('done button is visible');
    await doneButton.click();

    return this;
  }

  public async openExtensionPage<T extends ExtensionDetailsPage>(type: new (page: Page) => T): Promise<T> {
    const desiredPage = new type(this.page);
    await desiredPage.getOpenExtensionDetailsLink().click();
    return desiredPage;
  }

  getOpenExtensionDetailsLink(extensionName: string): Locator {
    return this.page.getByRole('button', { name: `${extensionName} extension details`, exact: true }).first();
  }

  getInstallManuallyButton(): Locator {
    return this.page.getByRole('button', { name: 'Install custom...', exact: true });
  }

  async openExtensionDetails(extensionName: string): Promise<ExtensionDetailsPage> {
    console.log('get openExtensionDetails link for', extensionName);
    const openLink = this.getOpenExtensionDetailsLink(extensionName);
    console.log('openLink', openLink);
    if (openLink === undefined) {
      throw Error(`Extension '${extensionName}' does not exist`);
    }

    // wait the link to be there
    console.log('waiting for the link to be visible');
    await playExpect(openLink).toBeVisible();
    console.log('link is visible');

    console.log('got openlink', openLink);
    await openLink.click();
    console.log('after clicking on the link....');
    return new ExtensionDetailsPage(this.page, extensionName);
  }
}
