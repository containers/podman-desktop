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

import type { NavigationPage } from './navigation-page.js';

// Define the type mapping for parameters
export interface NavigationParameters {
  [NavigationPage.CONTAINERS]: never;
  [NavigationPage.CONTAINER]: { id: string };
  [NavigationPage.CONTAINER_EXPORT]: { id: string };
  [NavigationPage.CONTAINER_LOGS]: { id: string };
  [NavigationPage.CONTAINER_INSPECT]: { id: string };
  [NavigationPage.CONTAINER_TERMINAL]: { id: string };
  [NavigationPage.CONTAINER_KUBE]: { id: string };
  [NavigationPage.DEPLOY_TO_KUBE]: { id: string; engineId: string };
  [NavigationPage.IMAGES]: never;
  [NavigationPage.IMAGE]: { id: string; engineId: string; tag: string };
  [NavigationPage.PODS]: never;
  [NavigationPage.POD]: { kind: string; name: string; engineId: string };
  [NavigationPage.VOLUMES]: never;
  [NavigationPage.VOLUME]: { name: string };
  [NavigationPage.CONTRIBUTION]: { name: string };
  [NavigationPage.TROUBLESHOOTING]: never;
  [NavigationPage.HELP]: never;
  [NavigationPage.WEBVIEW]: { id: string };
  [NavigationPage.AUTHENTICATION]: never;
  [NavigationPage.RESOURCES]: never;
  [NavigationPage.EDIT_CONTAINER_CONNECTION]: { provider: string; name: string };
}

// the parameters property is optional when the NavigationParameters say it is
export type NavigationRequest<T extends NavigationPage> = NavigationParameters[T] extends never
  ? {
      page: T;
    }
  : {
      page: T;
      parameters: NavigationParameters[T];
    };
