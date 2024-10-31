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

import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { NavigationPage } from '/@api/navigation-page';

import { handleNavigation } from './navigation';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test(`Test navigationHandle for ${NavigationPage.DASHBOARD}`, () => {
  handleNavigation({ page: NavigationPage.DASHBOARD });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINERS}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINERS });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_EXPORT}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_EXPORT, parameters: { id: 'containerId' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/containerId/export');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_LOGS}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_LOGS, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/logs');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_INSPECT}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_INSPECT, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/inspect');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_TERMINAL}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_TERMINAL, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/terminal');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_KUBE}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_KUBE, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/kube');
});

test(`Test navigationHandle for ${NavigationPage.DEPLOY_TO_KUBE}`, () => {
  handleNavigation({ page: NavigationPage.DEPLOY_TO_KUBE, parameters: { id: '123', engineId: 'dummyEngineId' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/deploy-to-kube/123/dummyEngineId');
});

test(`Test navigationHandle for ${NavigationPage.IMAGES}`, () => {
  handleNavigation({ page: NavigationPage.IMAGES });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images');
});

test(`Test navigationHandle for ${NavigationPage.IMAGE_BUILD}`, () => {
  handleNavigation({ page: NavigationPage.IMAGE_BUILD });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images/build');
});

test(`Test navigationHandle for ${NavigationPage.IMAGE}`, () => {
  handleNavigation({
    page: NavigationPage.IMAGE,
    parameters: { id: '123', engineId: 'dummyEngineId', tag: 'dummyTag' },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images/123/dummyEngineId/ZHVtbXlUYWc=');
});

test(`Test navigationHandle for ${NavigationPage.PODS}`, () => {
  handleNavigation({ page: NavigationPage.PODS });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/pods');
});

test(`Test navigationHandle for ${NavigationPage.POD}`, () => {
  handleNavigation({
    page: NavigationPage.POD,
    parameters: {
      engineId: 'dummyEngineId',
      name: 'dummyPod',
      kind: 'kubernetes',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/pods/kubernetes/dummyPod/dummyEngineId/');
});

test(`Test navigationHandle for ${NavigationPage.VOLUMES}`, () => {
  handleNavigation({ page: NavigationPage.VOLUMES });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/volumes');
});

test(`Test navigationHandle for ${NavigationPage.VOLUME}`, () => {
  handleNavigation({
    page: NavigationPage.VOLUME,
    parameters: {
      name: 'dummyVolumeName',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/volumes/dummyVolumeName/');
});

test(`Test navigationHandle for ${NavigationPage.CONTRIBUTION}`, () => {
  handleNavigation({
    page: NavigationPage.CONTRIBUTION,
    parameters: {
      name: 'dummyContribution',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/contribs/dummyContribution/');
});

test(`Test navigationHandle for ${NavigationPage.TROUBLESHOOTING}`, () => {
  handleNavigation({ page: NavigationPage.TROUBLESHOOTING });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/troubleshooting/repair-connections');
});

test(`Test navigationHandle for ${NavigationPage.HELP}`, () => {
  handleNavigation({ page: NavigationPage.HELP });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/help');
});

test(`Test navigationHandle for ${NavigationPage.CLI_TOOLS}`, () => {
  handleNavigation({ page: NavigationPage.CLI_TOOLS });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/cli-tools');
});

test(`Test navigationHandle for ${NavigationPage.PROVIDER_TASK}`, () => {
  handleNavigation({
    page: NavigationPage.PROVIDER_TASK,
    parameters: {
      internalId: 'dummyProviderId',
      taskId: 55,
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/provider-task/dummyProviderId/55');
});

test(`Test navigationHandle for ${NavigationPage.WEBVIEW}`, () => {
  handleNavigation({
    page: NavigationPage.WEBVIEW,
    parameters: {
      id: 'dummyWebviewId',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/webviews/dummyWebviewId');
});

test(`Test navigationHandle for ${NavigationPage.AUTHENTICATION}`, () => {
  handleNavigation({ page: NavigationPage.AUTHENTICATION });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/authentication-providers');
});

test(`Test navigationHandle for ${NavigationPage.RESOURCES}`, () => {
  handleNavigation({ page: NavigationPage.RESOURCES });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/resources');
});

test(`Test navigationHandle for ${NavigationPage.EDIT_CONTAINER_CONNECTION}`, () => {
  handleNavigation({
    page: NavigationPage.EDIT_CONTAINER_CONNECTION,
    parameters: {
      provider: 'dummyProviderId',
      name: 'dummyProviderName',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/preferences/container-connection/edit/dummyProviderId/dummyProviderName',
  );
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_SERVICES}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_SERVICES,
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/services');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_SERVICE}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_SERVICE,
    parameters: {
      name: 'dummy-name',
      namespace: 'dummy-ns',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/services/dummy-name/dummy-ns/summary');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_DEPLOYMENTS}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_DEPLOYMENTS,
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/deployments');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_DEPLOYMENT}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_DEPLOYMENT,
    parameters: {
      name: 'dummy-name',
      namespace: 'dummy-ns',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/deployments/dummy-name/dummy-ns/summary');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_NODES}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_NODES,
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/nodes');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_NODE}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_NODE,
    parameters: {
      name: 'dummy-name',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/nodes/dummy-name/summary');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_PVCS}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_PVCS,
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/persistentvolumeclaims');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_PVC}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_PVC,
    parameters: {
      name: 'dummy-name',
      namespace: 'dummy-ns',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/persistentvolumeclaims/dummy-name/dummy-ns/summary');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_INGRESSES_ROUTES}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_INGRESSES_ROUTES,
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/ingressesRoutes');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_INGRESSES_ROUTE}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_INGRESSES_ROUTE,
    parameters: {
      name: 'dummy-name',
      namespace: 'dummy-ns',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/kubernetes/ingressesRoutes/ingress/dummy-name/dummy-ns/summary',
  );
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_CONFIGMAPS_SECRETS}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_CONFIGMAPS_SECRETS,
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/kubernetes/configmapsSecrets');
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_CONFIGMAP}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_CONFIGMAP,
    parameters: {
      name: 'dummy-name',
      namespace: 'dummy-ns',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/kubernetes/configmapsSecrets/configmap/dummy-name/dummy-ns/summary',
  );
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_SECRET}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_SECRET,
    parameters: {
      name: 'dummy-name',
      namespace: 'dummy-ns',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/kubernetes/configmapsSecrets/secret/dummy-name/dummy-ns/summary',
  );
});
