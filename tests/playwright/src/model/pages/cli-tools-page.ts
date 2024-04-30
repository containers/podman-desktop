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

import type { Locator, Page } from 'playwright';

import { SettingsPage } from './settings-page';

export class CLIToolsPage extends SettingsPage {
  readonly main: Locator;
  readonly header: Locator;
  readonly content: Locator;
  readonly heading: Locator;
  readonly toolsTable: Locator;

  constructor(page: Page) {
    super(page, 'CLI Tools');
    this.main = page.getByRole('region', { name: 'CLI Tools' }); //check name
    this.header = this.main.getByRole('region', { name: 'Header' });
    this.heading = this.header.getByRole('heading', { name: 'CLI Tools', exact: true });
    this.content = this.main.getByRole('region', { name: 'Content' });
    this.toolsTable = this.content.getByRole('table', { name: 'cli-tools' });
  }
}
