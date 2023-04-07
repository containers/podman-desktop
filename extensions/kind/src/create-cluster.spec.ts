/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import type { Mock } from 'vitest';
import { createCluster, getKindClusterConfig } from './create-cluster';
import { runCliCommand } from './util';
import type { TelemetryLogger } from '@podman-desktop/api';

vi.mock('@podman-desktop/api', async () => {
  return {
    Logger: {},
  };
});

vi.mock('./util', async () => {
  return {
    runCliCommand: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const telemetryLogUsageMock = vi.fn();
const telemetryLogErrorMock = vi.fn();
const telemetryLoggerMock = {
  logUsage: telemetryLogUsageMock,
  logError: telemetryLogErrorMock,
} as unknown as TelemetryLogger;

test('expect error is cli returns non zero exit code', async () => {
  try {
    (runCliCommand as Mock).mockReturnValue({ exitCode: -1, error: 'error' });
    await createCluster({}, undefined, '', telemetryLoggerMock);
  } catch (err) {
    expect(err).to.be.a('Error');
    expect(err.message).equal('Failed to create kind cluster. error');
    expect(telemetryLogErrorMock).toBeCalledWith('createCluster', expect.objectContaining({ error: 'error' }));
  }
});

test('expect cluster to be created', async () => {
  (runCliCommand as Mock).mockReturnValue({ exitCode: 0 });
  await createCluster({}, undefined, '', telemetryLoggerMock);
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(
    1,
    'createCluster',
    expect.objectContaining({ provider: 'docker', httpsHostPort: 9443, httpHostPort: 9090 }),
  );
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(
    2,
    'createClusterSuccess',
    expect.objectContaining({ provider: 'docker' }),
  );
  expect(telemetryLogErrorMock).not.toBeCalled();
});

test('check cluster configuration generation', async () => {
  const conf = getKindClusterConfig('k1', 80, 443);
  expect(conf).to.contains('name: k1');
  expect(conf).to.contains('hostPort: 80');
  expect(conf).to.contains('hostPort: 443');
});
