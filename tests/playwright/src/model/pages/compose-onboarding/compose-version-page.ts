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

import type { Locator, Page } from 'playwright';

import { ComposeOnboardingPage } from './compose-onboarding-page';

export class ComposeVersionPage extends ComposeOnboardingPage {
  readonly versionStatusMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.versionStatusMessage = this.mainPage.getByText(
      /Compose will be downloaded in the next step \(Version v[0-9.]+\). Want to download/,
      { exact: true },
    );
  }

  async getVersion(): Promise<string> {
    const versionInfoText = await this.versionStatusMessage.textContent();
    let composeVersion = '';

    const matches = versionInfoText?.match(/v\d+(\.\d+)+/);
    if (matches) {
      composeVersion = matches[0];
    }
    return composeVersion;
  }
}
