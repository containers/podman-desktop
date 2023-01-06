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

import { describe, beforeEach, expect, test, vi } from 'vitest';
import { ImageUtils } from './image-utils';

let imageUtils: ImageUtils;

beforeEach(() => {
  vi.clearAllMocks();
  imageUtils = new ImageUtils();
});

test('should expect valid size', async () => {
  const size = imageUtils.getHumanSize(1000);
  expect(size).toBe('1 kB');
});

describe.each([
  { repoTag: 'nginx:latest', expectedName: 'nginx', expectedTag: 'latest' },
  { repoTag: 'quay.io/podman/hello:latest', expectedName: 'quay.io/podman/hello', expectedTag: 'latest' },
  {
    repoTag: 'my.registry:1234/podman/hello:latest',
    expectedName: 'my.registry:1234/podman/hello',
    expectedTag: 'latest',
  },
  {
    repoTag: 'my.registry:1234/podman/hello:my-custom-tag',
    expectedName: 'my.registry:1234/podman/hello',
    expectedTag: 'my-custom-tag',
  },
])('describe object add($a, $b)', ({ repoTag, expectedName, expectedTag }) => {
  test(`should parse correctly image ${repoTag}`, () => {
    expect(imageUtils.getName(repoTag)).toBe(expectedName);
    expect(imageUtils.getTag(repoTag)).toBe(expectedTag);
  });
});
