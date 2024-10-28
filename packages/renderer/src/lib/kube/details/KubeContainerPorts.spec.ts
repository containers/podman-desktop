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

import { fireEvent, render, within } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import KubeContainerPorts from '/@/lib/kube/details/KubeContainerPorts.svelte';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import { type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

vi.mock('/@/stores/kubernetes-contexts-state', async () => ({}));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([]);

  (window.getKubernetesPortForwards as unknown) = vi.fn();
  (window.getFreePort as unknown) = vi.fn().mockResolvedValue(55_001);
  (window.createKubernetesPortForward as unknown) = vi.fn();
  (window.openExternal as unknown) = vi.fn();
  (window.deleteKubernetesPortForward as unknown) = vi.fn();
});

test('expect port title not to be visible when no ports provided', async () => {
  const { queryByText } = render(KubeContainerPorts);

  const title = queryByText('Ports');
  expect(title).toBeNull();
});

test('expect port title to be visible when ports is defined', async () => {
  const { getByText } = render(KubeContainerPorts, {
    ports: [
      {
        containerPort: 80,
      },
    ],
  });

  const title = getByText('Ports');
  expect(title).toBeDefined();
});

test('expect multiple ports to be visible', async () => {
  const { getByText } = render(KubeContainerPorts, {
    ports: [
      {
        containerPort: 80,
        protocol: 'TCP',
      },
      {
        containerPort: 100,
        protocol: 'TCP',
      },
    ],
  });

  const port80 = getByText('80/TCP');
  expect(port80).toBeDefined();

  const port100 = getByText('100/TCP');
  expect(port100).toBeDefined();
});

describe('port forwarding', () => {
  test('forward button should be visible and unique for each container port', async () => {
    const { getByTitle } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
        {
          containerPort: 100,
          protocol: 'TCP',
        },
      ],
    });

    const port80 = getByTitle('Forward container port 80');
    expect(port80).toBeDefined();

    const port100 = getByTitle('Forward container port 100');
    expect(port100).toBeDefined();
  });

  test('forward button should call ', async () => {
    const { getByTitle } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
      namespace: 'dummy-ns',
      podName: 'dummy-pod-name',
    });

    const forwardBtn = getByTitle('Forward container port 80');
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
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([
      {
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
      },
    ]);

    const { getByTitle } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
      namespace: 'dummy-ns',
      podName: 'dummy-pod-name',
    });

    const openBtn = getByTitle('Open in browser');
    expect(openBtn).toBeDefined();

    const removeBtn = getByTitle('Remove port forward');
    expect(removeBtn).toBeDefined();
  });

  test('open button should use window.openExternal with proper local port', async () => {
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([
      {
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
      },
    ]);

    const { getByTitle } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
      namespace: 'dummy-ns',
      podName: 'dummy-pod-name',
    });

    const openBtn = getByTitle('Open in browser');
    await fireEvent.click(openBtn);

    await vi.waitFor(() => {
      expect(window.openExternal).toHaveBeenCalledWith('http://localhost:55076');
    });
  });

  test('remove button should use window.deleteKubernetesPortForward with proper local port', async () => {
    const config: UserForwardConfig = {
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
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([config]);

    const { getByTitle } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
      namespace: 'dummy-ns',
      podName: 'dummy-pod-name',
    });

    const removeBtn = getByTitle('Remove port forward');
    await fireEvent.click(removeBtn);

    await vi.waitFor(() => {
      expect(window.deleteKubernetesPortForward).toHaveBeenCalledWith(config, config.forwards[0]);
    });
  });

  test('remove button should only delete the targeted mapping', async () => {
    const config: UserForwardConfig = {
      name: 'dummy-pod-name',
      namespace: 'dummy-ns',
      kind: WorkloadKind.POD,
      forwards: [
        {
          localPort: 55_076,
          remotePort: 80,
        },
        {
          localPort: 55_077,
          remotePort: 90,
        },
      ],
      displayName: 'dummy name',
    };
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([config]);

    const { getByLabelText } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
        {
          containerPort: 90,
          protocol: 'TCP',
        },
      ],
      namespace: 'dummy-ns',
      podName: 'dummy-pod-name',
    });

    const span = getByLabelText('container port 90');
    const removeBtn = within(span).getByTitle('Remove port forward');
    await fireEvent.click(removeBtn);

    await vi.waitFor(() => {
      expect(window.deleteKubernetesPortForward).toHaveBeenCalledWith(config, config.forwards[1]);
    });
  });
});
