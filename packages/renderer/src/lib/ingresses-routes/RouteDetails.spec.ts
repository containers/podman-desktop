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

import type { V1Route } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isKubernetesExperimentalMode } from '/@/lib/kube/resources-listen';
import {
  initListExperimental,
  initListsNonExperimental,
  type initListsReturnType,
} from '/@/lib/kube/tests-helpers/init-lists';
import { lastPage } from '/@/stores/breadcrumb';
import * as states from '/@/stores/kubernetes-contexts-state';

import RouteDetails from './RouteDetails.svelte';

const route: V1Route = {
  apiVersion: 'route.openshift.io/v1',
  kind: 'Route',
  metadata: {
    name: 'my-route',
    namespace: 'default',
  },
  spec: {
    host: '',
    port: undefined,
    path: undefined,
    tls: {
      insecureEdgeTerminationPolicy: '',
      termination: '',
    },
    to: {
      kind: '',
      name: '',
      weight: 0,
    },
    wildcardPolicy: '',
  },
};

vi.mock(import('/@/lib/kube/resources-listen'), async importOriginal => {
  // we want to keep the original nonVerbose
  const original = await importOriginal();
  return {
    ...original,
    listenResources: vi.fn(),
    isKubernetesExperimentalMode: vi.fn(),
  };
});

vi.mock(import('/@/stores/kubernetes-contexts-state'));

beforeEach(() => {
  vi.resetAllMocks();
  router.goto('http://localhost:3000');
});

describe.each<{
  experimental: boolean;
  initLists: (routes: KubernetesObject[]) => initListsReturnType;
}>([
  {
    experimental: false,
    initLists: initListsNonExperimental({
      onResourcesStore: store => (vi.mocked(states).kubernetesCurrentContextRoutes = store),
    }),
  },
  {
    experimental: true,
    initLists: initListExperimental({ resourceName: 'routes' }),
  },
])('is experimental: $experimental', ({ experimental, initLists }) => {
  beforeEach(() => {
    vi.mocked(isKubernetesExperimentalMode).mockResolvedValue(experimental);
  });

  test('Expect redirect to previous page if route is deleted', async () => {
    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
    const routerGotoSpy = vi.spyOn(router, 'goto');

    // mock object store
    const list = initLists([route]);

    // remove route from the store when we call delete
    vi.mocked(window.kubernetesDeleteRoute).mockImplementation(async () => {
      list.updateResources([]);
    });

    // define a fake lastPage so we can check where we will be redirected
    lastPage.set({ name: 'Fake Previous', path: '/last' });

    // render the component
    render(RouteDetails, { name: 'my-route', namespace: 'default' });

    await vi.waitFor(() => {
      expect(screen.getByText('my-route')).toBeInTheDocument();
    });

    // grab current route
    const currentRoute = window.location;
    expect(currentRoute.href).toBe('http://localhost:3000/');

    // click on delete button
    const deleteButton = screen.getByRole('button', { name: 'Delete Route' });
    await fireEvent.click(deleteButton);

    expect(window.showMessageBox).toHaveBeenCalledOnce();

    // Wait for confirmation modal to disappear after clicking on delete
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // check that delete method has been called
    expect(window.kubernetesDeleteRoute).toHaveBeenCalled();

    // expect that we have called the router when page has been removed
    // to jump to the previous page
    expect(routerGotoSpy).toBeCalledWith('/last');

    // confirm updated route
    const afterRoute = window.location;
    expect(afterRoute.href).toBe('http://localhost:3000/last');
  });
});
