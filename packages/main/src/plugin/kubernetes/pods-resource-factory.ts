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

import type { V1Pod, V1PodList, V1ResourceAttributes } from '@kubernetes/client-node';
import { CoreV1Api } from '@kubernetes/client-node';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import { ResourceInformer } from './resource-informer.js';

export class PodsResourceFactory {
  resource = 'pods';
  isNamespaced = true;
  permissionsRequests: V1ResourceAttributes[] = [
    {
      group: '*',
      resource: '*',
      verb: 'watch',
    },
    {
      verb: 'watch',
      resource: 'pods',
    },
  ];

  getInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<V1Pod> {
    const namespace = kubeconfig.getNamespace();
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1PodList> => apiClient.listNamespacedPod({ namespace });
    const path = `/api/v1/namespaces/${namespace}/pods`;
    return new ResourceInformer<V1Pod>(kubeconfig, path, listFn, 'pods');
  }
}
