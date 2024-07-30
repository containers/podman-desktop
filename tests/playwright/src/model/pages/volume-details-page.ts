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

import { handleConfirmationDialog } from '../../utility/operations';
import { VolumeState } from '../core/states';
import { DetailsPage } from './details-page';
import { VolumesPage } from './volumes-page';

export class VolumeDetailsPage extends DetailsPage {
  readonly deleteButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';

  constructor(page: Page, name: string) {
    super(page, name);
    this.deleteButton = this.controlActions.getByRole('button', { name: 'Delete Volume' });
  }

  async isUsed(): Promise<boolean> {
    return (await this.header.getByTitle(VolumeState.Used).count()) > 0;
  }

  async deleteVolume(): Promise<VolumesPage> {
    await playExpect(this.deleteButton).toBeEnabled();
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new VolumesPage(this.page);
  }
}
