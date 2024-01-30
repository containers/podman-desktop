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

import type { Locator, Page } from 'playwright';
import { SettingsPage } from './settings-page';
import { waitUntil } from '../../utility/wait';

export class RegistriesPage extends SettingsPage {
  readonly heading: Locator;
  readonly addRegistryButton: Locator;
  readonly registriesTable: Locator;

  constructor(page: Page) {
    super(page, 'Registries');
    this.heading = page.getByText('Registries');
    this.addRegistryButton = page.getByRole('button', { name: 'Add registry' });
    this.registriesTable = page.getByRole('table', { name: 'Registries' });
  }

  async createRegistry(url: string, username: string, pswd: string) {
    await this.addRegistryButton.click();

    const registryUrl = this.page.getByLabel('Register URL');
    const registryUsername = this.page.getByLabel('Username');
    const registryPswd = this.page.getByRole('textbox', { name: 'Password' });
    await registryUrl.fill(url);
    await registryUsername.fill(username);
    await registryPswd.fill(pswd);

    const loginButton = this.page.getByRole('button', { name: 'Login' });
    await this.loginButtonHandling(loginButton);
  }

  async editRegistry(title: string, newUsername: string, newPswd: string) {
    const registryBox = await this.getRegistryRowByName(title);

    const dropdownMenu = registryBox.getByRole('button', { name: 'kebab menu' });
    await dropdownMenu.click();

    const editButton = registryBox.getByTitle('Edit password');
    await editButton.click();

    const registryUsername = registryBox.getByLabel('Username');
    const registryPswd = registryBox.getByRole('textbox', { name: 'Password' });
    await registryUsername.fill(newUsername);
    await registryPswd.fill(newPswd);

    const loginButton = registryBox.getByRole('button', { name: 'Login' });
    await this.loginButtonHandling(loginButton);
  }

  async removeRegistry(title: string) {
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
        5000,
        1000,
        true,
        'Login Button not enabled in time',
      );
      await loginButton.click({ timeout: 3000 });
    } catch (err) {
      throw Error(`An error occured when trying to log into registry: ${(err as Error).message}`);
    }
  }
}
