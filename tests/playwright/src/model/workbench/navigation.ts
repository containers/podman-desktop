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

import { ContainersPage } from '../pages/containers-page';
import { DashboardPage } from '../pages/dashboard-page';
import { ImagesPage } from '../pages/images-page';
import { PodsPage } from '../pages/pods-page';
import { SettingsBar } from '../pages/settings-bar';

export class NavigationBar {
  readonly page: Page;
  readonly navigationLocator: Locator;
  readonly imagesLink: Locator;
  readonly containersLink: Locator;
  readonly volumesLink: Locator;
  readonly podsLink: Locator;
  readonly dashboardLink: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationLocator = this.page.getByRole('navigation', { name: 'AppNavigation' });
    this.imagesLink = this.page.getByRole('link', { name: 'Images' });
    this.containersLink = this.page.getByRole('link', { name: 'Containers' });
    this.podsLink = this.page.getByRole('link', { name: 'Pods' });
    this.volumesLink = this.page.getByRole('link', { name: 'Volumes' });
    this.dashboardLink = this.page.getByRole('link', { name: 'Dashboard' });
    this.settingsLink = this.page.getByRole('link', { name: 'Settings' });
  }

  async openDashboard(): Promise<DashboardPage> {
    await this.dashboardLink.waitFor({ state: 'visible', timeout: 3000 });
    await this.dashboardLink.click({ timeout: 5000 });
    return new DashboardPage(this.page);
  }

  async openImages(): Promise<ImagesPage> {
    await this.imagesLink.waitFor({ state: 'visible', timeout: 3000 });
    await this.imagesLink.click({ timeout: 5000 });
    return new ImagesPage(this.page);
  }

  async openContainers(): Promise<ContainersPage> {
    await this.containersLink.waitFor({ state: 'visible', timeout: 3000 });
    await this.containersLink.click({ timeout: 5000 });
    return new ContainersPage(this.page);
  }

  async openPods(): Promise<PodsPage> {
    await this.podsLink.waitFor({ state: 'visible', timeout: 3000 });
    await this.podsLink.click({ timeout: 5000 });
    return new PodsPage(this.page);
  }

  async openSettings(): Promise<SettingsBar> {
    await this.settingsLink.waitFor({ state: 'visible', timeout: 3000 });
    await this.settingsLink.click({ timeout: 5000 });
    return new SettingsBar(this.page);
  }
}
