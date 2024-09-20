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

import { expect as playExpect, type Locator, type Page } from '@playwright/test';

import type { ResourceElementActions } from '../core/operations';
import { ResourceCardPage } from './resource-card-page';

export class ResourceConnectionCardPage extends ResourceCardPage {
  readonly resourceElement: Locator;
  readonly resourceElementDetailsButton: Locator;
  readonly resourceElementConnectionStatus: Locator;
  readonly resourceElementConnectionActions: Locator;
  readonly createButton: Locator;

  constructor(page: Page, resourceName: string, resourceElementVisibleName?: string) {
    super(page, resourceName);
    this.resourceElement = this.providerConnections.getByRole('region', {
      name: resourceElementVisibleName,
      exact: true,
    });
    this.resourceElementDetailsButton = this.resourceElement.getByRole('button', { name: 'details' });
    this.resourceElementConnectionStatus = this.resourceElement.getByLabel('Connection Status Label');
    this.resourceElementConnectionActions = this.resourceElement.getByRole('group', { name: 'Connection Actions' });
    this.createButton = this.providerSetup.getByRole('button', { name: 'Create' });
  }

  public async doesResourceElementExist(): Promise<boolean> {
    return (await this.resourceElement.count()) > 0;
  }

  public async performConnectionAction(operation: ResourceElementActions, timeout: number = 25000): Promise<void> {
    const button = this.resourceElementConnectionActions.getByRole('button', { name: operation, exact: true });
    await playExpect(button).toBeEnabled({ timeout: timeout });
    // eslint-disable-next-line sonarjs/no-base-to-string
    console.log(`Performing connection action '${operation}' on resource element '${this.resourceElement}'`);
    await button.click();
  }
}
