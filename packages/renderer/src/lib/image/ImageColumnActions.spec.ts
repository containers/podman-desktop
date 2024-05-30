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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ImageColumnActions from './ImageColumnActions.svelte';
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
  icon: undefined,
  badges: [],
};

test('No actions shown for manifest images', async () => {
  const manifestImage: ImageInfoUI = { ...image, isManifest: true };

  render(ImageColumnActions, { object: manifestImage });

  // Check for the absence of action buttons
  expect(screen.queryByText('Push Image')).not.toBeInTheDocument();
  expect(screen.queryByText('Rename Image')).not.toBeInTheDocument();
});
