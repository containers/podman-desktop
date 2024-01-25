/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { test, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

import DeploymentDetails from './DeploymentDetails.svelte';

import { router } from 'tinro';
import { lastPage } from '/@/stores/breadcrumb';
import { deployments } from '/@/stores/deployments';
import type { V1Deployment } from '@kubernetes/client-node';

const kubernetesDeleteDeploymentMock = vi.fn();

const deployment: V1Deployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'my-deployment',
    namespace: 'default',
  },
  spec: {
    replicas: 2,
    selector: {},
    template: {},
  },
};

beforeAll(() => {
  (window as any).kubernetesDeleteDeployment = kubernetesDeleteDeploymentMock;
  (window as any).kubernetesReadNamespacedDeployment = vi.fn();
});

test('Expect redirect to previous page if deployment is deleted', async () => {
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  const routerGotoSpy = vi.spyOn(router, 'goto');
  deployments.set([deployment]);

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
