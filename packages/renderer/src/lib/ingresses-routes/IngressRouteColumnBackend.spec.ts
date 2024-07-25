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

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test } from 'vitest';

import { IngressRouteUtils } from './ingress-route-utils';
import IngressRouteColumnBackend from './IngressRouteColumnBackend.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

let ingressRouteUtils: IngressRouteUtils;

beforeEach(() => {
  ingressRouteUtils = new IngressRouteUtils();
});

test('Expect simple column styling with single path ingress', async () => {
  const ingressUI: IngressUI = {
    name: 'my-ingress',
    namespace: 'test-namespace',
    status: 'RUNNING',
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
    selected: false,
  };
  render(IngressRouteColumnBackend, { object: ingressUI });

  const backend = ingressRouteUtils.getBackends(ingressUI)[0];
  const text = screen.getByText(backend);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-[var(--pd-table-body-text)]');
});

test('Expect simple column styling with multiple paths ingress', async () => {
  const ingressUI: IngressUI = {
    name: 'my-ingress',
    namespace: 'test-namespace',
    status: 'RUNNING',
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
            {
              path: '/foo2',
              pathType: 'Prefix',
              backend: {
                resource: {
                  name: 'bucket-2',
                  kind: 'StorageBucket',
                },
              },
            },
          ],
        },
      },
    ],
    selected: false,
  };
  render(IngressRouteColumnBackend, { object: ingressUI });

  const backends = ingressRouteUtils.getBackends(ingressUI);
  expect(backends.length).toBe(2);
  const firstElement = screen.getByText(backends[0]);
  expect(firstElement).toBeInTheDocument();
  expect(firstElement).toHaveClass('text-[var(--pd-table-body-text)]');
  const secondElement = screen.getByText(backends[1]);
  expect(secondElement).toBeInTheDocument();
  expect(secondElement).toHaveClass('text-[var(--pd-table-body-text)]');
});

test('Expect simple column styling with route', async () => {
  const routeUI: RouteUI = {
    name: 'my-route',
    namespace: 'test-namespace',
    status: 'RUNNING',
    host: 'foo.bar.com',
    port: '80',
    to: {
      kind: 'Service',
      name: 'service',
    },
    selected: false,
    tlsEnabled: false,
  };
  render(IngressRouteColumnBackend, { object: routeUI });

  const backend = ingressRouteUtils.getBackends(routeUI)[0];
  const text = screen.getByText(backend);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-[var(--pd-table-body-text)]');
});
