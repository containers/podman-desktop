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

export enum NavigationPage {
  CONTAINERS = 'containers',
  CONTAINER_EXPORT = 'container-export',
  CONTAINER = 'container',
  CONTAINER_LOGS = 'container-logs',
  CONTAINER_INSPECT = 'container-inspect',
  CONTAINER_TERMINAL = 'container-terminal',
  CONTAINER_KUBE = 'container-kube',
  IMAGES = 'images',
  IMAGE = 'image',
  PODS = 'pods',
  POD = 'pod',
  VOLUMES = 'volumes',
  VOLUME = 'volume',
  CONTRIBUTION = 'contribution',
  TROUBLESHOOTING = 'troubleshooting',
  HELP = 'help',
  WEBVIEW = 'webview',
  AUTHENTICATION = 'authentication',
  RESOURCES = 'resources',
  EDIT_CONTAINER_CONNECTION = 'edit-container-connection',
  DEPLOY_TO_KUBE = 'deploy-to-kube',
}
