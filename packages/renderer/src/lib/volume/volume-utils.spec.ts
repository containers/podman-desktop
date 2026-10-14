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

import type { VolumeInfo } from '@desktop-framework/api';
import { beforeEach, expect, test, vi } from 'vitest';

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

test('Should leave labels and options undefined when the volume carries none', async () => {
  const volumeInfo = { Name: 'my-volume' } as VolumeInfo;
  const volumeInfoUI = volumeUtils.toVolumeInfoUI(volumeInfo);
  expect(volumeInfoUI.labels).toBeUndefined();
  expect(volumeInfoUI.options).toBeUndefined();
});

test('Should report options as undefined when the volume carries null options', async () => {
  const volumeInfo = { Name: 'my-volume', Options: null } as unknown as VolumeInfo;
  const volumeInfoUI = volumeUtils.toVolumeInfoUI(volumeInfo);
  expect(volumeInfoUI.options).toBeUndefined();
});

test('Should expose labels and options when the volume carries them', async () => {
  const volumeInfo = {
    Name: 'my-volume',
    Labels: { label1: 'value1' },
    Options: { option1: 'value1' },
  } as unknown as VolumeInfo;
  const volumeInfoUI = volumeUtils.toVolumeInfoUI(volumeInfo);
  expect(volumeInfoUI.labels).toEqual({ label1: 'value1' });
  expect(volumeInfoUI.options).toEqual({ option1: 'value1' });
});
