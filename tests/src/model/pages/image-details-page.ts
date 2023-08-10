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
import { BasePage } from './base-page';
import { RunImagePage } from './run-image-page';

export class ImageDetailsPage extends BasePage {
  readonly name: Locator;
  readonly imageName: string;
  readonly heading: Locator;
  readonly runImageButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly summaryTab: Locator;
  readonly historyTab: Locator;
  readonly inspectTab: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;

  constructor(page: Page, name: string) {
    super(page);
    this.name = page.getByLabel('name').and(page.getByText('Image Details'));
    this.imageName = name;
    this.heading = page.getByRole('heading', { name: this.imageName });
    this.runImageButton = page.getByRole('button', { name: 'Run Image' });
    this.deleteButton = page.getByRole('button', { name: 'Delete Image' });
    this.editButton = page.getByRole('button', { name: 'Edit Image' });
    this.summaryTab = page.getByText('Summary');
    this.historyTab = page.getByText('History');
    this.inspectTab = page.getByText('Inspect');
    this.closeLink = page.getByRole('link', { name: 'Close Details' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
  }

  async openRunImage(): Promise<RunImagePage> {
    await this.runImageButton.click();
    return new RunImagePage(this.page, this.imageName);
  }
}
