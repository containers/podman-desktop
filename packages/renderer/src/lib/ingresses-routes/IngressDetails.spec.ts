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

import type { KubernetesObject, V1Ingress } from '@kubernetes/client-node';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { router } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import IngressRouteDetails from './IngressDetails.svelte';

const kubernetesDeleteIngressMock = vi.fn();

const ingress: V1Ingress = {
  metadata: {
    name: 'my-ingress',
    namespace: 'default',
  },
  status: {},
};

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {
    kubernetesCurrentContextIngresses: vi.fn(),
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'kubernetesDeleteIngress', { value: kubernetesDeleteIngressMock });
  Object.defineProperty(window, 'kubernetesReadNamespacedIngress', { value: vi.fn() });
});

test('Expect redirect to previous page if ingress is deleted', async () => {
  const routerGotoSpy = vi.spyOn(router, 'goto');

  // mock object store
  const ingresses = writable<KubernetesObject[]>([ingress]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = ingresses;

  // remove ingress from the store when we call delete
  kubernetesDeleteIngressMock.mockImplementation(() => {
    ingresses.set([]);
  });

  // define a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(IngressRouteDetails, { name: 'my-ingress', namespace: 'default' });
  expect(screen.getByText('my-ingress')).toBeInTheDocument();

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Ingress' });
  await fireEvent.click(deleteButton);

  // check that delete method has been called
  expect(kubernetesDeleteIngressMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // confirm updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});
