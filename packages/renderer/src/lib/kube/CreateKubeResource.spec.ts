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

import type { KubernetesObject } from '@kubernetes/client-node';
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import CreateKubeResource from '/@/lib/kube/CreateKubeResource.svelte';

vi.mock('tinro', () => ({
  router: {
    goto: vi.fn(),
  },
}));

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      // mandatory mock
      navigator: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
      getComputedStyle: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      // the event we need
      kubernetesGetCurrentContextName: vi.fn(),
      showMessageBox: vi.fn(),
      kubernetesApplyResourcesFromYAML: vi.fn(),
    },
  });
});

const CURRENT_CONTEXT = 'dummy-context';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.kubernetesGetCurrentContextName).mockResolvedValue(CURRENT_CONTEXT);
  vi.mocked(window.getComputedStyle).mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
  } as unknown as CSSStyleDeclaration);
});

test('expect close button to redirect to last page', async () => {
  const { getByTitle } = render(CreateKubeResource);

  const closeBtn = getByTitle('Close');
  expect(closeBtn).toBeDefined();

  expect(router.goto).not.toHaveBeenCalled();
  await userEvent.click(closeBtn);

  await vi.waitFor(() => {
    expect(router.goto).toHaveBeenCalledWith('/');
  });
});

test('expect warning message box if kubernetesApplyResourcesFromYAML return an empty array', async () => {
  // return an empty array
  vi.mocked(window.kubernetesApplyResourcesFromYAML).mockResolvedValue([]);

  const { getByTitle } = render(CreateKubeResource);

  const createBtn = getByTitle('Create Resource');
  expect(createBtn).toBeDefined();

  expect(router.goto).not.toHaveBeenCalled();
  await userEvent.click(createBtn);

  await vi.waitFor(() => {
    expect(window.showMessageBox).toHaveBeenCalledWith({
      title: 'Kubernetes',
      type: 'warning',
      message: `No resource(s) were applied.`,
      buttons: ['OK'],
    });
  });
  // no redirect
  expect(router.goto).not.toHaveBeenCalled();
});

test('expect error message box if kubernetesApplyResourcesFromYAML reject', async () => {
  // return an empty array
  vi.mocked(window.kubernetesApplyResourcesFromYAML).mockRejectedValue(new Error('Dummy error'));

  const { getByTitle } = render(CreateKubeResource);

  const createBtn = getByTitle('Create Resource');
  expect(createBtn).toBeDefined();

  expect(router.goto).not.toHaveBeenCalled();
  await userEvent.click(createBtn);

  await vi.waitFor(() => {
    expect(window.showMessageBox).toHaveBeenCalledWith({
      title: 'Kubernetes',
      type: 'error',
      message: 'Could not apply Kubernetes YAML: Error: Dummy error',
      buttons: ['OK'],
    });
  });
  // no redirect
  expect(router.goto).not.toHaveBeenCalled();
});

test('expect progress to be visible until kubernetesApplyResourcesFromYAML resolve', async () => {
  let resolve: ((value: KubernetesObject[]) => void) | undefined;
  const promise = new Promise<KubernetesObject[]>(res => {
    resolve = res;
  });
  expect(resolve).toBeDefined();

  // return an empty array
  vi.mocked(window.kubernetesApplyResourcesFromYAML).mockReturnValue(promise);

  const { getByTitle, queryByRole } = render(CreateKubeResource);

  const createBtn = getByTitle('Create Resource');
  expect(createBtn).toBeDefined();

  expect(router.goto).not.toHaveBeenCalled();
  await userEvent.click(createBtn);

  // must be visible while kubernetesApplyResourcesFromYAML is pending
  await vi.waitFor(() => {
    const progress = queryByRole('progressbar');
    expect(progress).toBeDefined();
  });

  // resolve kubernetesApplyResourcesFromYAML
  resolve?.([]);

  // must disappear after resolution
  await vi.waitFor(() => {
    const progress = queryByRole('progressbar');
    expect(progress).toBeNull();
  });
});

test.each([
  {
    kind: 'Pod',
    href: '/pods',
  },
  {
    kind: 'Service',
    href: '/kubernetes/services',
  },
  {
    kind: 'PersistentVolumeClaim',
    href: '/kubernetes/persistentvolumeclaims',
  },
  {
    kind: 'ConfigMap',
    href: '/kubernetes/configmapsSecrets',
  },
  {
    kind: 'Secret',
    href: '/kubernetes/configmapsSecrets',
  },
  {
    kind: 'Ingress',
    href: '/kubernetes/ingressesRoutes',
  },
  {
    kind: 'Deployment',
    href: '/kubernetes/deployments',
  },
])('create $kind kubernetes resource should redirect to $href', async ({ kind, href }) => {
  // mock resolved object with specific kind
  vi.mocked(window.kubernetesApplyResourcesFromYAML).mockResolvedValue([
    {
      kind: kind,
    },
  ]);

  const { getByTitle } = render(CreateKubeResource);

  const createBtn = getByTitle('Create Resource');

  expect(router.goto).not.toHaveBeenCalled();
  await userEvent.click(createBtn);

  await vi.waitFor(() => {
    expect(router.goto).toHaveBeenCalledWith(href);
  });
});
