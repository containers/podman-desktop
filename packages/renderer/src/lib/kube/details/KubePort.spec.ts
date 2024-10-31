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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

import KubePort from './KubePort.svelte';

beforeEach(() => {
  vi.resetAllMocks();

  (window.getFreePort as unknown) = vi.fn().mockResolvedValue(55_001);
  (window.createKubernetesPortForward as unknown) = vi.fn();
  (window.openExternal as unknown) = vi.fn();
  (window.deleteKubernetesPortForward as unknown) = vi.fn();
});

const DUMMY_FORWARD_CONFIG: UserForwardConfig = {
  name: 'dummy-pod-name',
  namespace: 'dummy-ns',
  kind: WorkloadKind.POD,
  forwards: [
    {
      localPort: 55_076,
      remotePort: 80,
    },
  ],
  displayName: 'dummy name',
};

describe('port forwarding', () => {
  test('forward button should be visible and unique for each container port', async () => {
    const { getByTitle } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      forwardConfig: undefined,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const port80 = getByTitle('Forward port 80');
    expect(port80).toBeDefined();
  });

  test('forward button should call ', async () => {
    const { getByTitle } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      forwardConfig: undefined,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const forwardBtn = getByTitle('Forward port 80');
    await fireEvent.click(forwardBtn);

    await vi.waitFor(() => {
      expect(window.getFreePort).toHaveBeenCalled();
      expect(window.createKubernetesPortForward).toHaveBeenCalledWith({
        displayName: 'dummy-pod-name/undefined',
        forward: {
          localPort: 55001,
          remotePort: 80,
        },
        kind: 'pod',
        name: 'dummy-pod-name',
        namespace: 'dummy-ns',
      });
    });
  });

  test('existing forward should display actions', async () => {
    const { getByTitle } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      forwardConfig: DUMMY_FORWARD_CONFIG,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const openBtn = getByTitle('Open in browser');
    expect(openBtn).toBeDefined();

    const removeBtn = getByTitle('Remove port forward');
    expect(removeBtn).toBeDefined();
  });

  test('open button should use window.openExternal with proper local port', async () => {
    const { getByTitle } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      forwardConfig: DUMMY_FORWARD_CONFIG,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const openBtn = getByTitle('Open in browser');
    await fireEvent.click(openBtn);

    await vi.waitFor(() => {
      expect(window.openExternal).toHaveBeenCalledWith('http://localhost:55076');
    });
  });

  test('remove button should use window.deleteKubernetesPortForward with proper local port', async () => {
    const { getByTitle } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      forwardConfig: DUMMY_FORWARD_CONFIG,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const removeBtn = getByTitle('Remove port forward');
    await fireEvent.click(removeBtn);

    await vi.waitFor(() => {
      expect(window.deleteKubernetesPortForward).toHaveBeenCalledWith(
        DUMMY_FORWARD_CONFIG,
        DUMMY_FORWARD_CONFIG.forwards[0],
      );
    });
  });

  test('error from createKubernetesPortForward should be displayed', async () => {
    vi.mocked(window.createKubernetesPortForward).mockRejectedValue('Dummy error');

    const { getByTitle, getByRole } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      forwardConfig: undefined,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const port80 = getByTitle('Forward port 80');
    await fireEvent.click(port80);

    await vi.waitFor(() => {
      const error = getByRole('alert', { name: 'Error Message Content' });
      expect(error.textContent).toBe('Dummy error');
    });
  });

  test('non-TCP port should not display the forward action', async () => {
    const { queryByTitle, getByText } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80/UDP',
        value: 80,
        protocol: 'UDP',
      },
      forwardConfig: undefined,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const port80 = queryByTitle('Forward port 80');
    expect(port80).toBeNull();

    const tooltip = getByText('UDP cannot be forwarded.');
    expect(tooltip).toBeDefined();
  });

  // kubernetes default to TCP
  test('undefined protocol should display the forward action', async () => {
    const { getByTitle } = render(KubePort, {
      namespace: 'dummy-ns',
      port: {
        displayValue: '80',
        value: 80,
        protocol: undefined,
      },
      forwardConfig: undefined,
      resourceName: 'dummy-pod-name',
      kind: WorkloadKind.POD,
    });

    const port80 = getByTitle('Forward port 80');
    expect(port80).not.toBeNull();
  });
});
