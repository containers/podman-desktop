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
import * as os from 'os';

export class DashboardPage extends BasePage {
  readonly mainPage: Locator;
  readonly header: Locator;
  readonly content: Locator;
  readonly heading: Locator;
  readonly featuredExtensions: Locator;
  readonly devSandboxProvider: Locator;
  readonly devSandboxBox: Locator;
  readonly devSandboxEnabledStatus: Locator;
  readonly openshiftLocalProvider: Locator;
  readonly openshiftLocalBox: Locator;
  openshiftLocalEnabledStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.mainPage = page.getByRole('region', { name: 'Dashboard' });
    this.header = this.mainPage.getByRole('region', { name: 'header' });
    this.content = this.mainPage.getByRole('region', { name: 'content' });
    this.featuredExtensions = page.getByLabel('FeaturedExtensions');
    this.heading = page.getByRole('heading', { name: 'Dashboard' });

    this.devSandboxProvider = page.getByLabel('Developer Sandbox Provider');
    this.devSandboxBox = this.featuredExtensions.getByLabel('Developer Sandbox');
    this.devSandboxEnabledStatus = page.getByText('Developer Sandbox is running');

    this.openshiftLocalProvider = page.getByLabel('OpenShift Local Provider');
    this.openshiftLocalBox = this.featuredExtensions.getByLabel('OpenShift Local');
    this.openshiftLocalEnabledStatus = this.getOpenShiftStatus(page);
  }

  getOpenShiftStatus(page: Page) {
    const currentOS = os.platform();
    if (currentOS === 'linux') {
      return page.getByText('Podman Desktop was not able to find an installation of OpenShift Local.');
    }
    const pattern = new RegExp('OpenShift Local v([0-9.]*) is installed but not ready');
    return page.getByText(pattern);
  }
}
