/**********************************************************************
 *
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

import { describe, expect, test } from 'vitest';

import type { ImageInfo } from '../api/image-info.js';
import { guessIsManifest } from './manifest.js';

describe('guessIsManifest function', () => {
  test('correctly identifies a manifest image', () => {
    const manifestImage: ImageInfo = {
      Id: 'manifestImage',
      Labels: {},
      engineId: 'engine1',
      engineName: 'podman',
      ParentId: '',
      RepoTags: ['manifestTag'],
      RepoDigests: ['manifestDigest'],
      Created: 0,
      Size: 0,
      VirtualSize: 40 * 1024, // 40KB (less than 50KB threshold)
      SharedSize: 0,
      Containers: 0,
    };

    expect(guessIsManifest(manifestImage)).toBe(true);
  });

  test('returns false if VirtualSize is over 1MB', () => {
    const largeImage: ImageInfo = {
      Id: 'largeImage',
      Labels: {},
      engineId: 'engine2',
      engineName: 'podman',
      ParentId: '',
      RepoTags: ['largeImageTag'],
      RepoDigests: ['largeImageDigest'],
      Created: 0,
      Size: 0,
      VirtualSize: 2000000, // 2MB
      SharedSize: 0,
      Containers: 0,
    };

    expect(guessIsManifest(largeImage)).toBe(false);
  });

  test('returns false if Labels is not empty', () => {
    const labeledImage: ImageInfo = {
      Id: 'labeledImage',
      Labels: { key: 'value' },
      engineId: 'engine3',
      engineName: 'podman',
      ParentId: '',
      RepoTags: ['labeledImageTag'],
      RepoDigests: ['labeledImageDigest'],
      Created: 0,
      Size: 0,
      VirtualSize: 500000, // 500KB
      SharedSize: 0,
      Containers: 0,
    };

    expect(guessIsManifest(labeledImage)).toBe(false);
  });

  test('returns false if RepoTags is undefined or empty', () => {
    const noTagImage: ImageInfo = {
      Id: 'noTagImage',
      Labels: {},
      engineId: 'engine4',
      engineName: 'podman',
      ParentId: '',
      RepoTags: [],
      RepoDigests: ['noTagImageDigest'],
      Created: 0,
      Size: 0,
      VirtualSize: 500000, // 500KB
      SharedSize: 0,
      Containers: 0,
    };

    expect(guessIsManifest(noTagImage)).toBe(false);
  });

  test('returns false if RepoDigests is undefined or empty', () => {
    const noDigestImage: ImageInfo = {
      Id: 'noDigestImage',
      Labels: {},
      engineId: 'engine5',
      engineName: 'podman',
      ParentId: '',
      RepoTags: ['noDigestImageTag'],
      RepoDigests: [],
      Created: 0,
      Size: 0,
      VirtualSize: 500000, // 500KB
      SharedSize: 0,
      Containers: 0,
    };

    expect(guessIsManifest(noDigestImage)).toBe(false);
  });

  test('return false for a typical helloworld image example, that may be small enough to trigger guessIsManifest as true', () => {
    const helloWorldImage: ImageInfo = {
      Id: 'ee301c921b8aadc002973b2e0c3da17d701dcd994b606769a7e6eaa100b81d44',
      Labels: {},
      engineId: 'engine5', // Assuming 'engineId' and 'engineName' are part of your ImageInfo but not relevant here
      engineName: 'podman',
      ParentId: '',
      RepoTags: ['testdomain.io/library/hello:latest'],
      RepoDigests: [
        'testdomain.io/library/hello@sha256:2d4e459f4ecb5329407ae3e47cbc107a2fbace221354ca75960af4c047b3cb13',
        'testdomain.io/library/hello@sha256:53641cd209a4fecfc68e21a99871ce8c6920b2e7502df0a20671c6fccc73a7c6',
      ],
      Created: 1683046167,
      Size: 23301,
      VirtualSize: 23301, // Directly matches Size in this case
      SharedSize: 0,
      Containers: 0,
      History: ['testdomain.io/library/hello:latest'],
    };

    // Should be false
    expect(guessIsManifest(helloWorldImage)).toBe(false);
  });
});
