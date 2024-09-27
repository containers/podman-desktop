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

import { PlayYamlRuntime } from '../core/operations';
import type { PlayKubernetesOptions } from '../core/types';
import { BasePage } from './base-page';
import { PodsPage } from './pods-page';

export class PlayKubeYamlPage extends BasePage {
  readonly heading: Locator;
  readonly yamlPathInput: Locator;
  readonly playButton: Locator;
  readonly doneButton: Locator;
  readonly podmanRuntimeButton: Locator;
  readonly kubernetesRuntimeButton: Locator;
  readonly kubernetesContext: Locator;
  readonly kubernetesNamespaces: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create pods from a Kubernetes YAML file' });
    this.yamlPathInput = page.getByPlaceholder('Select a .yaml file to play');
    this.podmanRuntimeButton = page.getByRole('button', { name: 'Podman Container Engine Runtime' });
    this.kubernetesRuntimeButton = page.getByRole('button', { name: 'Kubernetes Cluster Runtime', exact: true });
    this.kubernetesContext = this.kubernetesRuntimeButton.getByLabel('Default Kubernetes Context');
    this.kubernetesNamespaces = this.kubernetesRuntimeButton.getByRole('combobox', {
      name: 'Kubernetes Namespace',
      exact: true,
    });
    this.playButton = page.getByRole('button', { name: 'Play' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
  }

  async playYaml(
    pathToYaml: string,
    { runtime, kubernetesContext, kubernetesNamespace }: PlayKubernetesOptions = {
      kubernetesContext: 'kind-kind-cluster',
    },
  ): Promise<PodsPage> {
    if (!pathToYaml) {
      throw Error(`Path to Yaml file is incorrect or not provided!`);
    }

    // TODO: evaluate() is required due to noninteractivity of fields currently, once https://github.com/containers/podman-desktop/issues/5479 is done they will no longer be needed
    await this.yamlPathInput.evaluate(node => node.removeAttribute('readonly'));
    await this.playButton.evaluate(node => node.removeAttribute('disabled'));

    switch (runtime) {
      case PlayYamlRuntime.Kubernetes:
        await playExpect(this.kubernetesRuntimeButton).toBeEnabled();
        await this.kubernetesRuntimeButton.locator('..').click();
        await playExpect(this.kubernetesRuntimeButton).toHaveAttribute('aria-pressed', 'true');

        await playExpect(this.kubernetesContext).toBeVisible();
        await playExpect(this.kubernetesContext).toHaveValue(kubernetesContext);

        if (kubernetesNamespace) {
          await playExpect(this.kubernetesNamespaces).toBeVisible();
          const namespaceOptions = await this.kubernetesNamespaces.locator('option').allInnerTexts();
          if (namespaceOptions.includes(kubernetesNamespace)) {
            await this.kubernetesNamespaces.selectOption({ value: kubernetesNamespace });
            await playExpect(this.kubernetesNamespaces).toHaveValue(kubernetesNamespace);
          } else {
            throw new Error(`Kubernetes namespace: ${kubernetesNamespace} doesn't exist`);
          }
        }
        break;
      default:
        await playExpect(this.podmanRuntimeButton).toBeVisible();
        await playExpect(this.podmanRuntimeButton).toHaveAttribute('aria-pressed', 'true');
        break;
    }

    await this.yamlPathInput.fill(pathToYaml);
    await this.playButton.click();
    await playExpect(this.doneButton).toBeEnabled({ timeout: 120000 });
    await this.doneButton.click();
    return new PodsPage(this.page);
  }
}
