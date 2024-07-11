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

import { expect as playExpect } from '@playwright/test';
import type { Locator, Page } from 'playwright';

import { waitUntil } from '../../utility/wait';
import { SettingsPage } from './settings-page';

export class RegistriesPage extends SettingsPage {
  readonly heading: Locator;
  readonly addRegistryButton: Locator;
  readonly registriesTable: Locator;
  readonly cancelAddRegistryButton: Locator;
  readonly addRegistryUrl: Locator;
  readonly addRegistryUsername: Locator;
  readonly addRegistryPswd: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, 'Registries');
    this.heading = page.getByText('Registries');
    this.addRegistryButton = page.getByRole('button', { name: 'Add registry' });
    this.registriesTable = page.getByRole('table', { name: 'Registries' });
    this.cancelAddRegistryButton = page.getByRole('button', { name: 'Cancel' });
    this.addRegistryUrl = page.getByLabel('Register URL');
    this.addRegistryUsername = page.getByLabel('Username');
    this.addRegistryPswd = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async createRegistry(url: string, username: string, pswd: string): Promise<void> {
    await this.page.waitForTimeout(4000);
    await playExpect(this.addRegistryButton).toBeEnabled();
    await this.addRegistryButton.click();
    await playExpect(this.cancelAddRegistryButton).toBeEnabled();

    await this.addRegistryUrl.fill(url);
    await this.addRegistryUsername.fill(username);
    await this.addRegistryPswd.fill(pswd);

    await playExpect(this.loginButton).toBeEnabled();
    await this.loginButton.click();
  }

  async editRegistry(title: string, newUsername: string, newPswd: string): Promise<void> {
    const registryBox = await this.getRegistryRowByName(title);

    const dropdownMenu = registryBox.getByRole('button', { name: 'kebab menu' });
    await dropdownMenu.click();

    const editButton = registryBox.getByTitle('Edit password');
    await editButton.click();

    const registryUsername = registryBox.getByLabel('Username');
    const registryPswd = registryBox.getByRole('textbox', { name: 'Password' });
    await registryUsername.pressSequentially(newUsername, { delay: 100 });
    await registryPswd.pressSequentially(newPswd, { delay: 100 });

    const loginButton = registryBox.getByRole('button', { name: 'Login' });
    await this.loginButtonHandling(loginButton);
  }

  /*
   * There are two types of registries, if it is custom, then it can be actually deleted
   * If it is default registry, it will delete only the credentials and the record will be kept there.
   */
  async removeRegistry(title: string): Promise<void> {
    const registryBox = await this.getRegistryRowByName(title);

    const dropdownMenu = registryBox.getByRole('button', { name: 'kebab menu' });
    try {
      await dropdownMenu.waitFor({ state: 'visible', timeout: 3000 });
    } catch (err) {
      throw Error(`Dropdown menu on ${title} registry not available.`);
    }
    await dropdownMenu.click();

    const editButton = registryBox.getByTitle('Remove');
    await editButton.click();
  }

  async getRegistryRowByName(name: string): Promise<Locator> {
    return this.registriesTable.getByRole('row', { name: name });
  }

  private async loginButtonHandling(loginButton: Locator): Promise<void> {
    try {
      await waitUntil(
        async function loginIsEnabled() {
          return await loginButton.isEnabled();
        },
        { message: 'Login Button not enabled in time' },
      );
      await loginButton.click({ timeout: 3000 });
    } catch (err) {
      throw Error(`An error occured when trying to log into registry: ${(err as Error).message}`);
    }
  }
}
