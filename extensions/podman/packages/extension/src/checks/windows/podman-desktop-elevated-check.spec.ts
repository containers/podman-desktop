/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import { env, type TelemetryLogger } from '@podman-desktop/api';
import { beforeEach, expect, test, vi } from 'vitest';

import type { PowerShellClient } from '/@/utils/powershell';
import { getPowerShellClient } from '/@/utils/powershell';

import { PodmanDesktopElevatedCheck } from './podman-desktop-elevated-check';

vi.mock(import('@podman-desktop/api'));
vi.mock(import('../../utils/powershell'), () => ({
  getPowerShellClient: vi.fn(),
}));

const mockTelemetryLogger = {} as TelemetryLogger;

const POWERSHELL_CLIENT: PowerShellClient = {
  isUserAdmin: vi.fn(),
  isHyperVInstalled: vi.fn(),
  isHyperVRunning: vi.fn(),
  isVirtualMachineAvailable: vi.fn(),
  isVirtualizationFirmwareEnabled: vi.fn(),
  isHypervisorPresent: vi.fn(),
  isRunningElevated: vi.fn(),
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(env).appName = 'Test app';
  vi.mocked(getPowerShellClient).mockResolvedValue(POWERSHELL_CLIENT);
});

test('expect PodmanDesktopElevatedCheck preflight check return failure result if Podman Desktop is not elevated', async () => {
  vi.mocked(POWERSHELL_CLIENT.isRunningElevated).mockResolvedValue(false);

  const podmanDesktopElevatedCheck = new PodmanDesktopElevatedCheck(mockTelemetryLogger);
  const result = await podmanDesktopElevatedCheck.execute();
  expect(result.successful).toBeFalsy();
  expect(result.description).equal(
    'You must run Test app with administrative rights to install and configure Podman with Hyper-V support.',
  );
  expect(result.docLinks).toBeUndefined();
});

test('expect PodmanDesktopElevatedCheck preflight check return OK if Podman Desktop is elevated', async () => {
  vi.mocked(POWERSHELL_CLIENT.isRunningElevated).mockResolvedValue(true);

  const podmanDesktopElevatedCheck = new PodmanDesktopElevatedCheck(mockTelemetryLogger);
  const result = await podmanDesktopElevatedCheck.execute();
  expect(result.successful).toBeTruthy();
  expect(result.description).toBeUndefined();
  expect(result.docLinks).toBeUndefined();
});
