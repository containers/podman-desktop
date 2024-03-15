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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as extensionApi from '@podman-desktop/api';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { activate, stripImagePrefix } from './extension';

vi.mock('@podman-desktop/api', async () => {
  return {
    registry: {
      suggestRegistry: vi.fn(),
    },
  };
});

beforeAll(() => {});

beforeEach(() => {
  vi.clearAllMocks();
});

test('check remove prefix', async () => {
  const base64Content = stripImagePrefix('data:image/png;base64,content');
  expect(base64Content).toBe('content');
});

test('activate is registering 4 registries', async () => {
  const extensionContext = { subscriptions: [] } as unknown as extensionApi.ExtensionContext;

  await activate(extensionContext);

  // should be called 4 times
  expect(vi.mocked(extensionApi.registry.suggestRegistry)).toHaveBeenCalledTimes(4);

  // should be called with the right parameters
  expect(vi.mocked(extensionApi.registry.suggestRegistry)).toHaveBeenCalledWith({
    name: 'Docker Hub',
    url: 'docker.io',
    icon: '/src/images/docker.io.png',
  });

  // 4 subscriptions/disposables should be added
  expect(extensionContext.subscriptions.length).toBe(4);
});
