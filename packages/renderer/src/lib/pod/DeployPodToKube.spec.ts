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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import DeployPodToKube from './DeployPodToKube.svelte';
import * as jsYaml from 'js-yaml';

const generatePodmanKubeMock = vi.fn();
const kubernetesGetCurrentContextNameMock = vi.fn();
const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesListNamespacesMock = vi.fn();
const kubernetesReadNamespacedConfigMapMock = vi.fn();
const telemetryTrackMock = vi.fn();
const kubernetesCreatePodMock = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, 'generatePodmanKube', {
    value: generatePodmanKubeMock,
  });
  Object.defineProperty(window, 'kubernetesGetCurrentContextName', {
    value: kubernetesGetCurrentContextNameMock,
  });
  Object.defineProperty(window, 'kubernetesGetCurrentNamespace', {
    value: kubernetesGetCurrentNamespaceMock,
  });

  Object.defineProperty(window, 'kubernetesListNamespaces', {
    value: kubernetesListNamespacesMock,
  });
  Object.defineProperty(window, 'kubernetesReadNamespacedConfigMap', {
    value: kubernetesReadNamespacedConfigMapMock,
  });
  Object.defineProperty(window, 'kubernetesCreatePod', {
    value: kubernetesCreatePodMock,
  });
  Object.defineProperty(window, 'telemetryTrack', {
    value: telemetryTrackMock,
  });

  const podYaml = {
    metadata: { name: 'hello' },
    spec: {
      containers: [],
    },
  };
  generatePodmanKubeMock.mockResolvedValue(jsYaml.dump(podYaml));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

async function waitRender(customProperties): Promise<void> {
  const result = render(DeployPodToKube, { resourceId: 'foo', engineId: 'bar', ...customProperties });
  // wait that result.component.$$.ctx[0] is set
  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect to send telemetry event', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  await fireEvent.click(createButton);
  await waitFor(() =>
    expect(telemetryTrackMock).toBeCalledWith('deployToKube', { useRoutes: true, useServices: true }),
  );
});

test('Expect to send telemetry error event', async () => {
  // creation throws an error
  kubernetesCreatePodMock.mockRejectedValue(new Error('Custom Error'));

  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // expect it throws a telemetry event reporting an error
  await fireEvent.click(createButton);
  await waitFor(() =>
    expect(telemetryTrackMock).toHaveBeenCalledWith('deployToKube.error', {
      errorMessage: 'Custom Error',
      useRoutes: true,
      useServices: true,
    }),
  );
});
