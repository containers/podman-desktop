/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { StatusBar } from '/@/model/workbench/status-bar';

export class HelpMenuComponent {
  readonly helpButton: Locator;
  readonly menu: Locator;
  readonly externalLinkDialog: Locator;
  readonly feedbackDialog: Locator;

  constructor(page: Page) {
    this.helpButton = new StatusBar(page).helpButton;
    this.menu = page.getByTestId('help-menu');
    this.externalLinkDialog = page.getByRole('dialog', { name: 'Open External Link?', exact: true });
    this.feedbackDialog = page.getByRole('dialog', { name: 'Share your feedback' });
  }

  getItems(): Locator {
    return this.menu.locator('[role="none"]');
  }

  getItem(index: number): Locator {
    return this.getItems().nth(index);
  }

  getItemTooltip(index: number, tooltip: string): Locator {
    return this.getItem(index).getByTitle(tooltip, { exact: true });
  }

  getItemIcon(index: number): Locator {
    return this.getItem(index).locator('[role="img"]');
  }

  getExternalLinkOpenButton(): Locator {
    return this.externalLinkDialog.getByRole('button', { name: 'Open', exact: true });
  }
}
