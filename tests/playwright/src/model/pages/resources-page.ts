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

import type { Locator, Page } from 'playwright';

import { SettingsPage } from './settings-page';

export class ResourcesPage extends SettingsPage {
  readonly heading: Locator;
  readonly featuredProviderResources: Locator;
  readonly podmanResources: Locator;
  readonly composeResources: Locator;
  readonly kindResources: Locator;

  constructor(page: Page) {
    super(page, 'Resources');
    this.heading = this.header.getByRole('heading', { name: 'Title' }).and(this.header.getByText('Resources'));
    this.featuredProviderResources = this.content.getByRole('region', { name: 'Featured Provider Resources' });
    this.podmanResources = this.featuredProviderResources.getByRole('region', { name: 'podman', exact: true });
    this.composeResources = this.featuredProviderResources.getByRole('region', { name: 'Compose', exact: true });
    this.kindResources = this.featuredProviderResources.getByRole('region', { name: 'kind', exact: true });
  }
}
