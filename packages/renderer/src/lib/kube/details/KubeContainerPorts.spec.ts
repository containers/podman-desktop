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
import { readable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import KubeContainerPorts from '/@/lib/kube/details/KubeContainerPorts.svelte';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import { type UserForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {};
});

beforeEach(() => {
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<UserForwardConfig[]>([]);

  (window.createKubernetesPortForward as unknown) = vi.fn();
  (window.getFreePort as unknown) = vi.fn();
  (window.openExternal as unknown) = vi.fn();
  (window.deleteKubernetesPortForward as unknown) = vi.fn();
});

describe('port listing', () => {
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
});

const dummyUserForwardConfig: UserForwardConfig = {
  name: 'my-nice-pod',
  displayName: 'forward eg',
  namespace: 'custom-ns',
  kind: WorkloadKind.POD,
  forwards: [
    {
      localPort: 55_015,
      remotePort: 80,
    },
  ],
};

describe('forwarding', () => {
  test('empty store should make the forward button visible', () => {
    const { getByTitle } = render(KubeContainerPorts, {
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
    });

    const button = getByTitle('Forward container port 80');
    expect(button).toBeDefined();
  });

  test('store with matching content should have open and remove button visible', () => {
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<UserForwardConfig[]>([
      dummyUserForwardConfig,
    ]);

    const { getByTitle } = render(KubeContainerPorts, {
      namespace: dummyUserForwardConfig.namespace,
      podName: dummyUserForwardConfig.name,
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
    });

    const rmButton = getByTitle('Remove port forward');
    expect(rmButton).toBeDefined();

    const openButton = getByTitle('Open in browser');
    expect(openButton).toBeDefined();
  });

  test('open button should call openExternal with the expected local port', async () => {
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<UserForwardConfig[]>([
      dummyUserForwardConfig,
    ]);

    const { getByTitle } = render(KubeContainerPorts, {
      namespace: dummyUserForwardConfig.namespace,
      podName: dummyUserForwardConfig.name,
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
    });

    const openButton = getByTitle('Open in browser');
    expect(openButton).toBeDefined();

    await fireEvent.click(openButton);

    await vi.waitFor(() => {
      expect(window.openExternal).toHaveBeenCalledWith('http://localhost:55015');
    });
  });

  test('remove button should call removePortForward with the config', async () => {
    vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<UserForwardConfig[]>([
      dummyUserForwardConfig,
    ]);

    const { getByTitle } = render(KubeContainerPorts, {
      namespace: dummyUserForwardConfig.namespace,
      podName: dummyUserForwardConfig.name,
      ports: [
        {
          containerPort: 80,
          protocol: 'TCP',
        },
      ],
    });

    const rmButton = getByTitle('Remove port forward');
    expect(rmButton).toBeDefined();

    await fireEvent.click(rmButton);

    await vi.waitFor(() => {
      expect(window.deleteKubernetesPortForward).toHaveBeenCalledWith(dummyUserForwardConfig);
    });
  });
});
