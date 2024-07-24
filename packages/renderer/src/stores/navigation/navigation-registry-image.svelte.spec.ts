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

import { beforeEach, expect, test, vi } from 'vitest';

import type { ImageInfo } from '/@api/image-info';

import { imagesInfos } from '../images';
import { createNavigationImageEntry } from './navigation-registry-image.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

test('createNavigationImageEntry', async () => {
  const entry = createNavigationImageEntry();
  imagesInfos.set([
    {
      Id: '1234',
      Size: 0,
    } as unknown as ImageInfo,
    {
      Id: '3456',
      Size: 0,
    } as unknown as ImageInfo,
  ]);

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Images');
  expect(entry.link).toBe('/images');
  expect(entry.tooltip).toBe('Images');
  await vi.waitFor(() => {
    expect(entry.counter).toBe(2);
  });
});
