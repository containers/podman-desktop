/**********************************************************************
 * Copyright (C) 2023,2024 Red Hat, Inc.
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

import type { CoreV1Event, KubernetesObject, V1Deployment } from '@kubernetes/client-node';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { router } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import DeploymentDetails from './DeploymentDetails.svelte';
import * as deploymentDetailsSummary from './DeploymentDetailsSummary.svelte';

const kubernetesDeleteDeploymentMock = vi.fn();

const deployment: V1Deployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    uid: '12345678',
    name: 'my-deployment',
    namespace: 'default',
  },
  spec: {
    replicas: 2,
    selector: {},
    template: {},
  },
};

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {
    kubernetesCurrentContextDeployments: vi.fn(),
    kubernetesCurrentContextEvents: vi.fn(),
  };
});

const showMessageBoxMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'kubernetesDeleteDeployment', { value: kubernetesDeleteDeploymentMock });
  Object.defineProperty(window, 'kubernetesReadNamespacedDeployment', { value: vi.fn() });
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
});

test('Expect redirect to previous page if deployment is deleted', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  const routerGotoSpy = vi.spyOn(router, 'goto');

  // mock object stores
  const deployments = writable<KubernetesObject[]>([deployment]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = deployments;
  const events = writable<CoreV1Event[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextEvents = events;

  // remove deployment from the store when we call delete
  kubernetesDeleteDeploymentMock.mockImplementation(() => {
    deployments.set([]);
  });

  // define a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(DeploymentDetails, { name: 'my-deployment', namespace: 'default' });
  expect(screen.getByText('my-deployment')).toBeInTheDocument();

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Deployment' });
  await fireEvent.click(deleteButton);
  expect(showMessageBoxMock).toHaveBeenCalledOnce();

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // check that delete method has been called
  expect(kubernetesDeleteDeploymentMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // confirm updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('Expect DeploymentDetails to be called with related events only', async () => {
  const deploymentDetailsSummarySpy = vi.spyOn(deploymentDetailsSummary, 'default');
  // mock object stores
  const deploymentsStore = writable<KubernetesObject[]>([deployment]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = deploymentsStore;

  const events: CoreV1Event[] = [
    {
      metadata: {
        name: 'event1',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event2',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event3',
      },
      involvedObject: { uid: '1234' },
    },
  ];
  const eventsStore = writable<CoreV1Event[]>(events);
  vi.mocked(kubeContextStore).kubernetesCurrentContextEvents = eventsStore;

  vi.mocked(window.kubernetesReadNamespacedDeployment).mockResolvedValue(deployment);

  render(DeploymentDetails, { name: 'my-deployment', namespace: 'default' });
  router.goto('summary');
  await waitFor(() => {
    expect(deploymentDetailsSummarySpy).toHaveBeenCalledWith(expect.anything(), {
      deployment: deployment,
      events: [events[0], events[1]],
    });
  });
});
