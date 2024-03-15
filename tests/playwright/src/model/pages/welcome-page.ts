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
import { expect } from '@playwright/test';

import { BasePage } from './base-page';

export class WelcomePage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly telemetryConsent: Locator;
  readonly goToPodmanDesktopButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.getByText('Welcome to Podman Desktop');
    this.telemetryConsent = page.getByText('Telemetry');
    this.goToPodmanDesktopButton = page.getByRole('button', { name: 'Go to Podman Desktop', exact: true });
  }

  async turnOffTelemetry(): Promise<void> {
    await this.telemetryConsent.uncheck();
  }

  async closeWelcomePage(): Promise<void> {
    await this.goToPodmanDesktopButton.click();
  }

  async waitForInitialization(): Promise<void> {
    // wait for an application to initialize
    const checkLoader = this.page.getByRole('heading', { name: 'Initializing...' });
    await expect(checkLoader).toHaveCount(0, { timeout: 5000 });
  }

  /**
   * Waits for application to initialize, turn off telemetry and closes welcome page
   */
  async handleWelcomePage(skipIfNotPresent: boolean): Promise<void> {
    await this.waitForInitialization();
    if (skipIfNotPresent) {
      try {
        await this.goToPodmanDesktopButton.waitFor({ state: 'visible', timeout: 5000 });
      } catch (err) {
        if ((err as Error).name !== 'TimeoutError') {
          throw err;
        }
        return;
      }
    }
    await this.turnOffTelemetry();
    await this.closeWelcomePage();
    await expect(this.welcomeMessage).toHaveCount(0, { timeout: 3000 });
  }
}
