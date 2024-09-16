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

import '@testing-library/jest-dom/vitest';

import type { ImageFile } from '@podman-desktop/api';
import { render, screen, within } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import type { FilesystemTree } from './filesystem-tree';
import type { ImageFilesystemLayerUI } from './imageDetailsFiles';
import { signedHumanSize } from './ImageDetailsFilesLayers';
import ImageDetailsFilesLayers from './ImageDetailsFilesLayers.svelte';

test('signedHumanSize', () => {
  expect(signedHumanSize(1000)).toEqual('+1 kB');
  expect(signedHumanSize(-1000)).toEqual('-1 kB');
});

test('render', async () => {
  const layers: ImageFilesystemLayerUI[] = [
    {
      id: 'layer1',
      createdBy: 'creator',
      sizeInArchive: 1000,
      sizeInContainer: 900,
      stackTree: {
        size: 2000,
      } as unknown as FilesystemTree<ImageFile>,
    } as unknown as ImageFilesystemLayerUI,
    {
      id: 'layer2',
      createdBy: 'creator',
      sizeInArchive: 0,
      sizeInContainer: -300,
      stackTree: {
        size: 1700,
      } as unknown as FilesystemTree<ImageFile>,
    } as unknown as ImageFilesystemLayerUI,
  ];
  render(ImageDetailsFilesLayers, { layers });
  const rows = screen.getAllByRole('row');
  expect(rows.length).toBe(2);
  within(rows[0]).getByText('layer1');
  within(rows[0]).getByText('on disk: 1 kB');
  within(rows[0]).getByText('contribute to FS: +900 B');
  within(rows[0]).getByText('total FS: 2 kB');
  within(rows[1]).getByText('layer2');
  within(rows[1]).getByText('on disk: 0 B');
  within(rows[1]).getByText('contribute to FS: -300 B');
  within(rows[1]).getByText('total FS: 1.7 kB');
});
