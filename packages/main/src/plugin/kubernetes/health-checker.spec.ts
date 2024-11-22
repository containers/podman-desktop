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

import { AbortError, Health, KubeConfig } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { HealthChecker } from './health-checker.js';

vi.mock('@kubernetes/client-node');

beforeEach(() => {
  vi.mocked(Health).mockClear();
});

test('onReadiness is called with result of readyz if no error', async () => {
  const readyzMock = vi.fn();
  vi.mocked(Health).mockImplementation(
    () =>
      ({
        readyz: readyzMock,
      }) as unknown as Health,
  );

  const kc = new KubeConfig();
  const hc = new HealthChecker(kc);
  const readinessCB = vi.fn();
  hc.onReadiness(readinessCB);

  readyzMock.mockResolvedValue(true);
  await hc.checkReadiness();
  expect(readinessCB).toHaveBeenCalledWith(true);

  readyzMock.mockResolvedValue(false);
  await hc.checkReadiness();
  expect(readinessCB).toHaveBeenCalledWith(false);
});

test('onReadiness is not called when readyz is rejected with an abort error', async () => {
  const readyzMock = vi.fn();
  vi.mocked(Health).mockImplementation(
    () =>
      ({
        readyz: readyzMock,
      }) as unknown as Health,
  );

  const kc = new KubeConfig();
  const hc = new HealthChecker(kc);
  const readinessCB = vi.fn();
  hc.onReadiness(readinessCB);

  readyzMock.mockRejectedValue(new AbortError('a message'));
  await hc.checkReadiness();
  expect(readinessCB).not.toHaveBeenCalled();
});

test('onReadiness is called with false when readyz is rejected with a generic error', async () => {
  const readyzMock = vi.fn();
  vi.mocked(Health).mockImplementation(
    () =>
      ({
        readyz: readyzMock,
      }) as unknown as Health,
  );

  const kc = new KubeConfig();
  const hc = new HealthChecker(kc);
  const readinessCB = vi.fn();
  hc.onReadiness(readinessCB);

  readyzMock.mockRejectedValue(new Error('a generic error'));
  await hc.checkReadiness();
  expect(readinessCB).toHaveBeenCalledWith(false);
});
