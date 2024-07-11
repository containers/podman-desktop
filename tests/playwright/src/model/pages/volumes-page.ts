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

import type { Locator, Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { waitUntil, waitWhile } from '../../utility/wait';
import { CreateVolumePage } from './create-volume-page';
import { MainPage } from './main-page';
import { VolumeDetailsPage } from './volume-details-page';

export class VolumesPage extends MainPage {
  readonly createVolumeButton: Locator;
  readonly pruneVolumesButton: Locator;
  readonly collectUsageDataButton: Locator;

  constructor(page: Page) {
    super(page, 'volumes');
    this.createVolumeButton = this.additionalActions.getByRole('button', { name: 'Create' });
    this.pruneVolumesButton = this.additionalActions.getByRole('button', { name: 'Prune' });
    this.collectUsageDataButton = this.additionalActions.getByRole('button', { name: 'Gather volume sizes' });
  }

  async openCreateVolumePage(volumeName: string): Promise<CreateVolumePage> {
    const row = await this.getVolumeRowByName(volumeName);
    if (row !== undefined) {
      throw Error('Volume is already created');
    }

    await playExpect(this.createVolumeButton).toBeEnabled();
    await this.createVolumeButton.click();
    return new CreateVolumePage(this.page);
  }

  async openVolumeDetails(volumeName: string): Promise<VolumeDetailsPage> {
    const volumeRow = await this.getVolumeRowByName(volumeName);
    if (volumeRow === undefined) {
      throw Error(`Volume: ${volumeName} does not exist`);
    }
    const containerRowName = volumeRow.getByRole('cell').nth(3);
    await containerRowName.click();

    return new VolumeDetailsPage(this.page, volumeName);
  }

  async getVolumeRowByName(name: string): Promise<Locator | undefined> {
    return this.getRowFromTableByName(name);
  }

  protected async volumeExists(name: string): Promise<boolean> {
    const result = await this.getVolumeRowByName(name);
    return result !== undefined;
  }

  async waitForVolumeExists(name: string): Promise<boolean> {
    await waitUntil(async () => await this.volumeExists(name));
    return true;
  }

  async waitForVolumeDelete(name: string): Promise<boolean> {
    await waitWhile(async () => await this.volumeExists(name));
    return true;
  }
}
