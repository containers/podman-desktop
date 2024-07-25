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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import IngressRouteColumnName from './IngressRouteColumnName.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

const ingressUI: IngressUI = {
  name: 'my-ingress',
  namespace: 'test-namespace',
  status: 'RUNNING',
  selected: false,
};

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

test('Expect simple column styling with Ingress', async () => {
  render(IngressRouteColumnName, { object: ingressUI });

  const text = screen.getByText(ingressUI.name);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-[var(--pd-table-body-text-highlight)]');
});

test('Expect clicking on Ingress works', async () => {
  render(IngressRouteColumnName, { object: ingressUI });

  const text = screen.getByText(ingressUI.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');

  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith('/ingressesRoutes/ingress/my-ingress/test-namespace/summary');
});

test('Expect simple column styling with Route', async () => {
  render(IngressRouteColumnName, { object: routeUI });

  const text = screen.getByText(routeUI.name);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-[var(--pd-table-body-text-highlight)]');
});

test('Expect clicking on Route works', async () => {
  render(IngressRouteColumnName, { object: routeUI });

  const text = screen.getByText(routeUI.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');

  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith('/ingressesRoutes/route/my-route/test-namespace/summary');
});

test('Expect to show namespace in column', async () => {
  render(IngressRouteColumnName, { object: routeUI });

  const text = screen.getByText(routeUI.namespace);
  expect(text).toBeInTheDocument();
});
