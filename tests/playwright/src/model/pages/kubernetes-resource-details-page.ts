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

import { KubernetesResourceState } from '../core/states';
import { DetailsPage } from './details-page';

export class KubernetesResourceDetailsPage extends DetailsPage {
  readonly applyChangesButton: Locator;
  readonly revertChagesButton: Locator;
  readonly deleteButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';
  static readonly INSPECT_TAB = 'Inspect';
  static readonly KUBE_TAB = 'Kube';

  constructor(page: Page, title: string) {
    super(page, title);
    this.applyChangesButton = this.tabContent.getByRole('button', { name: 'Apply changes to cluster' });
    this.revertChagesButton = this.tabContent.getByRole('button', { name: 'Revert Changes' });
    this.deleteButton = this.controlActions.getByRole('button', { name: 'Delete', exact: false });
  }

  async getState(): Promise<string> {
    const currentState = await this.header.getByRole('status').getAttribute('title');
    for (const state of Object.values(KubernetesResourceState)) {
      if (currentState === state) return state;
    }

    return KubernetesResourceState.Unknown;
  }
}
