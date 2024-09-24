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

import { SettingsPage } from './settings-page';

export class PreferencesPage extends SettingsPage {
  readonly heading: Locator;
  readonly content: Locator;
  readonly kubePathInput: Locator;

  constructor(page: Page) {
    super(page, 'Preferences');
    this.heading = this.page.getByLabel('Title', { exact: true });
    this.content = this.page.getByLabel('Content');
    this.kubePathInput = this.content.getByLabel(
      'Path to the Kubeconfig file for accessing clusters. (Default is usually ~/.kube/config)',
    );
  }

  async selectKubeFile(pathToKube: string): Promise<void> {
    if (!pathToKube) {
      throw Error(`Path to Kube config file is incorrect or not provided!`);
    }
    playExpect(this.kubePathInput).toBeDefined();
    await this.kubePathInput.clear();
    await this.kubePathInput.fill(pathToKube);
  }
}
