/**********************************************************************
 * Copyright (C) 2024 - 2025 Red Hat, Inc.
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

import type { V1Route } from '@desktop-framework/api';
import type { KubernetesObject, V1Ingress } from '@kubernetes/client-node';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { readable, writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as states from '/@/stores/kubernetes-contexts-state';

import IngressesRoutesList from './IngressesRoutesList.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  vi.mocked(states).ingressSearchPattern = writable<string>('');
  vi.mocked(states).routeSearchPattern = writable<string>('');
  vi.mocked(states).kubernetesContextsCheckingStateDelayed = writable();
  vi.mocked(states).kubernetesCurrentContextState = writable();
});

test('Expect ingress&routes empty screen', async () => {
  vi.mocked(states).kubernetesCurrentContextIngressesFiltered = readable<KubernetesObject[]>([]);
  vi.mocked(states).kubernetesCurrentContextRoutesFiltered = readable<KubernetesObject[]>([]);
  render(IngressesRoutesList);
  await vi.waitFor(() => {
    const noIngressesNorRoutes = screen.getByRole('heading', { name: 'No ingresses or routes' });
    expect(noIngressesNorRoutes).toBeInTheDocument();
  });
});

test('Expect element in ingresses list', async () => {
  const ingress = {
    metadata: {
      name: 'my-ingress',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;
  const route = {
    metadata: {
      name: 'my-route',
      namespace: 'test-namespace',
    },
    spec: {
      host: 'foo.bar.com',
      port: {
        targetPort: '80',
      },
      to: {
        kind: 'Service',
        name: 'service',
      },
    },
  } as V1Route;

  // mock object stores
  vi.mocked(states).kubernetesCurrentContextIngressesFiltered = readable<KubernetesObject[]>([ingress]);
  vi.mocked(states).kubernetesCurrentContextRoutesFiltered = readable<KubernetesObject[]>([route]);

  render(IngressesRoutesList);

  await vi.waitFor(() => {
    const ingressName = screen.getByRole('cell', { name: 'my-ingress test-namespace' });
    expect(ingressName).toBeInTheDocument();
    const routeName = screen.getByRole('cell', { name: 'my-route test-namespace' });
    expect(routeName).toBeInTheDocument();
  });
});

test('Expect filter empty screen if no match', async () => {
  // mock object stores
  vi.mocked(states).kubernetesCurrentContextIngressesFiltered = readable<KubernetesObject[]>([]);
  vi.mocked(states).kubernetesCurrentContextRoutesFiltered = readable<KubernetesObject[]>([]);

  render(IngressesRoutesList, { searchTerm: 'No match' });

  await vi.waitFor(() => {
    const filterButton = screen.getByRole('button', { name: 'Clear filter' });
    expect(filterButton).toBeInTheDocument();
  });
});

test('Expect status column name to be clickable / sortable', async () => {
  render(IngressesRoutesList);

  const statusColumn = screen.getByRole('columnheader', { name: 'Status' });
  expect(statusColumn).toBeInTheDocument();

  // Expect it to have the 'cursor-pointer' class which means it's clickable / sortable
  expect(statusColumn).toHaveClass('cursor-pointer');
});

test('Expect there to be an age column', async () => {
  render(IngressesRoutesList);

  const ageColumn = screen.getByRole('columnheader', { name: 'Age' });
  expect(ageColumn).toBeInTheDocument();
});

test('Expect user confirmation to pop up when preferences require', async () => {
  const ingress = {
    metadata: {
      name: 'my-ingress',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;

  vi.mocked(states).kubernetesCurrentContextIngressesFiltered = readable<KubernetesObject[]>([ingress]);

  render(IngressesRoutesList);

  await vi.waitFor(async () => {
    const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle ingress and route' });
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
  await vi.waitFor(() => expect(window.kubernetesDeleteIngress).toHaveBeenCalled());
});

test('Expect list to be updated when stores change', async () => {
  const ingress1 = {
    metadata: {
      name: 'my-ingress-1',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;
  const ingress2 = {
    metadata: {
      name: 'my-ingress-2',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;
  const route = {
    metadata: {
      name: 'my-route',
      namespace: 'test-namespace',
    },
    spec: {
      host: 'foo.bar.com',
      port: {
        targetPort: '80',
      },
      to: {
        kind: 'Service',
        name: 'service',
      },
    },
  } as V1Route;

  // mock object stores
  const filteredIngresses = (vi.mocked(states).kubernetesCurrentContextIngressesFiltered = writable<KubernetesObject[]>(
    [ingress1, ingress2],
  ));
  const filteredRoutes = (vi.mocked(states).kubernetesCurrentContextRoutesFiltered = writable<KubernetesObject[]>([
    route,
  ]));

  const component = render(IngressesRoutesList);

  await vi.waitFor(async () => {
    const ingressName1 = screen.queryByRole('cell', { name: 'my-ingress-1 test-namespace' });
    expect(ingressName1).toBeInTheDocument();
    const ingressName2 = screen.queryByRole('cell', { name: 'my-ingress-2 test-namespace' });
    expect(ingressName2).toBeInTheDocument();
    const routeName = screen.queryByRole('cell', { name: 'my-route test-namespace' });
    expect(routeName).toBeInTheDocument();
  });

  filteredIngresses.set([ingress1]);
  await component.rerender({});

  let ingressName1 = screen.queryByRole('cell', { name: 'my-ingress-1 test-namespace' });
  expect(ingressName1).toBeInTheDocument();
  let ingressName2 = screen.queryByRole('cell', { name: 'my-ingress-2 test-namespace' });
  expect(ingressName2).not.toBeInTheDocument();
  let routeName = screen.queryByRole('cell', { name: 'my-route test-namespace' });
  expect(routeName).toBeInTheDocument();

  filteredRoutes.set([]);
  await component.rerender({});

  ingressName1 = screen.queryByRole('cell', { name: 'my-ingress-1 test-namespace' });
  expect(ingressName1).toBeInTheDocument();
  ingressName2 = screen.queryByRole('cell', { name: 'my-ingress-2 test-namespace' });
  expect(ingressName2).not.toBeInTheDocument();
  routeName = screen.queryByRole('cell', { name: 'my-route test-namespace' });
  expect(routeName).not.toBeInTheDocument();
});
