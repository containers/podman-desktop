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

import type { ImageInfo } from '@desktop-framework/extension-api';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { imageFilesProviders } from '/@/stores/image-files-providers';

import ImageDetailsFiles from './ImageDetailsFiles.svelte';

describe('ImageDetailsFiles component', () => {
  const imageGetFilesystemLayersMock = vi.fn();
  const cancelTokenMock = vi.fn();
  const getCancellableTokenSourceMock = vi.fn();
  const getConfigurationValueMock = vi.fn();

  beforeAll(() => {
    Object.defineProperty(window, 'imageGetFilesystemLayers', { value: imageGetFilesystemLayersMock });
    Object.defineProperty(window, 'cancelToken', { value: cancelTokenMock });
    Object.defineProperty(window, 'getCancellableTokenSource', { value: getCancellableTokenSourceMock });
    Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
  });

  beforeEach(() => {
    vi.resetAllMocks();
    imageFilesProviders.set([]);
  });

  describe('when ask fetching layers is false', () => {
    beforeEach(() => {
      getConfigurationValueMock.mockResolvedValue(false);
    });

    test.each([
      {
        name: 'imageGetFilesystemLayers is called if there is one provider',
        providers: [{ id: 'provider1', label: 'Provider 1' }],
        calledExpected: true,
      },
      {
        name: 'imageGetFilesystemLayers is not called if there is no provider',
        providers: [],
        calledExpected: false,
      },
      {
        name: 'imageGetFilesystemLayers is not called if there are two providers',
        providers: [
          { id: 'provider1', label: 'Provider 1' },
          { id: 'provider2', label: 'Provider 2' },
        ],
        calledExpected: false,
      },
    ])('$name', async ({ providers, calledExpected }) => {
      getCancellableTokenSourceMock.mockResolvedValue(101010);
      imageGetFilesystemLayersMock.mockResolvedValue({ layers: [] });
      const imageInfo: ImageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
        engineType: 'podman',
        Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
        ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
        RepoTags: ['quay.io/user/image-name:v0.0.1'],
        Created: 1701338214,
        Size: 34134140,
        VirtualSize: 34134140,
        SharedSize: 0,
        Labels: {},
        Containers: 0,
        Digest: '',
      };
      render(ImageDetailsFiles, {
        imageInfo,
      });
      imageFilesProviders.set(providers);
      await tick();
      await tick();
      if (calledExpected) {
        expect(imageGetFilesystemLayersMock).toHaveBeenCalled();
      } else {
        expect(imageGetFilesystemLayersMock).not.toHaveBeenCalled();
      }
    });

    test('token is canceled when component is unmounted', async () => {
      const TOKEN_ID = 101010;
      getCancellableTokenSourceMock.mockResolvedValue(TOKEN_ID);
      imageGetFilesystemLayersMock.mockResolvedValue({ layers: [] });
      const imageInfo: ImageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
        engineType: 'podman',
        Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
        ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
        RepoTags: ['quay.io/user/image-name:v0.0.1'],
        Created: 1701338214,
        Size: 34134140,
        VirtualSize: 34134140,
        SharedSize: 0,
        Labels: {},
        Containers: 0,
        Digest: '',
      };
      const component = render(ImageDetailsFiles, {
        imageInfo,
      });
      imageFilesProviders.set([{ id: 'provider1', label: 'Provider 1' }]);
      await tick();
      await tick();
      expect(imageGetFilesystemLayersMock).toHaveBeenCalledWith(expect.anything(), expect.anything(), TOKEN_ID);
      component.unmount();
      expect(cancelTokenMock).toHaveBeenCalledWith(TOKEN_ID);
    });

    test('error during imageGetFilesystemLayers', async () => {
      getCancellableTokenSourceMock.mockResolvedValue(101010);
      imageGetFilesystemLayersMock.mockRejectedValue(new Error('an error'));
      const imageInfo: ImageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
        engineType: 'podman',
        Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
        ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
        RepoTags: ['quay.io/user/image-name:v0.0.1'],
        Created: 1701338214,
        Size: 34134140,
        VirtualSize: 34134140,
        SharedSize: 0,
        Labels: {},
        Containers: 0,
        Digest: '',
      };
      render(ImageDetailsFiles, {
        imageInfo,
      });
      imageFilesProviders.set([{ id: 'provider1', label: 'Provider 1' }]);
      await waitFor(() => screen.getByText('Error: an error'));
    });
  });

  describe('when ask fetching layers is true', () => {
    beforeEach(() => {
      getConfigurationValueMock.mockResolvedValue(true);
    });

    test.each([
      {
        name: 'Fetch button is displayed if there is one provider',
        providers: [{ id: 'provider1', label: 'Provider 1' }],
        displayedExpected: true,
      },
      {
        name: 'Fetch button is not displayed if there is no provider',
        providers: [],
        displayedExpected: false,
      },
      {
        name: 'Fetch button is not displayed if there are two providers',
        providers: [
          { id: 'provider1', label: 'Provider 1' },
          { id: 'provider2', label: 'Provider 2' },
        ],
        displayedExpected: false,
      },
    ])('$name', async ({ providers, displayedExpected }) => {
      getCancellableTokenSourceMock.mockResolvedValue(101010);
      imageGetFilesystemLayersMock.mockResolvedValue({ layers: [] });
      const imageInfo: ImageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
        engineType: 'podman',
        Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
        ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
        RepoTags: ['quay.io/user/image-name:v0.0.1'],
        Created: 1701338214,
        Size: 34134140,
        VirtualSize: 34134140,
        SharedSize: 0,
        Labels: {},
        Containers: 0,
        Digest: '',
      };
      render(ImageDetailsFiles, {
        imageInfo,
      });
      imageFilesProviders.set(providers);
      await tick();
      await tick();
      const fetchButton = screen.queryByLabelText('fetch');
      if (displayedExpected) {
        expect(fetchButton).not.toBeNull();
      } else {
        expect(fetchButton).toBeNull();
      }
    });

    test('imageGetFilesystemLayers is called when the fetch button is clicked and button is hidden', async () => {
      getCancellableTokenSourceMock.mockResolvedValue(101010);
      imageGetFilesystemLayersMock.mockResolvedValue({ layers: [] });
      const imageInfo: ImageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
        engineType: 'podman',
        Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
        ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
        RepoTags: ['quay.io/user/image-name:v0.0.1'],
        Created: 1701338214,
        Size: 34134140,
        VirtualSize: 34134140,
        SharedSize: 0,
        Labels: {},
        Containers: 0,
        Digest: '',
      };
      render(ImageDetailsFiles, {
        imageInfo,
      });
      imageFilesProviders.set([{ id: 'provider1', label: 'Provider 1' }]);
      await vi.waitFor(() => screen.getByLabelText('fetch'));
      const fetchButton = screen.getByText('Fetch Layers');
      await userEvent.click(fetchButton);
      await waitFor(() => expect(imageGetFilesystemLayersMock).toHaveBeenCalled());
      await waitFor(() => expect(screen.queryByLabelText('fetch')).toBeNull());
    });
  });
});
