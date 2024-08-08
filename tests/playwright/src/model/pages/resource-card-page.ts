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

import { type Locator, type Page } from '@playwright/test';

import { BasePage } from './base-page';

export abstract class ResourceCardPage extends BasePage {
  readonly parent: Locator;
  readonly card: Locator;
  readonly providerSetup: Locator;
  readonly providerConnections: Locator;
  readonly markdownContent: Locator;
  readonly setupButton: Locator;

  constructor(page: Page, resourceName: string) {
    super(page);
    this.parent = this.page.getByRole('region', { name: 'content' });
    this.card = this.parent.getByRole('region', { name: resourceName, exact: true });
    this.providerSetup = this.card.getByRole('region', { name: 'Provider Setup', exact: true });
    this.providerConnections = this.card.getByRole('region', { name: 'Provider Connections', exact: true });
    this.markdownContent = this.providerConnections.getByLabel('markdown-content');
    this.setupButton = this.providerSetup.getByRole('button', { name: 'Setup' });
  }
}
