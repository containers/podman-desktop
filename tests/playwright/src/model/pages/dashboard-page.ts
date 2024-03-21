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

export class DashboardPage extends BasePage {
  readonly mainPage: Locator;
  readonly header: Locator;
  readonly content: Locator;
  readonly heading: Locator;
  readonly notificationsBox: Locator;
  readonly featuredExtensions: Locator;
  // dev sandbox
  readonly devSandboxProvider: Locator;
  readonly devSandboxBox: Locator;
  readonly devSandboxStatusLabel: Locator;
  // openshift local
  readonly openshiftLocalProvider: Locator;
  readonly openshiftLocalBox: Locator;
  readonly openshiftLocalStatusLabel: Locator;
  readonly transitioningState: Locator;

  // podman/machine
  readonly podmanProvider: Locator;
  readonly podmanStatusLabel: Locator;
  readonly podmanInitilizeAndStartButton: Locator;

  // contants
  readonly ACTUAL_STATE = 'Actual State';
  readonly CONNECTION_STATUS_LABEL = 'Connection Status Label';

  constructor(page: Page) {
    super(page);
    this.mainPage = page.getByRole('region', { name: 'Dashboard' });
    this.header = this.mainPage.getByRole('region', { name: 'header' });
    this.content = this.mainPage.getByRole('region', { name: 'content' });
    this.heading = page.getByRole('heading', { name: 'Dashboard' });

    this.notificationsBox = this.content.getByRole('region', { name: 'Notifications Box' });
    this.featuredExtensions = page.getByRole('region', { name: 'FeaturedExtensions' });

    // Dev Sandbox locators
    this.devSandboxProvider = page.getByRole('region', { name: 'Developer Sandbox Provider' });
    this.devSandboxBox = this.featuredExtensions.getByLabel('Developer Sandbox');
    this.devSandboxStatusLabel = this.devSandboxProvider.getByLabel(this.CONNECTION_STATUS_LABEL);

    // OpenShift Local locators
    this.openshiftLocalProvider = page.getByRole('region', { name: 'OpenShift Local Provider' });
    this.openshiftLocalBox = this.featuredExtensions.getByLabel('OpenShift Local');
    this.openshiftLocalStatusLabel = this.openshiftLocalProvider.getByLabel(this.CONNECTION_STATUS_LABEL);

    // Podman/Machine Provider locators
    this.podmanProvider = page.getByRole('region', { name: 'Podman Provider' });
    this.podmanInitilizeAndStartButton = this.podmanProvider.getByRole('button', { name: 'Initialize and start ' });
    this.transitioningState = this.podmanProvider.getByLabel('Transitioning State');
    this.podmanStatusLabel = this.podmanProvider.getByLabel(this.CONNECTION_STATUS_LABEL);
  }

  public getPodmanStatusLocator(): Locator {
    return this.content.getByRole('region', { name: 'Podman Provider' });
  }
}
