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

import { beforeAll, expect, test, vi } from 'vitest';
import ImageDetailsFiles from './ImageDetailsFiles.svelte';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import { beforeEach } from 'node:test';
import { FileTree } from '../../../../main/src/plugin/file-tree';

const mocks = vi.hoisted(() => {
  return {
    getImageLayersMock: vi.fn(),
  };
});

beforeAll(() => {
  (window as any).getImageLayers = mocks.getImageLayersMock;
});

beforeEach(() => {
  vi.resetAllMocks();
});

vi.mock('../ui/TreeView.svelte');

test('when the image does not contain layers', async () => {
  mocks.getImageLayersMock.mockResolvedValue([]);
  render(ImageDetailsFiles, {
    image: {
      engineId: 'engine-1',
      id: 'image-id',
    } as ImageInfoUI,
  });
});

test('when the image contains layers', async () => {
  mocks.getImageLayersMock.mockResolvedValue([
    {
      id: 'layer1-id',
      history: 'history layer 1',
      tree: {
        size: 1000,
        root: new FileTree('dir1'),
      },
    },
    {
      id: 'layer2-id',
      history: 'history layer 2',
      tree: {
        size: 4 * 1000 * 1000,
        root: new FileTree('dir2'),
      },
    },
  ]);
  const result = render(ImageDetailsFiles, {
    image: {
      engineId: 'engine-1',
      id: 'image-id',
    } as ImageInfoUI,
  });
  await new Promise(resolve => setTimeout(resolve, 100));

  const layersDiv = screen.getByRole('list', { name: 'layers' });
  const layer1Btn = within(layersDiv).getByRole('row', { name: 'layer1-id' });
  const layer2Btn = within(layersDiv).getByRole('row', { name: 'layer2-id' });

  within(layer1Btn).getByText('layer1-id');
  within(layer1Btn).getByText('history layer 1');
  within(layer1Btn).getByText('1 kB');

  within(layer2Btn).getByText('layer2-id');
  within(layer2Btn).getByText('history layer 2');
  within(layer2Btn).getByText('4 MB');

  let currentRoot = result.component.$$.ctx[1];
  expect(currentRoot).toEqual(new FileTree('dir1'));

  // when click the 2nd layer, its tree is passed to the treeview
  await fireEvent.click(layer2Btn);
  currentRoot = result.component.$$.ctx[1];
  expect(currentRoot).toEqual(new FileTree('dir2'));
});
