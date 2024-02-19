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

import { NavigationPage } from '../../main/src/plugin/navigation/navigation-page';
import { router } from 'tinro';

/**
 * Navigation hints for setting current page and history (breadcrumbs):
 *  root    - root pages that reset the history
 *  details - additional pages that should be tracked in the history
 *  tab     - tabs or other sub-pages that affect the URL, but do not
 *            change what the 'current' page is.
 */
export type NavigationHint = 'root' | 'details' | 'tab';

export const handleNavigation = (page: NavigationPage, parameters?: { [key: string]: string }) => {
  switch (page) {
    case NavigationPage.CONTAINERS:
      router.goto('/containers');
      break;
    case NavigationPage.CONTAINER:
      router.goto(`/containers/${parameters?.['id']}/`);
      break;
    case NavigationPage.CONTAINER_LOGS:
      router.goto(`/containers/${parameters?.['id']}/logs`);
      break;
    case NavigationPage.CONTAINER_INSPECT:
      router.goto(`/containers/${parameters?.['id']}/inspect`);
      break;
    case NavigationPage.CONTAINER_TERMINAL:
      router.goto(`/containers/${parameters?.['id']}/terminal`);
      break;
    case NavigationPage.IMAGES:
      router.goto(`/images`);
      break;
    case NavigationPage.IMAGE:
      if (parameters) {
        const tagBase64 = Buffer.from(parameters['tag']).toString('base64');
        router.goto(`/images/${parameters['id']}/${parameters['engineId']}/${tagBase64}`);
      }
      break;
    case NavigationPage.PODS:
      router.goto(`/pods`);
      break;
    case NavigationPage.POD:
      router.goto(`/pods/${parameters?.['kind']}/${parameters?.['name']}/${parameters?.['engineId']}/`);
      break;
    case NavigationPage.VOLUMES:
      router.goto('/volumes');
      break;
    case NavigationPage.VOLUME:
      router.goto(`/volumes/${parameters?.['name']}/`);
      break;
    case NavigationPage.CONTRIBUTION:
      router.goto(`/contribs/${parameters?.['name']}/`);
      break;
    case NavigationPage.TROUBLESHOOTING:
      router.goto('/troubleshooting/repair-connections');
      break;
    case NavigationPage.HELP:
      router.goto('/help');
      break;
    case NavigationPage.WEBVIEW:
      router.goto(`/webviews/${parameters?.['id']}`);
      break;
  }
};
