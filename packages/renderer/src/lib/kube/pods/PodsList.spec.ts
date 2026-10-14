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

import '@testing-library/jest-dom/vitest';

import type { IDisposable } from '@desktop-framework/api';
import type { KubernetesObject, V1Pod } from '@kubernetes/client-node';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import * as resourcesListen from '/@/lib/kube/resources-listen';
import * as states from '/@/stores/kubernetes-contexts-state';

import PodsList from './PodsList.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'));
vi.mock(import('/@/lib/kube/resources-listen'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  vi.mocked(states).podSearchPattern = writable<string>('');
  vi.mocked(states).kubernetesContextsCheckingStateDelayed = writable();
  vi.mocked(states).kubernetesCurrentContextState = writable();
});

describe.each<{
  experimental: boolean;
  initMocks: () => void;
  initObjectsList: (objects: KubernetesObject[]) => { update: (objects: KubernetesObject[]) => void };
}>([
  {
    experimental: true,
    initMocks: (): void => {
      vi.mocked(states).kubernetesCurrentContextPodsFiltered = writable();
    },
    initObjectsList: (objects: KubernetesObject[]): { update: (objects: KubernetesObject[]) => void } => {
      let callback: (resoures: KubernetesObject[]) => void;
      vi.mocked(resourcesListen.listenResources).mockImplementation(
        async (_resources, _options, cb): Promise<IDisposable> => {
          callback = cb;
          setTimeout(() => callback(objects));
          return {
            dispose: (): void => {},
          };
        },
      );
      return {
        update: (updatedObjects: KubernetesObject[]): void => {
          callback(updatedObjects);
        },
      };
    },
  },
  {
    experimental: false,
    initMocks: (): void => {
      vi.mocked(resourcesListen.listenResources).mockResolvedValue(undefined);
    },
    initObjectsList: (objects: KubernetesObject[]): { update: (objects: KubernetesObject[]) => void } => {
      const store = writable<KubernetesObject[]>(objects);
      vi.mocked(states).kubernetesCurrentContextPodsFiltered = store;
      return {
        update: (objects: KubernetesObject[]): void => {
          store.set(objects);
        },
      };
    },
  },
])('kubernetes experimental is %s', ({ experimental: _experimental, initObjectsList, initMocks }) => {
  beforeEach(() => {
    initMocks();
  });

  test('Expect pod empty screen', async () => {
    initObjectsList([]);
    render(PodsList);
    await vi.waitFor(() => {
      const noPods = screen.getByRole('heading', { name: 'No pods' });
      expect(noPods).toBeInTheDocument();
    });
  });

  test('Expect pods list', async () => {
    const pod: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'my-pod', namespace: 'default' },
      spec: {
        containers: [
          {
            name: 'test-container',
            ports: [{ name: 'http', containerPort: 8080 }],
          },
        ],
      },
    };
    initObjectsList([pod]);

    render(PodsList);
    await vi.waitFor(() => {
      const podName = screen.getByRole('cell', { name: 'my-pod default' });
      expect(podName).toBeInTheDocument();
    });
  });

  test('Expect correct column overflow', async () => {
    const pod: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'my-pod', namespace: 'default' },
      spec: {
        containers: [
          {
            name: 'test-container',
            ports: [{ name: 'http', containerPort: 8080 }],
          },
        ],
      },
    };
    initObjectsList([pod]);

    render(PodsList);

    await vi.waitFor(async () => {
      const rows = await screen.findAllByRole('row');
      expect(rows).toBeDefined();
      expect(rows.length).toBe(2);

      const cells = await within(rows[1]).findAllByRole('cell');
      expect(cells).toBeDefined();
      expect(cells.length).toBe(7);

      expect(cells[2]).toHaveClass('overflow-hidden');
      expect(cells[3]).toHaveClass('overflow-hidden');
      expect(cells[4]).not.toHaveClass('overflow-hidden');
      expect(cells[5]).toHaveClass('overflow-hidden');
    });
  });

  test('Expect filter empty screen', async () => {
    initObjectsList([]);

    render(PodsList, { searchTerm: 'No match' });
    await vi.waitFor(() => {
      const filterButton = screen.getByRole('button', { name: 'Clear filter' });
      expect(filterButton).toBeInTheDocument();
    });
  });

  test('Expect user confirmation to pop up when preferences require', async () => {
    const pod: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'my-pod', namespace: 'default' },
      spec: {
        containers: [
          {
            name: 'test-container',
            ports: [{ name: 'http', containerPort: 8080 }],
          },
        ],
      },
    };
    initObjectsList([pod]);

    render(PodsList);

    await vi.waitFor(async () => {
      const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle pod' });
      await fireEvent.click(checkboxes[0]);
    });

    vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

    const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
    await fireEvent.click(deleteButton);

    expect(window.showMessageBox).toHaveBeenCalledOnce();

    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
    await fireEvent.click(deleteButton);
    expect(window.showMessageBox).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(window.kubernetesDeletePod).toHaveBeenCalled());
  });

  test('pods list is updated when kubernetesCurrentContextPodsFiltered changes', async () => {
    const pod1: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'my-pod-1', namespace: 'test-namespace' },
      spec: {
        containers: [
          {
            name: 'test-container',
            ports: [{ name: 'http', containerPort: 8080 }],
          },
        ],
      },
    };
    const pod2: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'my-pod-2', namespace: 'test-namespace' },
      spec: {
        containers: [
          {
            name: 'test-container',
            ports: [{ name: 'http', containerPort: 8080 }],
          },
        ],
      },
    };
    const list = initObjectsList([pod1, pod2]);

    const component = render(PodsList);

    await vi.waitFor(() => {
      const podName1 = screen.getByRole('cell', { name: 'my-pod-1 test-namespace' });
      expect(podName1).toBeInTheDocument();
      const podName2 = screen.getByRole('cell', { name: 'my-pod-2 test-namespace' });
      expect(podName2).toBeInTheDocument();
    });

    list.update([pod2]);
    await component.rerender({});

    const podName1after = screen.queryByRole('cell', { name: 'my-pod-1 test-namespace' });
    expect(podName1after).not.toBeInTheDocument();
    const podName2after = screen.getByRole('cell', { name: 'my-pod-2 test-namespace' });
    expect(podName2after).toBeInTheDocument();
  });

  test('Expect the pod1 row to have 3 status dots with the correct colors and the pod2 row to have 1 status dot', async () => {
    const pod: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'my-pod-1', namespace: 'test-namespace' },
      status: {
        containerStatuses: [
          {
            containerID: 'container-1',
            name: 'container-1-name',
            state: {
              waiting: {},
            },
          },
          {
            containerID: 'container-2',
            name: 'container-2-name',
            state: {
              terminated: {},
            },
          },
          {
            containerID: 'container-3',
            name: 'container-3-name',
            state: {
              running: {},
            },
          },
        ],
      },
    } as unknown as V1Pod;
    initObjectsList([pod]);

    render(PodsList);

    await vi.waitFor(() => {
      // Should render 3 status dots, reordered
      const statusDots = screen.getAllByTestId('status-dot');
      expect(statusDots.length).toBe(3);

      expect(statusDots[0].title).toBe('container-3-name: Running');
      expect(statusDots[1].title).toBe('container-1-name: Waiting');
      expect(statusDots[2].title).toBe('container-2-name: Terminated');
    });
  });
});
