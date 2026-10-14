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

import { existsSync, promises } from 'node:fs';
import path from 'node:path';

import { ExploreFeature } from '@desktop-framework/api';
import { IConfigurationNode } from '@desktop-framework/api/configuration';
import { app } from 'electron';
import { inject, injectable } from 'inversify';

import { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import { Context } from '/@/plugin/context/context.js';
import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { KubernetesClient } from '/@/plugin/kubernetes/kubernetes-client.js';
import { ProviderRegistry } from '/@/plugin/provider-registry.js';

import featuresJson from './explore-features.json' with { type: 'json' };

@injectable()
export class ExploreFeatures {
  static readonly MAIN_IMAGES_FOLDER = path.resolve(
    app.getAppPath(),
    'packages/main/src/assets/explore-features-images',
  );

  constructor(
    @inject(ContainerProviderRegistry)
    private containerProviderRegistry: ContainerProviderRegistry,
    @inject(ExtensionLoader)
    private extensionLoader: ExtensionLoader,
    @inject(ConfigurationRegistry)
    private configurationRegistry: ConfigurationRegistry,
    @inject(ProviderRegistry)
    private providerRegistry: ProviderRegistry,
    @inject(KubernetesClient)
    private kubernetesClient: KubernetesClient,
    @inject(Context)
    private context: Context,
  ) {}

  async downloadFeaturesList(): Promise<ExploreFeature[]> {
    const hiddenFeatures = this.configurationRegistry
      .getConfiguration('exploreFeatures')
      .get<string[]>('hiddenFeatures', []);

    (featuresJson.features as ExploreFeature[]).forEach(feature => {
      feature.show = !hiddenFeatures.includes(feature.id);
    });

    await this.updateShowRequirements();
    return featuresJson.features;
  }

  private async updateShowRequirements(): Promise<void> {
    const containerList = await this.containerProviderRegistry.listContainers();
    const installedExtensionList = (await this.extensionLoader.listExtensions()).filter(ext => ext.removable);
    const providerList = this.providerRegistry.getProviderInfos();
    const contextsStateList = this.kubernetesClient.getContextsGeneralState();

    this.context.setValue('containerListLength', containerList.length);
    this.context.setValue(
      'runningContainerConnections',
      providerList
        .map(provider => provider.containerConnections)
        .flat()
        .filter(providerContainerConnection => providerContainerConnection.status === 'started').length,
    );

    this.context.setValue(
      'kubernetesConnections',
      providerList.some(provider => provider.kubernetesConnections.length > 0),
    );
    this.context.setValue(
      'reachableContexts',
      contextsStateList.values().some(context => context.reachable),
    );
    this.context.setValue('installedExtensionsNumber', installedExtensionList.length);
    this.context.setValue(
      'isDockerCompatibilityEnabled',
      this.configurationRegistry.getConfiguration('dockerCompatibility').get<boolean>('enabled'),
    );
  }

  async closeFeatureCard(featureId: string): Promise<void> {
    const hiddenFeatures = this.configurationRegistry
      .getConfiguration('exploreFeatures')
      .get<string[]>('hiddenFeatures', []);
    if (!hiddenFeatures.includes(featureId)) {
      hiddenFeatures.push(featureId);
    }

    await this.configurationRegistry.updateConfigurationValue('exploreFeatures.hiddenFeatures', [...hiddenFeatures]);
  }

  async init(): Promise<void> {
    const exploreFeaturesConfiguration: IConfigurationNode = {
      id: 'exploreFeatures',
      title: 'Show explore features content',
      type: 'object',
      properties: {
        ['exploreFeatures.expanded']: {
          type: 'boolean',
          default: true,
          hidden: true,
        },
        ['exploreFeatures.hiddenFeatures']: {
          type: 'array',
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([exploreFeaturesConfiguration]);

    await this.updateShowRequirements();

    for (const feature of featuresJson.features as ExploreFeature[]) {
      const imageFile = path.resolve(ExploreFeatures.MAIN_IMAGES_FOLDER, `${feature.id}.png`);
      if (existsSync(imageFile)) {
        const fileImage = await promises.readFile(imageFile);
        feature.img = `data:image/png;base64,${fileImage.toString('base64')}`;
      }
    }
  }
}
