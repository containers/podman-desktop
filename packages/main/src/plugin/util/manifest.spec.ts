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
});
