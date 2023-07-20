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

import { expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import type { Page } from 'playwright';

/**
 * Force remove recursively folder, if exists
 * @param path path to a folder to be force removed recursively
 */
export async function removeFolderIfExists(path: string) {
  if (existsSync(path)) {
    console.log(`Cleaning up folder: ${path}`);
    await rm(path, { recursive: true, force: true });
  }
}

/**
 * Waits for application to initialize, turn off telemetry and handle welcome page
 * @param page playwright page object of the electron application
 */
export async function handleWelomePage(page: Page) {
  // wait for an application to initialize
  const checkLoader = page.getByRole('heading', { name: 'Initializing...' });
  await expect(checkLoader).toHaveCount(0, { timeout: 5000 });

  // handle welcome page
  if ((await page.getByRole('button', { name: 'Go to Podman Desktop' }).count()) > 0) {
    const telemetryConsent = page.getByText('Telemetry');
    if (await telemetryConsent.isChecked()) {
      await telemetryConsent.click();
    }
    await page.getByRole('button', { name: 'Go to Podman Desktop' }).click();
  }
}
