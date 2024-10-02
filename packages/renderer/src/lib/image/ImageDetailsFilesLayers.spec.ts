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

import { render, screen, within } from '@testing-library/svelte';
import { expect, test } from 'vitest';

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
      addedCount: 5,
      addedSize: 1000,
    } as unknown as ImageFilesystemLayerUI,
    {
      id: 'layer2',
      createdBy: 'creator',
      addedCount: 1,
      addedSize: 10,
      sizeInArchive: 0,
      modifiedCount: 1,
      modifiedSize: -5,
      removedCount: 2,
      removedSize: -7,
    } as unknown as ImageFilesystemLayerUI,
  ];
  render(ImageDetailsFilesLayers, { layers });
  const rows = screen.getAllByRole('row');
  expect(rows.length).toBe(2);
  within(rows[0]).getByText('1 kB • layer1');
  within(rows[0]).getByText('files: 5 added (+1 kB)');
  within(rows[1]).getByText('0 B • layer2');
  within(rows[1]).getByText('files: 1 added (+10 B) • 1 modified (-5 B) • 2 removed (-7 B)');
});
