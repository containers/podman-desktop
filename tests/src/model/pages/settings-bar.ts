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
import type { SettingsPage } from './settings-page';

export class SettingsBar {
  readonly page: Page;
  readonly settingsNavBar: Locator;
  readonly resourcesTab: Locator;
  readonly proxyTab: Locator;
  readonly registriesTab: Locator;
  readonly authenticationTab: Locator;
  readonly extensionsTab: Locator;
  readonly desktopExtensionsTab: Locator;
  readonly preferencesTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.settingsNavBar = page.getByRole('navigation', { name: 'PreferencesNavigation' });
    this.resourcesTab = this.settingsNavBar.getByRole('link', { name: 'Resources' });
    this.proxyTab = this.settingsNavBar.getByRole('link', { name: 'Proxy' });
    this.registriesTab = this.settingsNavBar.getByRole('link', { name: 'Registries' });
    this.authenticationTab = this.settingsNavBar.getByRole('link', { name: 'Authentication' });
    this.extensionsTab = this.settingsNavBar.getByRole('link', { name: 'Extensions' });
    this.desktopExtensionsTab = this.settingsNavBar.getByRole('link', { name: 'DesktopExtensions' });
    this.preferencesTab = this.settingsNavBar.getByRole('link', { name: 'preferences' });
  }

  async openTabPage<T extends SettingsPage>(type: new (page: Page) => T): Promise<T> {
    const desiredPage = new type(this.page);
    await (await desiredPage.getTab()).click();
    return desiredPage;
  }
}
