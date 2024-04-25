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

export class BootcPage {
  readonly page: Page;
  readonly webview: Page;
  readonly heading: Locator;
  readonly outputFolderPath: Locator;
  readonly rawCheckbox: Locator;
  readonly qcow2Checkbox: Locator;
  readonly isoCheckbox: Locator;
  readonly vmdkCheckbox: Locator;
  readonly amiCheckbox: Locator;
  readonly amd64Button: Locator;
  readonly arm64Button: Locator;
  readonly buildButton: Locator;

  constructor(page: Page, webview: Page) {
    this.page = page;
    this.webview = webview;
    this.heading = webview.getByLabel('Build Disk Image');
    this.outputFolderPath = webview.getByLabel('folder-select');
    this.rawCheckbox = webview.locator('label[for="raw"]');
    this.qcow2Checkbox = webview.locator('label[for="qcow2"]');
    this.isoCheckbox = webview.locator('label[for="iso"]');
    this.vmdkCheckbox = webview.locator('label[for="vmdk"]');
    this.amiCheckbox = webview.locator('label[for="ami"]');
    this.amd64Button = webview.locator('label[for="amd64"]');
    this.arm64Button = webview.locator('label[for="arm64"]');
    this.buildButton = webview.getByRole('button', { name: 'Build' });
  }

  async buildDiskImage(pathToStore: string, type: string, architecture: string): Promise<boolean> {
    let result = false;

    try {
      await this.outputFolderPath.fill(pathToStore);
      await this.uncheckedAllCheckboxes();

      switch (type.toLocaleLowerCase()) {
        case 'raw':
          await this.rawCheckbox.check();
          break;
        case 'qcow2':
          await this.qcow2Checkbox.check();
          break;
        case 'iso':
          await this.isoCheckbox.check();
          break;
        case 'vmdk':
          await this.vmdkCheckbox.check();
          break;
        case 'ami':
          await this.amiCheckbox.check();
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      switch (architecture.toLocaleLowerCase()) {
        case 'amd64':
          await playExpect(this.amd64Button).toBeEnabled();
          await this.amd64Button.click();
          break;
        case 'arm64':
          await playExpect(this.arm64Button).toBeEnabled();
          await this.arm64Button.click();
          break;
        default:
          throw new Error(`Unknown architecture: ${architecture}`);
      }

      await playExpect(this.buildButton).toBeEnabled();
      await this.buildButton.click();

      const dialogLocator = this.page.getByRole('dialog', { name: 'Bootable Container', exact: true });
      await playExpect.poll(async () => (await dialogLocator.count()) > 0, { timeout: 340000 }).toBeTruthy();

      const dialogMessageLocator = this.page.getByLabel('Dialog Message');
      result = (await dialogMessageLocator.innerText()).includes('Success!');
    } finally {
      const okButtonLocator = this.page.getByRole('button', { name: 'OK' });
      await playExpect(okButtonLocator).toBeEnabled();
      await okButtonLocator.click();
    }

    return result;
  }

  private async uncheckedAllCheckboxes(): Promise<void> {
    await this.rawCheckbox.uncheck();
    await this.qcow2Checkbox.uncheck();
    await this.isoCheckbox.uncheck();
    await this.vmdkCheckbox.uncheck();
    await this.amiCheckbox.uncheck();
  }
}
