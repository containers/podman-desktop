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

export abstract class SettingsPage extends BasePage {
  readonly tabName: string;
  readonly header: Locator;
  readonly content: Locator;

  constructor(page: Page, tabName: string) {
    super(page);
    this.tabName = tabName;
    this.header = this.page.getByRole('region', { name: 'Header' });
    this.content = this.page.getByRole('region', { name: 'Content' });
  }

  async getTab(): Promise<Locator> {
    return this.page
      .getByRole('navigation', { name: 'PreferencesNavigation' })
      .getByRole('link', { name: this.tabName, exact: true });
  }
}
