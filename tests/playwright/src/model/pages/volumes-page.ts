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
import test, { expect as playExpect } from '@playwright/test';

import { handleConfirmationDialog } from '../../utility/operations';
import { waitUntil, waitWhile } from '../../utility/wait';
import { VolumeState } from '../core/states';
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
    return test.step('Open Create Volume Page', async () => {
      const row = await this.getVolumeRowByName(volumeName);
      if (row !== undefined) {
        throw Error('Volume is already created');
      }

      await playExpect(this.createVolumeButton).toBeEnabled();
      await this.createVolumeButton.click();
      return new CreateVolumePage(this.page);
    });
  }

  async openVolumeDetails(volumeName: string): Promise<VolumeDetailsPage> {
    return test.step('Open Volume Details Page', async () => {
      const volumeRow = await this.getVolumeRowByName(volumeName);
      if (volumeRow === undefined) {
        throw Error(`Volume: ${volumeName} does not exist`);
      }
      const containerRowName = volumeRow.getByRole('cell').nth(3);
      await containerRowName.click();

      return new VolumeDetailsPage(this.page, volumeName);
    });
  }

  async deleteVolume(volumeName: string): Promise<VolumesPage> {
    return test.step('Delete Volume', async () => {
      const volumeRow = await this.getVolumeRowByName(volumeName);
      if (volumeRow === undefined) {
        throw Error(`Volume: ${volumeName} does not exist`);
      }
      const containerRowDeleteButton = volumeRow.getByRole('button', { name: 'Delete Volume' });
      await playExpect(containerRowDeleteButton).toBeEnabled();
      await containerRowDeleteButton.click();
      await handleConfirmationDialog(this.page);

      return this;
    });
  }

  async getVolumeRowByName(name: string): Promise<Locator | undefined> {
    return this.getRowFromTableByName(name);
  }

  protected async volumeExists(name: string): Promise<boolean> {
    return test.step(`Check if volume ${name} exists`, async () => {
      const result = await this.getVolumeRowByName(name);
      return result !== undefined;
    });
  }

  async countVolumesFromTable(): Promise<number> {
    return this.countRowsFromTable();
  }

  async countUsedVolumesFromTable(): Promise<number> {
    return (await this.getRowsFromTableByStatus(VolumeState.Used)).length;
  }

  async waitForVolumeExists(name: string, timeout = 30_000): Promise<boolean> {
    return test.step(`Wait for volume ${name} to exist`, async () => {
      if (!name) {
        throw Error('Volume name is not provided');
      }
      await waitUntil(async () => await this.volumeExists(name), { timeout });
      return true;
    });
  }

  async waitForVolumeDelete(name: string, timeout = 30_000): Promise<boolean> {
    return test.step(`Wait for volume ${name} to be deleted`, async () => {
      if (!name) {
        throw Error('Volume name is not provided');
      }
      await waitWhile(async () => await this.volumeExists(name), { timeout });
      return true;
    });
  }

  async pruneVolumes(): Promise<VolumesPage> {
    return test.step('Prune Volumes', async () => {
      await playExpect(this.pruneVolumesButton).toBeEnabled();
      await this.pruneVolumesButton.click();
      await handleConfirmationDialog(this.page, 'Prune');
      return this;
    });
  }
}
