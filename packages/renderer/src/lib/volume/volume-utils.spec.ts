/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type { VolumeInfo } from '../../../../main/src/plugin/api/volume-info';
import { VolumeUtils } from './volume-utils';

let volumeUtils: VolumeUtils;

beforeEach(() => {
  vi.clearAllMocks();
  volumeUtils = new VolumeUtils();
});

test('should expect valid size', async () => {
  const volumeInfo = { UsageData: { Size: 1000, RefCount: 1 } } as VolumeInfo;
  const size = volumeUtils.getSize(volumeInfo);
  expect(size).toBe('1 kB');
});

test('should expect valid size if missing', async () => {
  const volumeInfo = {} as VolumeInfo;
  const size = volumeUtils.getSize(volumeInfo);
  expect(size).toBe('0 B');
});
