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

import type { V1Route } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { PodInfoContainerUI } from '/@/lib/pod/PodInfoUI';

import PodActions from './PodActions.svelte';
import type { PodUI } from './PodUI';

const restartMock = vi.fn();
const deleteMock = vi.fn();

class PodUIImpl {
  #status: string;
  constructor(
    public name: string,
    initialStatus: string,
    public namespace: string,
    public selected: boolean,
    public containers: PodInfoContainerUI[],
  ) {
    this.#status = initialStatus;
  }
  set status(status: string) {
    this.#status = status;
  }
  get status(): string {
    return this.#status;
  }
}

const pod: PodUI = new PodUIImpl('', '', '', false, []);

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeAll(() => {
  Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserver });
});

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.kubernetesListRoutes).mockResolvedValue([]);
  vi.mocked(window.kubernetesGetCurrentNamespace).mockResolvedValue('ns');
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({ metadata: { labels: { app: 'foo' } } });
  vi.mocked(window.restartKubernetesPod).mockImplementation(restartMock);
  vi.mocked(window.kubernetesDeletePod).mockImplementation(deleteMock);
  vi.mocked(window.openExternal).mockResolvedValue(undefined);
});

test('Check deleting pod', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });

  render(PodActions, { pod });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledOnce();

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  expect(pod.status).toEqual('DELETING');
  expect(deleteMock).toHaveBeenCalled();
});

test('Check restarting pod', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });

  render(PodActions, { pod });

  // click on restart button
  const restartButton = screen.getByRole('button', { name: 'Restart Pod' });
  await fireEvent.click(restartButton);

  expect(pod.status).toEqual('RESTARTING');
  expect(restartMock).toHaveBeenCalled();
});

test('Expect kubernetes route to be displayed', async () => {
  const routeName = 'route.name';
  const routeHost = 'host.local';

  vi.mocked(window.kubernetesListRoutes).mockResolvedValue([
    { metadata: { labels: { app: 'foo' }, name: routeName }, spec: { host: routeHost } } as unknown as V1Route,
  ]);

  pod.status = 'RUNNING';
  render(PodActions, { pod: pod });

  const openRouteButton = await screen.findByRole('button', { name: `Open ${routeName}` });
  expect(openRouteButton).toBeVisible();
  expect(openRouteButton).toBeEnabled();

  await fireEvent.click(openRouteButton);

  expect(window.openExternal).toHaveBeenCalledWith(`http://${routeHost}`);
});

test('Expect kubernetes route to be displayed but disabled', async () => {
  render(PodActions, { pod: pod });

  const openRouteButton = await screen.findByRole('button', { name: `Open Browser` });
  expect(openRouteButton).toBeVisible();
  expect(openRouteButton).toBeDisabled();
});

test('Expect kubernetes routes kebab menu to be displayed', async () => {
  vi.mocked(window.kubernetesListRoutes).mockResolvedValue([
    { metadata: { labels: { app: 'foo' }, name: 'route1.name' }, spec: { host: 'host1.local' } } as unknown as V1Route,
    { metadata: { labels: { app: 'foo' }, name: 'route2.name' }, spec: { host: 'host2.local' } } as unknown as V1Route,
  ]);

  render(PodActions, { pod: pod });

  const openRouteButton = await screen.findByRole('button', { name: 'Open Kubernetes Routes' });
  expect(openRouteButton).toBeVisible();

  await fireEvent.click(openRouteButton);

  const routesDropDownMenu = await screen.findByTitle('Drop Down Menu Items');
  expect(routesDropDownMenu).toBeVisible();
});
