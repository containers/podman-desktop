/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import type { KubernetesObject, V1Deployment } from '@kubernetes/client-node';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { listenResourcePermitted } from '/@/lib/kube/resource-permission';
import * as resourcesListen from '/@/lib/kube/resources-listen';
import * as states from '/@/stores/kubernetes-contexts-state';

import DeploymentsList from './DeploymentsList.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'));
vi.mock(import('/@/lib/kube/resources-listen'));
vi.mock(import('/@/lib/kube/resource-permission'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  vi.mocked(states).deploymentSearchPattern = writable<string>('');
  vi.mocked(states).kubernetesContextsCheckingStateDelayed = writable();
  vi.mocked(states).kubernetesCurrentContextState = writable();
});

describe.each<{
  experimental: boolean;
  initMocks: () => void;
  initObjectsList: (objects?: KubernetesObject[]) => { update: (objects: KubernetesObject[]) => void };
}>([
  {
    experimental: true,
    initMocks: (): void => {
      vi.mocked(states).kubernetesCurrentContextDeploymentsFiltered = writable();
    },
    initObjectsList: (objects?: KubernetesObject[]): { update: (objects: KubernetesObject[]) => void } => {
      let callback: (resoures: KubernetesObject[]) => void;
      vi.mocked(resourcesListen.listenResources).mockImplementation(
        async (_resources, _options, cb): Promise<IDisposable> => {
          callback = cb;
          if (objects) {
            setTimeout(() => callback(objects));
          }
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
    initObjectsList: (objects?: KubernetesObject[]): { update: (objects: KubernetesObject[]) => void } => {
      const store = writable<KubernetesObject[]>(objects);
      vi.mocked(states).kubernetesCurrentContextDeploymentsFiltered = store;
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

  test('Expect deployment empty screen', async () => {
    vi.mocked(listenResourcePermitted).mockImplementation(vi.fn((_, callback) => callback(true)));
    initObjectsList([]);
    render(DeploymentsList);

    await vi.waitFor(() => {
      const noDeployments = screen.getByRole('heading', { name: 'No deployments' });
      expect(noDeployments).toBeInTheDocument();
    });
  });

  test('Expect no deployment empty screen before received data', async () => {
    vi.mocked(listenResourcePermitted).mockImplementation(vi.fn((_, callback) => callback(true)));
    const list = initObjectsList();
    render(DeploymentsList);

    await new Promise(resolve => setTimeout(resolve, 100));

    let noDeployments = await vi.waitFor(() => screen.queryByRole('heading', { name: 'No deployments' }));
    expect(noDeployments).not.toBeInTheDocument();

    list.update([]);
    await vi.waitFor(() => {
      noDeployments = screen.queryByRole('heading', { name: 'No deployments' });
      expect(noDeployments).toBeInTheDocument();
    });
  });

  test('Expect deployments list', async () => {
    const deployment: V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment',
        namespace: 'test-namespace',
      },
      spec: {
        replicas: 2,
        selector: {},
        template: {},
      },
    };
    initObjectsList([deployment]);

    render(DeploymentsList);
    await vi.waitFor(() => {
      const deploymentName = screen.getByRole('cell', { name: 'my-deployment test-namespace' });
      expect(deploymentName).toBeInTheDocument();
    });
  });

  test('Expect correct column overflow', async () => {
    const deployment: V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment',
        namespace: 'test-namespace',
      },
      spec: {
        replicas: 2,
        selector: {},
        template: {},
      },
    };
    initObjectsList([deployment]);

    render(DeploymentsList);

    await vi.waitFor(async () => {
      const rows = await screen.findAllByRole('row');
      expect(rows).toBeDefined();
      expect(rows.length).toBe(2);

      const cells = await within(rows[1]).findAllByRole('cell');
      expect(cells).toBeDefined();
      expect(cells.length).toBe(8);

      expect(cells[2]).toHaveClass('overflow-hidden');
      expect(cells[3]).toHaveClass('overflow-hidden');
      expect(cells[4]).not.toHaveClass('overflow-hidden');
      expect(cells[5]).toHaveClass('overflow-hidden');
      expect(cells[6]).toHaveClass('overflow-hidden');
      expect(cells[7]).toHaveClass('overflow-hidden');
    });
  });

  test('Expect filter empty screen', async () => {
    initObjectsList([]);

    render(DeploymentsList, { searchTerm: 'No match' });
    await vi.waitFor(() => {
      const filterButton = screen.getByRole('button', { name: 'Clear filter' });
      expect(filterButton).toBeInTheDocument();
    });
  });

  test('Expect user confirmation to pop up when preferences require', async () => {
    const deployment: V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment',
        namespace: 'test-namespace',
      },
      spec: {
        replicas: 2,
        selector: {},
        template: {},
      },
    };
    initObjectsList([deployment]);

    render(DeploymentsList);

    await vi.waitFor(async () => {
      const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle deployment' });
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
    await vi.waitFor(() => expect(window.kubernetesDeleteDeployment).toHaveBeenCalled());
  });

  test('deployemnts list is updated when resources change', async () => {
    const deployment1: V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment-1',
        namespace: 'test-namespace',
      },
      spec: {
        replicas: 2,
        selector: {},
        template: {},
      },
    };
    const deployment2: V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment-2',
        namespace: 'test-namespace',
      },
      spec: {
        replicas: 2,
        selector: {},
        template: {},
      },
    };
    const list = initObjectsList([deployment1, deployment2]);

    const component = render(DeploymentsList);

    await vi.waitFor(async () => {
      const deploymentName1 = screen.getByRole('cell', { name: 'my-deployment-1 test-namespace' });
      expect(deploymentName1).toBeInTheDocument();
      const deploymentName2 = screen.getByRole('cell', { name: 'my-deployment-2 test-namespace' });
      expect(deploymentName2).toBeInTheDocument();
    });

    list.update([deployment2]);
    await component.rerender({});

    const deploymentName1after = screen.queryByRole('cell', { name: 'my-deployment-1 test-namespace' });
    expect(deploymentName1after).not.toBeInTheDocument();
    const deploymentName2after = screen.getByRole('cell', { name: 'my-deployment-2 test-namespace' });
    expect(deploymentName2after).toBeInTheDocument();
  });
});
