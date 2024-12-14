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

import type { ImageFilesystemLayer } from '@podman-desktop/api';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { imageFilesProviders } from '/@/stores/image-files-providers';

import { toImageFilesystemLayerUIs } from './imageDetailsFiles';
import ImageDetailsFiles from './ImageDetailsFiles.svelte';

describe('toImageFilesystemLayerUIs', () => {
  test('toImageFilesystemLayerUIs with only added files', () => {
    const input: ImageFilesystemLayer[] = [
      {
        id: 'layer1',
        files: [
          {
            path: 'A/B/C.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 100,
          },
          {
            path: 'A/B/D.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 50,
          },
        ],
      },
      {
        id: 'layer2',
        files: [
          {
            path: 'A/B/E.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 20,
          },
        ],
      },
    ];
    const result = toImageFilesystemLayerUIs(input);
    expect(result[0].sizeInArchive).toBe(150);
    expect(result[0].addedCount).toBe(2);
    expect(result[0].addedSize).toBe(150);
    expect(result[0].modifiedCount).toBe(0);
    expect(result[0].modifiedSize).toBe(0);
    expect(result[0].removedCount).toBe(0);
    expect(result[0].removedSize).toBe(0);
    expect(result[0].stackTree.size).toBe(150);
    expect(result[1].sizeInArchive).toBe(20);
    expect(result[1].addedCount).toBe(1);
    expect(result[1].addedSize).toBe(20);
    expect(result[1].modifiedCount).toBe(0);
    expect(result[1].modifiedSize).toBe(0);
    expect(result[1].removedCount).toBe(0);
    expect(result[1].removedSize).toBe(0);
    expect(result[1].stackTree.size).toBe(170);
  });

  test('toImageFilesystemLayerUIs with a modified file', () => {
    const input: ImageFilesystemLayer[] = [
      {
        id: 'layer1',
        files: [
          {
            path: 'A/B/C.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 100,
          },
          {
            path: 'A/B/D.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 50,
          },
        ],
      },
      {
        id: 'layer2',
        files: [
          {
            path: 'A/B/D.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 42,
          },
        ],
      },
    ];
    const result = toImageFilesystemLayerUIs(input);
    expect(result[0].sizeInArchive).toBe(150);
    expect(result[0].addedCount).toBe(2);
    expect(result[0].addedSize).toBe(150);
    expect(result[0].modifiedCount).toBe(0);
    expect(result[0].modifiedSize).toBe(0);
    expect(result[0].removedCount).toBe(0);
    expect(result[0].removedSize).toBe(0);
    expect(result[0].stackTree.size).toBe(150);
    expect(result[1].sizeInArchive).toBe(42);
    expect(result[1].addedCount).toBe(0);
    expect(result[1].addedSize).toBe(0);
    expect(result[1].modifiedCount).toBe(1);
    expect(result[1].modifiedSize).toBe(-8);
    expect(result[1].removedCount).toBe(0);
    expect(result[1].removedSize).toBe(0);
    expect(result[1].stackTree.size).toBe(142);
  });

  test('toImageFilesystemLayerUIs with an file', () => {
    const input: ImageFilesystemLayer[] = [
      {
        id: 'layer1',
        files: [
          {
            path: 'A/B/C.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 100,
          },
          {
            path: 'A/B/D.txt',
            type: 'file',
            mode: 0o644,
            uid: 1,
            gid: 1,
            ctime: new Date(),
            atime: new Date(),
            mtime: new Date(),
            size: 50,
          },
        ],
      },
      {
        id: 'layer2',
        whiteouts: ['A/B/D.txt'],
      },
    ];
    const result = toImageFilesystemLayerUIs(input);
    expect(result[0].sizeInArchive).toBe(150);
    expect(result[0].addedCount).toBe(2);
    expect(result[0].addedSize).toBe(150);
    expect(result[0].modifiedCount).toBe(0);
    expect(result[0].modifiedSize).toBe(0);
    expect(result[0].removedCount).toBe(0);
    expect(result[0].removedSize).toBe(0);
    expect(result[0].stackTree.size).toBe(150);
    expect(result[1].sizeInArchive).toBe(0);
    expect(result[1].addedCount).toBe(0);
    expect(result[1].addedSize).toBe(0);
    expect(result[1].modifiedCount).toBe(0);
    expect(result[1].modifiedSize).toBe(0);
    expect(result[1].removedCount).toBe(1);
    expect(result[1].removedSize).toBe(-50);
    expect(result[1].stackTree.size).toBe(100);
  });
});

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
      const imageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
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
      const imageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
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
      const imageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
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
      const imageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
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
      const imageInfo = {
        engineId: 'podman.Podman',
        engineName: 'Podman',
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
