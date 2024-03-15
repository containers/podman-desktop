/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
  Disposable,
  ImageCheckerProvider,
  ImageCheckerProviderMetadata,
  ImageChecks,
  ImageInfo,
} from '@podman-desktop/api';

import type { ApiSenderType } from './api.js';
import type { ImageCheckerExtensionInfo, ImageCheckerInfo } from './api/image-checker-info.js';

export interface ImageCheckerProviderWithMetadata {
  id: string;
  label: string;
  provider: ImageCheckerProvider;
}

export class ImageCheckerImpl {
  private _imageCheckerProviders: Map<string, ImageCheckerProviderWithMetadata> = new Map<
    string,
    ImageCheckerProviderWithMetadata
  >();

  constructor(private apiSender: ApiSenderType) {}

  registerImageCheckerProvider(
    extensionInfo: ImageCheckerExtensionInfo,
    provider: ImageCheckerProvider,
    metadata?: ImageCheckerProviderMetadata,
  ): Disposable {
    const label = metadata?.label ?? extensionInfo.label;
    const idBase = `${extensionInfo.id}-`;
    let id: string = '';
    for (let i = 0; ; i++) {
      const newId = idBase + i;
      if (!this._imageCheckerProviders.get(newId)) {
        id = newId;
        break;
      }
    }
    if (id === '') {
      throw new Error(`Unable to register an image checker for extension '${extensionInfo.id}'.`);
    }
    this._imageCheckerProviders.set(id, {
      id,
      label,
      provider,
    });
    this.apiSender.send('image-checker-provider-update', { id });
    return {
      dispose: (): void => {
        this._imageCheckerProviders.delete(id);
        this.apiSender.send('image-checker-provider-remove', { id });
      },
    };
  }

  getImageCheckerProviders(): ImageCheckerInfo[] {
    return Array.from(this._imageCheckerProviders.keys()).map(k => {
      const el = this._imageCheckerProviders.get(k)!;
      return {
        id: k,
        label: el.label,
      };
    });
  }

  async check(providerId: string, image: ImageInfo, token?: CancellationToken): Promise<ImageChecks | undefined> {
    const provider = this._imageCheckerProviders.get(providerId);
    if (provider === undefined) {
      throw new Error('provider not found with id ' + providerId);
    }
    return provider.provider.check(image, token);
  }
}
