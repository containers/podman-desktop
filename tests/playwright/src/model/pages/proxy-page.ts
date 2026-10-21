/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import { expect as playExpect, test } from '@playwright/test';

import { ProxyElementId, ProxyLabel, ProxyTypes } from '/@/model/core/types';
import { handleConfirmationDialog } from '/@/utility/operations';

import { SettingsPage } from './settings-page';

export class ProxyPage extends SettingsPage {
  readonly heading: Locator;
  readonly toggleProxyButton: Locator;
  readonly updateButton: Locator;
  readonly httpProxy: Locator;
  readonly httpsProxy: Locator;
  readonly noProxy: Locator;
  readonly proxyAlert: Locator;
  readonly proxyDialog: Locator;

  constructor(page: Page) {
    super(page, 'Proxy Settings');
    this.heading = page.getByRole('heading').and(page.getByText('Proxy Settings', { exact: true }));
    this.toggleProxyButton = this.content.getByRole('button').and(this.content.locator('#toggle-proxy'));
    this.updateButton = this.content.getByRole('button', { name: 'Update' });
    this.httpProxy = this.content.getByRole('textbox').and(this.content.locator('#httpProxy'));
    this.httpsProxy = this.content.getByRole('textbox').and(this.content.locator('#httpsProxy'));
    this.noProxy = this.content.getByRole('textbox').and(this.content.locator('#noProxy'));
    this.proxyAlert = this.content.getByRole('alert');
    this.proxyDialog = this.page.getByRole('dialog', { name: 'Proxy Settings' });
  }

  override async getTab(): Promise<Locator> {
    // The tab link text is 'Proxy', but the page region name is 'Proxy Settings'
    return this.page
      .getByRole('navigation', { name: 'PreferencesNavigation' })
      .getByRole('link', { name: 'Proxy', exact: true });
  }

  public async getProxyType(): Promise<ProxyTypes> {
    const selectionOption = (await this.toggleProxyButton.textContent())?.trim();
    switch (selectionOption) {
      case 'Disabled':
        return ProxyTypes.Disabled;
      case 'Manual':
        return ProxyTypes.Manual;
      case 'System':
        return ProxyTypes.System;
      default:
        throw new Error(`Unknown proxy type: ${selectionOption}`);
    }
  }

  public async selectProxy(proxyType: ProxyTypes): Promise<void> {
    if (proxyType !== (await this.getProxyType())) {
      await test.step(`Select ${proxyType} proxy type`, async () => {
        await playExpect(this.toggleProxyButton).toBeEnabled();
        await this.toggleProxyButton.click();
        const newProxySelection = this.content.getByRole('button', {
          name: proxyType,
          exact: true,
        });
        await playExpect(newProxySelection).toBeEnabled();
        await newProxySelection.click();
        await playExpect(newProxySelection).not.toBeVisible();
        await playExpect(this.toggleProxyButton).toHaveText(proxyType);
      });
    }
  }

  private async fillProxyInput(input: Locator, value: string): Promise<void> {
    const inputName = await input.evaluate(el => el.getAttribute('id'));
    await test.step(`Filling ${inputName} textbox`, async () => {
      await playExpect(input, `Proxy input field ${inputName} is not enabled`).toBeEnabled();
      await input.clear();
      await input.pressSequentially(value, { delay: 100 });
      await playExpect(input).toHaveValue(value);
    });
  }

  public async updateProxySettings(): Promise<void> {
    await playExpect(this.updateButton).toBeEnabled();
    // update proxy settings
    await this.updateButton.click();
    // dialog can be a warning or info, both has only OK button.
    // on windows podman machine might needs to be restarted
    await handleConfirmationDialog({ page: this.page, dialogTitle: 'Proxy Settings Updated', buttonName: 'Dismiss' });
  }

  public async fillHttpProxy(value: string): Promise<void> {
    await this.fillProxyInput(this.httpProxy, value);
  }

  public async fillHttpsProxy(value: string): Promise<void> {
    await this.fillProxyInput(this.httpsProxy, value);
  }

  public async fillNoProxy(value: string): Promise<void> {
    await this.fillProxyInput(this.noProxy, value);
  }

  /**
   * Checks if a proxy field shows the managed configuration indicator.
   * Uses the label's `for` attribute to locate the parent section in the DOM.
   */
  private async isFieldManaged(fieldId: string): Promise<boolean> {
    return test.step(`Check if ${fieldId} has Managed label`, async () => {
      try {
        const fieldSection = this.content.locator(`label[for="${fieldId}"]`).locator('..');
        const managedLabel = fieldSection.getByText(ProxyLabel.MANAGED, { exact: true });
        await managedLabel.waitFor({ state: 'visible', timeout: 5_000 });
        return true;
      } catch (err) {
        if ((err as Error).name === 'TimeoutError') {
          return false;
        }
        throw err;
      }
    });
  }

  public async isProxyConfigurationManaged(): Promise<boolean> {
    return this.isFieldManaged(ProxyElementId.TOGGLE_PROXY);
  }

  public async isHttpProxyManaged(): Promise<boolean> {
    return this.isFieldManaged(ProxyElementId.HTTP_PROXY);
  }

  public async isHttpsProxyManaged(): Promise<boolean> {
    return this.isFieldManaged(ProxyElementId.HTTPS_PROXY);
  }

  public async isNoProxyManaged(): Promise<boolean> {
    return this.isFieldManaged(ProxyElementId.NO_PROXY);
  }
}
