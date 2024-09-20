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

import { type Locator, type Page } from '@playwright/test';

import { waitUntil } from '/@/utility/wait';

import { BasePage } from './base-page';

export abstract class DetailsPage extends BasePage {
  readonly header: Locator;
  readonly tabs: Locator;
  readonly tabContent: Locator;
  readonly controlActions: Locator;
  readonly closeButton: Locator;
  readonly backLink: Locator;
  readonly pageName: Locator;
  readonly resourceName: string;
  readonly heading: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page, resourceName: string) {
    super(page);
    this.resourceName = resourceName;

    this.tabContent = page.getByRole('region', { name: 'Tab Content' });
    this.header = page.getByRole('region', { name: 'Header' });
    this.tabs = page.getByRole('region', { name: 'Tabs' });
    this.breadcrumb = this.header.getByRole('navigation', { name: 'Breadcrumb' });
    this.controlActions = this.header.getByRole('group', { name: 'Control Actions' });
    this.heading = this.header.getByRole('heading', { name: this.resourceName });
    this.closeButton = this.breadcrumb.getByRole('button', { name: 'Close' });
    this.backLink = this.breadcrumb.getByRole('link', { name: 'Back' });
    this.pageName = this.breadcrumb.getByRole('region', { name: 'Page Name' });
  }

  async activateTab(tabName: string): Promise<this> {
    const tabItem = this.tabs.getByRole('link', { name: tabName, exact: true });
    await waitUntil(async () => await tabItem.isVisible(), {
      message: `Tab ${tabName} does not exist currently, maybe entry was deleted!`,
    });
    await tabItem.click();
    return this;
  }
}
