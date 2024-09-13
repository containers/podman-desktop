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

import type { KubernetesResources } from '../core/types';
import { KubernetesResourcePage } from './kubernetes-resource-page';

export class KubernetesBar {
  readonly page: Page;
  readonly kubernetesNavBar: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.kubernetesNavBar = page.getByRole('navigation', { name: 'Kubernetes Navigation Bar' });
    this.title = this.kubernetesNavBar.getByText('Kubernetes');
  }

  public async openTabPage(kubernetesResource: KubernetesResources): Promise<KubernetesResourcePage> {
    const resource = this.kubernetesNavBar.getByRole('link', { name: kubernetesResource });
    await resource.click();
    return new KubernetesResourcePage(this.page, kubernetesResource);
  }

  public getSettingsNavBarTabLocator(name: string): Locator {
    return this.kubernetesNavBar.getByLabel(name);
  }
}
