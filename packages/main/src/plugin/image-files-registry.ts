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

import type {
  CancellationToken,
  ImageFilesCallbacks,
  ImageFilesProvider,
  ImageFilesProviderMetadata,
  ImageFilesystemLayers,
  ImageInfo,
} from '@podman-desktop/api';

import type { ImageFilesExtensionInfo, ImageFilesInfo } from '/@api/image-files-info.js';

import type { ApiSenderType } from './api.js';
import { ImageFilesImpl } from './image-files-impl.js';

export interface ImageFilesProviderWithMetadata {
  id: string;
  label: string;
  provider: ImageFilesCallbacks;
}

export class ImageFilesRegistry {
  private _imageFilesProviders: Map<string, ImageFilesProviderWithMetadata> = new Map<
    string,
    ImageFilesProviderWithMetadata
  >();

  constructor(private apiSender: ApiSenderType) {}

  create(
    extensionInfo: ImageFilesExtensionInfo,
    provider: ImageFilesCallbacks,
    metadata?: ImageFilesProviderMetadata,
  ): ImageFilesProvider {
    const label = metadata?.label ?? extensionInfo.label;
    const idBase = `${extensionInfo.id}-`;
    let id: string = '';
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
    this.apiSender.send('image-files-provider-update', { id });
    return new ImageFilesImpl(id, this);
  }

  disposeImageFiles(provider: ImageFilesImpl): void {
    this._imageFilesProviders.delete(provider.id);
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
  ): Promise<ImageFilesystemLayers | undefined> {
    const provider = this._imageFilesProviders.get(providerId);
    if (provider === undefined) {
      throw new Error('provider not found with id ' + providerId);
    }
    return provider.provider.getFilesystemLayers(image, token);
  }
}
