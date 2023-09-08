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
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  readonly mainPage: Locator;
  readonly header: Locator;
  readonly content: Locator;
  readonly heading: Locator;
  readonly devSandboxBox: Locator;
  readonly devSandboxStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.mainPage = page.getByRole('region', { name: 'Dashboard' });
    this.header = this.mainPage.getByRole('region', { name: 'header' });
    this.content = this.mainPage.getByRole('region', { name: 'content' });
    this.heading = this.header.getByRole('heading', { name: 'dashboard' });
    this.devSandboxBox = this.content.getByTitle('Free remote OpenShift sandbox environment for immediate access');
    this.devSandboxStatus = this.content.getByText('Developer Sandbox is running');
  }
}
