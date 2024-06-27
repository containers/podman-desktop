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

import { afterEach } from 'node:test';

import type {
  CancellationToken,
  ImageFile,
  ImageFilesystemLayer,
  ImageFilesystemLayers,
  ImageInfo,
  ProviderResult,
} from '@podman-desktop/api';
import { beforeEach, expect, suite, test, vi } from 'vitest';

import type { ImageFilesExtensionInfo } from '/@api/image-files-info.js';

import type { ApiSenderType } from './api.js';
import { ImageFilesRegistry } from './image-files-registry.js';

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const extensionInfo: ImageFilesExtensionInfo = {
  id: 'ext-publisher.ext-name',
  label: 'my-label',
};

let imageFiles: ImageFilesRegistry;
suite('image files module', () => {
  beforeEach(() => {
    imageFiles = new ImageFilesRegistry(apiSender);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  suite('create ImageFiles', () => {
    test('creates ImageFiles instance', () => {
      const provider1 = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return { layers: [] };
        },
      };
      const provider2 = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return { layers: [] };
        },
      };
      const metadata1 = {
        label: 'Provider label',
      };
      imageFiles.create(extensionInfo, provider1, metadata1);
      imageFiles.create(extensionInfo, provider2);
      const providers = imageFiles.getImageFilesProviders();
      expect(providers.length).toBe(2);

      expect(providers[0].id).equals(`${extensionInfo.id}-0`);
      expect(providers[0].label).equals('Provider label');

      expect(providers[1].id).equals(`${extensionInfo.id}-1`);
      expect(providers[1].label).equals(extensionInfo.label);
    });

    test('Image files sends "image-files-provider-update" event when new provider is added', () => {
      const provider = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return { layers: [] };
        },
      };
      imageFiles.create(extensionInfo, provider);
      expect(apiSender.send).toBeCalledWith('image-files-provider-update', {
        id: `${extensionInfo.id}-0`,
      });
    });

    test('sends "image-files-provider-remove" event when provider is disposed', () => {
      const provider = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return { layers: [] };
        },
      };
      const dispo = imageFiles.create(extensionInfo, provider);
      dispo.dispose();
      expect(apiSender.send).toBeCalledWith('image-files-provider-remove', {
        id: `${extensionInfo.id}-0`,
      });
    });

    test('removes image files from the registry when disposed', () => {
      const provider1 = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return { layers: [] };
        },
      };
      const provider2 = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return { layers: [] };
        },
      };
      const metadata1 = {
        label: 'Provider label',
      };
      const dispo1 = imageFiles.create(extensionInfo, provider1, metadata1);
      imageFiles.create(extensionInfo, provider2);
      const providers = imageFiles.getImageFilesProviders();
      expect(providers.length).toBe(2);
      dispo1.dispose();
      const providersAfterDispose = imageFiles.getImageFilesProviders();
      expect(providersAfterDispose.length).toBe(1);
    });

    test('calls getFilesystemLayers method', async () => {
      const file: ImageFile = {
        path: 'bin',
        type: 'directory',
        mode: 0o755,
        uid: 1000,
        gid: 1000,
        size: 400,
        ctime: new Date(),
        atime: new Date(),
        mtime: new Date(),
      };
      const layer: ImageFilesystemLayer = {
        id: '123',
        files: [file],
        whiteouts: ['to-be-deleted'],
        opaqueWhiteouts: ['dir-to-be-deleted'],
      };
      const provider = {
        getFilesystemLayers: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageFilesystemLayers> => {
          return {
            layers: [layer],
          };
        },
      };
      imageFiles.create(extensionInfo, provider);
      const providers = imageFiles.getImageFilesProviders();
      expect(providers.length).toBe(1);
      const imageInfo: ImageInfo = {
        engineId: 'eng-id',
        engineName: 'eng-name',
        Id: 'id',
        ParentId: 'parent-id',
        RepoTags: undefined,
        Created: 0,
        Size: 1,
        VirtualSize: 1,
        SharedSize: 1,
        Labels: {},
        Containers: 1,
        Digest: 'sha256:id',
      };
      const result = await imageFiles.getFilesystemLayers(providers[0].id, imageInfo);
      console.log('result', result);
      expect(result).toBeDefined();
      expect(result!.layers.length).toBe(1);
      expect(result!.layers[0].files!.length).toBe(1);
      expect(result!.layers[0].files![0]).toEqual(file);
      expect(result!.layers[0].whiteouts!.length).toBe(1);
      expect(result!.layers[0].whiteouts![0]).toBe('to-be-deleted');
      expect(result!.layers[0].opaqueWhiteouts!.length).toBe(1);
      expect(result!.layers[0].opaqueWhiteouts![0]).toBe('dir-to-be-deleted');
    });

    test('check method throws an error if provider is unknown', async () => {
      const imageInfo: ImageInfo = {
        engineId: 'eng-id',
        engineName: 'eng-name',
        Id: 'id',
        ParentId: 'parent-id',
        RepoTags: undefined,
        Created: 0,
        Size: 1,
        VirtualSize: 1,
        SharedSize: 1,
        Labels: {},
        Containers: 1,
        Digest: 'sha256:id',
      };
      await expect(() => imageFiles.getFilesystemLayers('unknown-id', imageInfo)).rejects.toThrow(
        'provider not found with id unknown-id',
      );
    });
  });
});
