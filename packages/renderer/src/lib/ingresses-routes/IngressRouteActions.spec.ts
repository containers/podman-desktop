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
import { afterEach, beforeAll, expect, test, vi } from 'vitest';

import IngressRouteActions from './IngressRouteActions.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

const updateMock = vi.fn();
const deleteIngressMock = vi.fn();
const deleteRoutesMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'kubernetesDeleteIngress', { value: deleteIngressMock });
  Object.defineProperty(window, 'kubernetesDeleteRoute', { value: deleteRoutesMock });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

class StatusHolder {
  #status: string;
  constructor(initialStatus: string) {
    this.#status = initialStatus;
  }
  set status(status: string) {
    this.#status = status;
  }
  get status(): string {
    return this.#status;
  }
}

test('Expect no error and status deleting ingress', async () => {
  const ingressUI: IngressUI = new StatusHolder('RUNNING') as unknown as IngressUI;
  ingressUI.name = 'my-ingress';
  ingressUI.namespace = 'test-namespace';
  ingressUI.selected = false;

  render(IngressRouteActions, { ingressRoute: ingressUI, onUpdate: updateMock });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Ingress' });
  await fireEvent.click(deleteButton);

  expect(ingressUI.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteIngressMock).toHaveBeenCalled();
});

test('Expect no error and status deleting route', async () => {
  const routeUI: RouteUI = new StatusHolder('RUNNING') as unknown as RouteUI;
  routeUI.name = 'my-route';
  routeUI.namespace = 'test-namespace';
  routeUI.status = 'RUNNING';
  routeUI.host = 'foo.bar.com';
  routeUI.port = '80';
  routeUI.to = {
    kind: 'Service',
    name: 'service',
  };
  routeUI.selected = false;
  routeUI.tlsEnabled = false;

  render(IngressRouteActions, { ingressRoute: routeUI, onUpdate: updateMock });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Route' });
  await fireEvent.click(deleteButton);

  expect(routeUI.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteRoutesMock).toHaveBeenCalled();
});
