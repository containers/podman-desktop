/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { NavigationPage } from '/@api/navigation-page';
import type { NavigationRequest } from '/@api/navigation-request';

// help method to ensure the handleNavigation is able to infer type properly through the switch
// ref https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type InferredNavigationRequest<T extends NavigationPage> = T extends NavigationPage ? NavigationRequest<T> : never;

/**
 * Navigation hints for setting current page and history (breadcrumbs):
 *  root    - root pages that reset the history
 *  details - additional pages that should be tracked in the history
 *  tab     - tabs or other sub-pages that affect the URL, but do not
 *            change what the 'current' page is.
 */
export type NavigationHint = 'root' | 'details' | 'tab';

export const handleNavigation = (request: InferredNavigationRequest<NavigationPage>) => {
  switch (request.page) {
    case NavigationPage.CONTAINERS:
      router.goto('/containers');
      break;
    case NavigationPage.CONTAINER_EXPORT:
      router.goto(`/containers/${request.parameters.id}/export`);
      break;
    case NavigationPage.CONTAINER:
      router.goto(`/containers/${request.parameters.id}/`);
      break;
    case NavigationPage.CONTAINER_LOGS:
      router.goto(`/containers/${request.parameters.id}/logs`);
      break;
    case NavigationPage.CONTAINER_INSPECT:
      router.goto(`/containers/${request.parameters.id}/inspect`);
      break;
    case NavigationPage.CONTAINER_TERMINAL:
      router.goto(`/containers/${request.parameters.id}/terminal`);
      break;
    case NavigationPage.CONTAINER_KUBE:
      router.goto(`/containers/${request.parameters.id}/kube`);
      break;
    case NavigationPage.DEPLOY_TO_KUBE:
      router.goto(`/deploy-to-kube/${request.parameters.id}/${request.parameters.engineId}`);
      break;
    case NavigationPage.IMAGES:
      router.goto(`/images`);
      break;
    case NavigationPage.IMAGE:
      router.goto(
        `/images/${request.parameters.id}/${request.parameters.engineId}/${Buffer.from(request.parameters.tag).toString('base64')}`,
      );
      break;
    case NavigationPage.PODS:
      router.goto(`/pods`);
      break;
    case NavigationPage.POD:
      router.goto(`/pods/${request.parameters.kind}/${request.parameters.name}/${request.parameters.engineId}/`);
      break;
    case NavigationPage.VOLUMES:
      router.goto('/volumes');
      break;
    case NavigationPage.VOLUME:
      router.goto(`/volumes/${request.parameters.name}/`);
      break;
    case NavigationPage.CONTRIBUTION:
      router.goto(`/contribs/${request.parameters.name}/`);
      break;
    case NavigationPage.TROUBLESHOOTING:
      router.goto('/troubleshooting/repair-connections');
      break;
    case NavigationPage.HELP:
      router.goto('/help');
      break;
    case NavigationPage.WEBVIEW:
      router.goto(`/webviews/${request.parameters.id}`);
      break;
    case NavigationPage.AUTHENTICATION:
      router.goto('/preferences/authentication-providers');
      break;
    case NavigationPage.RESOURCES:
      router.goto('/preferences/resources');
      break;
    case NavigationPage.EDIT_CONTAINER_CONNECTION:
      router.goto(`/preferences/container-connection/edit/${request.parameters.provider}/${request.parameters.name}`);
      break;
  }
};
