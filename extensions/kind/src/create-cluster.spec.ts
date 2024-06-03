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

import type { AuditRecord, TelemetryLogger } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import { connectionAuditor, createCluster, getKindClusterConfig } from './create-cluster';
import { getMemTotalInfo } from './util';

vi.mock('@podman-desktop/api', async () => {
  return {
    Logger: {},
    kubernetes: {
      createResources: vi.fn(),
    },
    provider: {
      getContainerConnections: vi
        .fn()
        .mockReturnValue([{ connection: { type: 'docker', endpoint: { socketPath: 'socket' } } }]),
    },
    process: {
      exec: vi.fn(),
    },
  };
});

vi.mock('./util', async () => {
  return {
    getKindPath: vi.fn(),
    getMemTotalInfo: vi.fn(),
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
  const error = { exitCode: -1, message: 'error' } as extensionApi.RunError;
  try {
    (extensionApi.process.exec as Mock).mockRejectedValue(error);
    await createCluster({}, '', telemetryLoggerMock, undefined, undefined);
  } catch (err) {
    expect(err).to.be.a('Error');
    expect((err as Error).message).equal('Failed to create kind cluster. error');
    expect(telemetryLogUsageMock).toBeCalledWith('createCluster', expect.objectContaining({ error: error }));
    expect(telemetryLogErrorMock).not.toBeCalled();
  }
});

test('expect cluster to be created', async () => {
  (extensionApi.process.exec as Mock).mockReturnValue({} as extensionApi.RunResult);
  await createCluster({}, '', telemetryLoggerMock, undefined, undefined);
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(
    1,
    'createCluster',
    expect.objectContaining({ provider: 'docker' }),
  );
  expect(telemetryLogErrorMock).not.toBeCalled();
  expect(extensionApi.kubernetes.createResources).not.toBeCalled();
});

test('expect cluster to be created with ingress', async () => {
  (extensionApi.process.exec as Mock).mockReturnValue({} as extensionApi.RunResult);
  const logger = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
  await createCluster({ 'kind.cluster.creation.ingress': 'on' }, '', telemetryLoggerMock, logger, undefined);
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(
    1,
    'createCluster',
    expect.objectContaining({ provider: 'docker' }),
  );
  expect(extensionApi.kubernetes.createResources).toBeCalled();
});

test('expect error if Kubernetes reports error', async () => {
  const error = new Error('Kubernetes error');
  try {
    (extensionApi.process.exec as Mock).mockReturnValue({} as extensionApi.RunResult);
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };
    (extensionApi.kubernetes.createResources as Mock).mockRejectedValue(error);
    await createCluster({ 'kind.cluster.creation.ingress': 'on' }, '', telemetryLoggerMock, logger, undefined);
  } catch (err) {
    expect(extensionApi.kubernetes.createResources).toBeCalled();
    expect(err).to.be.a('Error');
    expect((err as Error).message).equal('Failed to create kind cluster. Kubernetes error');
    expect(telemetryLogErrorMock).not.toBeCalled();
    expect(telemetryLogUsageMock).toBeCalledWith('createCluster', expect.objectContaining(error));
  }
});

test('check cluster configuration generation', async () => {
  const conf = getKindClusterConfig('k1', 80, 443, 'image:tag');
  expect(conf).to.contains('name: k1');
  expect(conf).to.contains('hostPort: 80');
  expect(conf).to.contains('hostPort: 443');
  expect(conf).to.contains('image: image:tag');
});

test('check cluster configuration empty string image', async () => {
  const conf = getKindClusterConfig('cluster', 80, 80, '');
  expect(conf).to.not.contains('image:');
});

test('check cluster configuration null string image', async () => {
  const conf = getKindClusterConfig('cluster', 80, 80, undefined);
  expect(conf).to.not.contains('image:');
});

test('check that consilience check returns warning message', async () => {
  (getMemTotalInfo as Mock).mockReturnValue(3000000000);
  const checks = await connectionAuditor('docker', {});

  expect(checks).toBeDefined();
  expect(checks).toHaveProperty('records');
  expect(checks.records.length).toBe(1);
  expect(checks.records[0]).to.contains({
    type: 'info',
    record: 'It is recommend to install Kind on a virtual machine with at least 6GB of memory.',
  } as AuditRecord);
});

test('check that consilience check returns no warning messages', async () => {
  (getMemTotalInfo as Mock).mockReturnValue(6000000001);
  const checks = await connectionAuditor('docker', {});

  expect(checks).toBeDefined();
  expect(checks).toHaveProperty('records');
  expect(checks.records.length).toBe(0);
});

test('check that consilience check returns warning message when image has no sha256 digest', async () => {
  const checks = await connectionAuditor('docker', { 'kind.cluster.creation.controlPlaneImage': 'image:tag' });

  expect(checks).toBeDefined();
  expect(checks).toHaveProperty('records');
  expect(checks.records.length).toBe(1);
  expect(checks.records[0]).toHaveProperty('type');
  expect(checks.records[0].type).toBe('warning');
});
