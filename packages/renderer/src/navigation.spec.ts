/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import { NavigationPage } from '@desktop-framework/api';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { handleNavigation } from './navigation';

// mock the router
vi.mock(import('tinro'));

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

test(`Test navigationHandle for ${NavigationPage.CONTAINER_SUMMARY}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_SUMMARY, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/summary');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_LOGS}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_LOGS, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/logs');
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_TTY}`, () => {
  handleNavigation({ page: NavigationPage.CONTAINER_TTY, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/tty');
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
  handleNavigation({ page: NavigationPage.IMAGE_BUILD, parameters: { taskId: 1 } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images/build?taskId=1');
});

test(`Test navigationHandle for ${NavigationPage.IMAGE}`, () => {
  handleNavigation({
    page: NavigationPage.IMAGE,
    parameters: { id: '123', engineId: 'dummyEngineId', tag: 'dummyTag' },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images/123/dummyEngineId/ZHVtbXlUYWc=/summary');
});

test(`Test navigationHandle for ${NavigationPage.IMAGE_RUN}`, () => {
  handleNavigation({
    page: NavigationPage.IMAGE_RUN,
    parameters: { id: '123', engineId: 'dummyEngineId', tag: 'dummyTag' },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images/123/dummyEngineId/ZHVtbXlUYWc=/run/basic');
});

test(`Test navigationHandle for ${NavigationPage.MANIFEST}`, () => {
  handleNavigation({
    page: NavigationPage.MANIFEST,
    parameters: { id: '123', engineId: 'dummyEngineId', tag: 'dummyTag' },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/manifests/123/dummyEngineId/ZHVtbXlUYWc=/summary');
});

test(`Test navigationHandle for ${NavigationPage.ONBOARDING}`, () => {
  handleNavigation({
    page: NavigationPage.ONBOARDING,
    parameters: {
      extensionId: 'my.extension',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/onboarding/my.extension');
});

test(`Test navigationHandle for ${NavigationPage.PODMAN_PODS}`, () => {
  handleNavigation({ page: NavigationPage.PODMAN_PODS });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/pods');
});

test(`Test navigationHandle for ${NavigationPage.PODMAN_POD_SUMMARY}`, () => {
  handleNavigation({
    page: NavigationPage.PODMAN_POD_SUMMARY,
    parameters: {
      engineId: 'dummyEngineId',
      name: 'dummyPod',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/pods/podman/dummyPod/dummyEngineId/summary');
});

test(`Test navigationHandle for ${NavigationPage.PODMAN_POD}`, () => {
  handleNavigation({
    page: NavigationPage.PODMAN_POD,
    parameters: {
      engineId: 'dummyEngineId',
      name: 'dummyPod',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/pods/podman/dummyPod/dummyEngineId/');
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
      engineId: 'dummyEngineId',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/volumes/dummyVolumeName/dummyEngineId/summary');
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

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/resources/provider-task/dummyProviderId/55');
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

test(`Test navigationHandle for ${NavigationPage.EXPERIMENTAL_FEATURES}`, () => {
  handleNavigation({ page: NavigationPage.EXPERIMENTAL_FEATURES });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/experimental');
});

test(`Test navigationHandle for ${NavigationPage.CREATE_PROVIDER_CONNECTION}`, () => {
  handleNavigation({
    page: NavigationPage.CREATE_PROVIDER_CONNECTION,
    parameters: {
      provider: 'dummyProviderId',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/resources/provider/dummyProviderId');
});

test(`Test navigationHandle for ${NavigationPage.NETWORK}`, () => {
  handleNavigation({ page: NavigationPage.NETWORK, parameters: { name: 'network1', engineId: 'engineId1' } });
  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/networks/network1/engineId1/summary');
});

test(`Test navigationHandle for ${NavigationPage.NETWORK_CREATE}`, () => {
  handleNavigation({ page: NavigationPage.NETWORK_CREATE });
  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/networks/create');
});

test(`Test navigationHandle for ${NavigationPage.EXTENSIONS_CATALOG}`, () => {
  handleNavigation({
    page: NavigationPage.EXTENSIONS_CATALOG,
    parameters: {
      searchTerm: 'not:installed category:foo keyword:bar red hat',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/extensions?screen=catalog&searchTerm=not%3Ainstalled%20category%3Afoo%20keyword%3Abar%20red%20hat',
  );
});

test(`Test navigationHandle for ${NavigationPage.CONTAINER_CONNECTION}`, () => {
  handleNavigation({
    page: NavigationPage.CONTAINER_CONNECTION,
    parameters: {
      provider: 'dummyProviderId',
      name: 'dummyProviderName',
      socketPath: 'dummySocketPath',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/preferences/container-connection/view/dummyProviderId/ZHVtbXlQcm92aWRlck5hbWU=/ZHVtbXlTb2NrZXRQYXRo/summary',
  );
});

test(`Test navigationHandle for ${NavigationPage.KUBERNETES_CONNECTION}`, () => {
  handleNavigation({
    page: NavigationPage.KUBERNETES_CONNECTION,
    parameters: {
      provider: 'dummyProviderId',
      apiURL: 'dummyApiURL',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/preferences/kubernetes-connection/dummyProviderId/ZHVtbXlBcGlVUkw=/summary',
  );
});

test(`Test navigationHandle for ${NavigationPage.VM_CONNECTION}`, () => {
  handleNavigation({
    page: NavigationPage.VM_CONNECTION,
    parameters: {
      provider: 'dummyProviderId',
      name: 'dummyProviderName',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
    '/preferences/vm-connection/dummyProviderId/dummyProviderName/terminal',
  );
});

test(`Test navigationHandle for ${NavigationPage.SECRETS}`, () => {
  handleNavigation({ page: NavigationPage.SECRETS });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/secrets');
});

test(`Test navigationHandle for ${NavigationPage.SECRET}`, () => {
  handleNavigation({
    page: NavigationPage.SECRET,
    parameters: {
      id: 'secret/id',
      engineId: 'engine id',
    },
  });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/secrets/engine%20id/secret%2Fid/summary');
});

test(`Test navigationHandle for ${NavigationPage.SECRET_CREATE}`, () => {
  handleNavigation({ page: NavigationPage.SECRET_CREATE });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/secrets/create');
});
