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

import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { ImageRegistry } from './image-registry';
import type { Telemetry } from './telemetry/telemetry';

let imageRegistry;

beforeAll(() => {
  const telemetry: Telemetry = {} as Telemetry;
  imageRegistry = new ImageRegistry({}, telemetry);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should extract auth registry with gitlab', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Bearer realm="https://gitlab.com/jwt/auth",service="container_registry"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('https://gitlab.com/jwt/auth');
  expect(authInfo?.service).toBe('container_registry');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with docker', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Bearer realm="https://auth.docker.io/token",service="registry.docker.io"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('https://auth.docker.io/token');
  expect(authInfo?.service).toBe('registry.docker.io');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with quay', async () => {
  const authInfo = imageRegistry.extractAuthData('Bearer realm="https://quay.io/v2/auth",service="quay.io"');
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('https://quay.io/v2/auth');
  expect(authInfo?.service).toBe('quay.io');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with github registry', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Bearer realm="https://ghcr.io/token",service="ghcr.io",scope="repository:user/image:pull"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('https://ghcr.io/token');
  expect(authInfo?.service).toBe('ghcr.io');
  expect(authInfo?.scope).toBe('repository:user/image:pull');
});
