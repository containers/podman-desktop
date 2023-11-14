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

export class RegistriesPage extends SettingsPage {
  readonly heading: Locator;
  readonly addRegistryButton: Locator;
  readonly registriesTable: Locator;

  constructor(page: Page) {
    super(page, 'Registries');
    this.heading = page.getByText('Registries');
    this.addRegistryButton = page.getByRole('button', { name: 'Add registry' });
    this.registriesTable = page.getByRole('region', { name: 'Registries table' });
  }

  async createRegistry(url: string, username: string, pswd: string) {
    await this.addRegistryButton.click();

    const registryUrl = this.page.getByLabel('Register URL');
    const registryUsername = this.page.getByLabel('Username');
    const registryPswd = this.page.getByLabel('Password');
    await registryUrl.fill(url);
    await registryUsername.fill(username);
    await registryPswd.fill(pswd);

    const loginButton = this.page.getByRole('button', { name: 'Login' });
    await loginButton.click();
  }

  async editRegistry(url: string, newUsername: string, newPswd: string) {
    const registryBox = this.registriesTable.getByLabel(url);
    const dropdownMenu = registryBox.getByLabel('Dropdown menu');
    await dropdownMenu.click();

    const editButton = registryBox.getByLabel('Edit password');
    await editButton.click();

    const registryUsername = registryBox.getByLabel('Username');
    const registryPswd = registryBox.getByLabel('Password');
    await registryUsername.fill(newUsername);
    await registryPswd.fill(newPswd);

    const loginButton = registryBox.getByRole('button', { name: 'Login' });
    await loginButton.click();
  }
}
