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

import '@testing-library/jest-dom/vitest';

import type { ManifestInspectInfo } from '@podman-desktop/api';
import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import ImageIcon from '../images/ImageIcon.svelte';
import ImageDetailsSummary from './ImageDetailsSummary.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

const image: ImageInfoUI = {
  id: 'my-image',
  shortId: 'short-id',
  name: 'my-image-name',
  engineId: 'podman',
  engineName: '',
  tag: 'latest-tag',
  createdAt: 0,
  age: '',
  size: 0,
  humanSize: '',
  base64RepoTag: 'repoTag',
  selected: false,
  status: 'UNUSED',
  icon: ImageIcon,
  badges: [],
};

const inspectManifest: ManifestInspectInfo = {
  engineId: 'podman',
  engineName: '',
  mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
  schemaVersion: 2,
  manifests: [
    {
      digest: 'sha256:123456',
      mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
      size: 1234,
      platform: {
        architecture: 'amd64',
        os: 'linux',
      },
    },
    {
      digest: 'sha256:654321',
      mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
      size: 4321,
      platform: {
        architecture: 'arm64',
        os: 'linux',
      },
    },
  ],
};

beforeAll(() => {
  (window as any).inspectManifest = vi.fn().mockResolvedValue(inspectManifest);
});

test('Expect render ImageDetailsSummary', async () => {
  render(ImageDetailsSummary, { image: image });

  const text = screen.getByText(image.name);
  expect(text).toBeInTheDocument();
});

test('if ImageInfoUI isManifest is true, expect window.inspectManifest to be called', async () => {
  const imageWithManifest: ImageInfoUI = {
    ...image,
    isManifest: true,
  };

  render(ImageDetailsSummary, { image: imageWithManifest });

  // Expect window.inspectManifest to be called
  expect((window as any).inspectManifest).toHaveBeenCalled();

  // Expect the manifest digest to be displayed

  // wait for the digest to be displayed
  await waitFor(async () => {
    const digest = screen.getByText('123456');
    expect(digest).toBeInTheDocument();
  });

  // Expect manifest inspect details to be shown
  expect(screen.getByText('123456')).toBeInTheDocument();
  expect(screen.getByText('amd64')).toBeInTheDocument();
  expect(screen.queryAllByText('linux')).toHaveLength(2);
});
