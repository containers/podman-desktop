/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { ImageFilesExtensionInfo, ImageFilesInfo, ImageFilesystemLayersUI } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type {
  CancellationToken,
  ImageFilesCallbacks,
  ImageFilesProvider,
  ImageFilesProviderMetadata,
  ImageInfo,
} from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import { Context } from './context/context.js';
import { toImageFilesystemLayerUIs } from './image-details-files.js';
import { ImageFilesImpl } from './image-files-impl.js';

export interface ImageFilesProviderWithMetadata {
  id: string;
  label: string;
  provider: ImageFilesCallbacks;
}

@injectable()
export class ImageFilesRegistry {
  private _imageFilesProviders: Map<string, ImageFilesProviderWithMetadata> = new Map<
    string,
    ImageFilesProviderWithMetadata
  >();

  constructor(
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(Context)
    private context: Context,
  ) {
    this.context.setValue('imageFiles.hasProvider', false);
    const imagesFilesConfiguration: IConfigurationNode = {
      id: 'preferences.userConfirmation',
      title: 'Image Files',
      type: 'object',
      properties: {
        ['userConfirmation.fetchImageFiles']: {
          description: 'Ask before fetching image layers when entering the Files tab',
          type: 'boolean',
          default: true,
          when: 'imageFiles.hasProvider',
        },
      },
    };
    this.configurationRegistry.registerConfigurations([imagesFilesConfiguration]);
  }

  create(
    extensionInfo: ImageFilesExtensionInfo,
    provider: ImageFilesCallbacks,
    metadata?: ImageFilesProviderMetadata,
  ): ImageFilesProvider {
    const label = metadata?.label ?? extensionInfo.label;
    const idBase = `${extensionInfo.id}-`;
    let id: string;
    for (let i = 0; ; i++) {
      const newId = idBase + i;
      if (!this._imageFilesProviders.get(newId)) {
        id = newId;
        break;
      }
    }
    if (id === '') {
      throw new Error(`Unable to register an image files for extension '${extensionInfo.id}'.`);
    }
    this._imageFilesProviders.set(id, {
      id,
      label,
      provider,
    });
    this.context.setValue('imageFiles.hasProvider', true);
    this.apiSender.send('image-files-provider-update', { id });
    return new ImageFilesImpl(id, this);
  }

  disposeImageFiles(provider: ImageFilesImpl): void {
    this._imageFilesProviders.delete(provider.id);
    this.context.setValue('imageFiles.hasProvider', this._imageFilesProviders.values.length > 0);
    this.apiSender.send('image-files-provider-remove', { id: provider.id });
  }

  getImageFilesProviders(): ImageFilesInfo[] {
    return Array.from(this._imageFilesProviders.keys()).map(k => {
      const el = this._imageFilesProviders.get(k)!;
      return {
        id: k,
        label: el.label,
      };
    });
  }

  async getFilesystemLayers(
    providerId: string,
    image: ImageInfo,
    token?: CancellationToken,
  ): Promise<ImageFilesystemLayersUI | undefined> {
    const provider = this._imageFilesProviders.get(providerId);
    if (provider === undefined) {
      throw new Error('provider not found with id ' + providerId);
    }
    const fsLayers = await provider.provider.getFilesystemLayers(image, token);
    if (!fsLayers) {
      return;
    }
    return {
      layers: toImageFilesystemLayerUIs(fsLayers.layers),
    };
  }
}
