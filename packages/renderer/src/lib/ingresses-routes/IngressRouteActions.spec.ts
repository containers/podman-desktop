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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import IngressRouteActions from './IngressRouteActions.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

const updateMock = vi.fn();
const deleteIngressMock = vi.fn();
const deleteRoutesMock = vi.fn();

beforeEach(() => {
  (window as any).kubernetesDeleteIngress = deleteIngressMock;
  (window as any).kubernetesDeleteRoute = deleteRoutesMock;
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status deleting ingress', async () => {
  const ingressUI: IngressUI = {
    name: 'my-ingress',
    namespace: 'test-namespace',
    status: 'RUNNING',
    selected: false,
  };

  render(IngressRouteActions, { ingressRoute: ingressUI, onUpdate: updateMock });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Ingress' });
  await fireEvent.click(deleteButton);

  expect(ingressUI.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteIngressMock).toHaveBeenCalled();
});

test('Expect no error and status deleting route', async () => {
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

  render(IngressRouteActions, { ingressRoute: routeUI, onUpdate: updateMock });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Route' });
  await fireEvent.click(deleteButton);

  expect(routeUI.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteRoutesMock).toHaveBeenCalled();
});
