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

import { beforeEach, test, expect, vi, suite } from 'vitest';
import type { ApiSenderType } from './api.js';
import { afterEach } from 'node:test';
import type { CancellationToken, ImageChecks, ImageInfo, ProviderResult } from '@podman-desktop/api';
import { ImageCheckerImpl } from './image-checker.js';
import type { ImageCheckerExtensionInfo } from './api/image-checker-info.js';

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const extensionInfo: ImageCheckerExtensionInfo = {
  id: 'ext-publisher.ext-name',
  label: 'my-label',
};

let imageChecker: ImageCheckerImpl;
suite('image checker module', () => {
  beforeEach(() => {
    imageChecker = new ImageCheckerImpl(apiSender);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  suite('create ImageChecker', () => {
    test('creates Imagechecker instance', () => {
      const provider1 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const provider2 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const metadata1 = {
        label: 'Provider label',
      };
      imageChecker.registerImageCheckerProvider(extensionInfo, provider1, metadata1);
      imageChecker.registerImageCheckerProvider(extensionInfo, provider2);
      const providers = imageChecker.getImageCheckerProviders();
      expect(providers.length).toBe(2);

      expect(providers[0].id).equals(`${extensionInfo.id}-0`);
      expect(providers[0].label).equals('Provider label');

      expect(providers[1].id).equals(`${extensionInfo.id}-1`);
      expect(providers[1].label).equals(extensionInfo.label);
    });

    test('Image checker sends "image-checker-provider-update" event when new provider is added', () => {
      const provider = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      imageChecker.registerImageCheckerProvider(extensionInfo, provider);
      expect(apiSender.send).toBeCalledWith('image-checker-provider-update', {
        id: `${extensionInfo.id}-0`,
      });
    });

    test('sends "image-checker-provider-remove" event when provider is disposed', () => {
      const provider = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const dispo = imageChecker.registerImageCheckerProvider(extensionInfo, provider);
      dispo.dispose();
      expect(apiSender.send).toBeCalledWith('image-checker-provider-remove', {
        id: `${extensionInfo.id}-0`,
      });
    });

    test('removes image checker from the registry when disposed', () => {
      const provider1 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const provider2 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const metadata1 = {
        label: 'Provider label',
      };
      const dispo1 = imageChecker.registerImageCheckerProvider(extensionInfo, provider1, metadata1);
      imageChecker.registerImageCheckerProvider(extensionInfo, provider2);
      const providers = imageChecker.getImageCheckerProviders();
      expect(providers.length).toBe(2);
      dispo1.dispose();
      const providersAfterDispose = imageChecker.getImageCheckerProviders();
      expect(providersAfterDispose.length).toBe(1);
    });

    test('calls check method', async () => {
      const provider = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return {
            checks: [
              {
                name: 'check1',
                status: 'failed',
              },
            ],
          };
        },
      };
      imageChecker.registerImageCheckerProvider(extensionInfo, provider);
      const providers = imageChecker.getImageCheckerProviders();
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
      };
      const result = await imageChecker.check(providers[0].id, imageInfo);
      expect(result).toBeDefined();
      expect(result!.checks.length).toBe(1);
      expect(result!.checks[0].name).toBe('check1');
      expect(result!.checks[0].status).toBe('failed');
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
      };
      await expect(() => imageChecker.check('unknown-id', imageInfo)).rejects.toThrow(
        'provider not found with id unknown-id',
      );
    });
  });
});
