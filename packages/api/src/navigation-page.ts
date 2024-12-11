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
  DASHBOARD = 'dashboard',
  CONTAINERS = 'containers',
  CONTAINER_EXPORT = 'container-export',
  CONTAINER = 'container',
  CONTAINER_LOGS = 'container-logs',
  CONTAINER_INSPECT = 'container-inspect',
  CONTAINER_TERMINAL = 'container-terminal',
  CONTAINER_TTY = 'container-tty',
  CONTAINER_KUBE = 'container-kube',
  IMAGES = 'images',
  IMAGE_BUILD = 'image-build',
  IMAGE = 'image',
  ONBOARDING = 'preferences-onboarding',
  PODS = 'pods',
  POD = 'pod',
  VOLUMES = 'volumes',
  VOLUME = 'volume',
  CONTRIBUTION = 'contribution',
  TROUBLESHOOTING = 'troubleshooting',
  HELP = 'help',
  CLI_TOOLS = 'preferences-cli-tools',
  PROVIDER_TASK = 'preferences-provider-task',
  WEBVIEW = 'webview',
  AUTHENTICATION = 'authentication',
  RESOURCES = 'resources',
  EDIT_CONTAINER_CONNECTION = 'edit-container-connection',
  DEPLOY_TO_KUBE = 'deploy-to-kube',
  KUBERNETES_SERVICES = 'kubernetes-services',
  KUBERNETES_SERVICE = 'kubernetes-service',
  KUBERNETES_DEPLOYMENTS = 'kubernetes-deployments',
  KUBERNETES_DEPLOYMENT = 'kubernetes-deployment',
  KUBERNETES_NODES = 'kubernetes-nodes',
  KUBERNETES_NODE = 'kubernetes-node',
  KUBERNETES_PVCS = 'kubernetes-pvcs',
  KUBERNETES_PVC = 'kubernetes-pvc',
  KUBERNETES_INGRESSES_ROUTES = 'kubernetes-ingresses-routes',
  KUBERNETES_INGRESSES_ROUTE = 'kubernetes-ingresses-route',
  KUBERNETES_CONFIGMAPS_SECRETS = 'kubernetes-configmaps-secrets',
  KUBERNETES_CONFIGMAP = 'kubernetes-configmap',
  KUBERNETES_SECRET = 'kubernetes-secret',
  KUBERNETES_RESOURCE_CREATE = 'kubernetes-resource-create',
}
