/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { InferredNavigationRequest } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import { router } from 'tinro';

/**
 * Navigation hints for setting current page and history (breadcrumbs):
 *  root    - root pages that reset the history
 *  details - additional pages that should be tracked in the history
 *  tab     - tabs or other sub-pages that affect the URL, but do not
 *            change what the 'current' page is.
 */
export type NavigationHint = 'root' | 'details' | 'tab';

export const resolveRoute = (request: InferredNavigationRequest<NavigationPage>): string => {
  // eslint-disable-next-line sonarjs/max-switch-cases
  switch (request.page) {
    case NavigationPage.DASHBOARD:
      return '/';
    case NavigationPage.CONTAINERS:
      return '/containers';
    case NavigationPage.CONTAINER_EXPORT:
      return `/containers/${request.parameters.id}/export`;
    case NavigationPage.CONTAINER:
      return `/containers/${request.parameters.id}/`;
    case NavigationPage.EXISTING_IMAGE_CREATE_CONTAINER:
      return `/images/existing-image-create-container`;
    case NavigationPage.CONTAINER_SUMMARY:
      return `/containers/${request.parameters.id}/summary`;
    case NavigationPage.CONTAINER_LOGS:
      return `/containers/${request.parameters.id}/logs`;
    case NavigationPage.CONTAINER_INSPECT:
      return `/containers/${request.parameters.id}/inspect`;
    case NavigationPage.CONTAINER_TERMINAL:
      return `/containers/${request.parameters.id}/terminal`;
    case NavigationPage.CONTAINER_TTY:
      return `/containers/${request.parameters.id}/tty`;
    case NavigationPage.CONTAINER_KUBE:
      return `/containers/${request.parameters.id}/kube`;
    case NavigationPage.DEPLOY_TO_KUBE:
      return `/deploy-to-kube/${request.parameters.id}/${request.parameters.engineId}`;
    case NavigationPage.IMAGES:
      return `/images`;
    case NavigationPage.IMAGE_BUILD:
      return `/images/build?taskId=${request.parameters.taskId}`;
    case NavigationPage.IMAGE:
      return `/images/${request.parameters.id}/${request.parameters.engineId}/${btoa(request.parameters.tag)}/summary`;
    case NavigationPage.IMAGE_RUN:
      return `/images/${request.parameters.id}/${request.parameters.engineId}/${btoa(request.parameters.tag)}/run/basic`;
    case NavigationPage.MANIFEST:
      return `/manifests/${request.parameters.id}/${request.parameters.engineId}/${btoa(request.parameters.tag)}/summary`;
    case NavigationPage.ONBOARDING:
      return `/preferences/onboarding/${request.parameters.extensionId}`;
    case NavigationPage.PODMAN_PODS:
      return `/pods`;
    case NavigationPage.PODMAN_POD_SUMMARY:
      return `/pods/podman/${request.parameters.name}/${request.parameters.engineId}/summary`;
    case NavigationPage.PODMAN_POD:
      return `/pods/podman/${request.parameters.name}/${request.parameters.engineId}/`;
    case NavigationPage.VOLUMES:
      return '/volumes';
    case NavigationPage.VOLUME:
      return `/volumes/${request.parameters.name}/${request.parameters.engineId}/summary`;
    case NavigationPage.CONTRIBUTION:
      return `/contribs/${request.parameters.name}/`;
    case NavigationPage.TROUBLESHOOTING:
      return '/troubleshooting/repair-connections';
    case NavigationPage.HELP:
      return '/help';
    case NavigationPage.CLI_TOOLS:
      return `/preferences/cli-tools`;
    case NavigationPage.PROVIDER_TASK:
      return `/preferences/resources/provider-task/${request.parameters.internalId}/${request.parameters.taskId}`;
    case NavigationPage.WEBVIEW:
      return `/webviews/${request.parameters.id}`;
    case NavigationPage.AUTHENTICATION:
      return '/preferences/authentication-providers';
    case NavigationPage.RESOURCES:
      return '/preferences/resources';
    case NavigationPage.EDIT_CONTAINER_CONNECTION:
      return `/preferences/container-connection/edit/${request.parameters.provider}/${request.parameters.name}`;
    case NavigationPage.EXPERIMENTAL_FEATURES:
      return '/preferences/experimental';
    case NavigationPage.CREATE_PROVIDER_CONNECTION:
      return `/preferences/resources/provider/${request.parameters.provider}`;
    case NavigationPage.NETWORKS:
      return '/networks';
    case NavigationPage.NETWORK:
      return `/networks/${request.parameters.name}/${request.parameters.engineId}/summary`;
    case NavigationPage.NETWORK_CREATE:
      return '/networks/create';
    case NavigationPage.EXTENSIONS_CATALOG:
      return `/extensions?screen=catalog&searchTerm=${encodeURIComponent(request.parameters.searchTerm ?? '')}`;
    case NavigationPage.CONTAINER_CONNECTION:
      return `/preferences/container-connection/view/${request.parameters.provider}/${btoa(request.parameters.name)}/${btoa(request.parameters.socketPath)}/summary`;
    case NavigationPage.KUBERNETES_CONNECTION:
      return `/preferences/kubernetes-connection/${request.parameters.provider}/${btoa(request.parameters.apiURL)}/summary`;
    case NavigationPage.VM_CONNECTION:
      return `/preferences/vm-connection/${request.parameters.provider}/${request.parameters.name}/terminal`;
    case NavigationPage.SECRETS:
      return `/secrets`;
    case NavigationPage.SECRET:
      return `/secrets/${encodeURIComponent(request.parameters.engineId)}/${encodeURIComponent(request.parameters.id)}/summary`;
    case NavigationPage.SECRET_CREATE:
      return '/secrets/create';
  }
};

export const handleNavigation = (request: InferredNavigationRequest<NavigationPage>): void => {
  router.goto(resolveRoute(request));
};
