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

import type { V1Deployment, V1DeploymentList } from '@kubernetes/client-node';
import { AppsV1Api } from '@kubernetes/client-node';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import { ResourceInformer } from './resource-informer.js';

export class DeploymentsResourceFactory extends ResourceFactoryBase implements ResourceFactory {
  constructor() {
    super({
      resource: 'deployments',
    });

    this.setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          verb: 'watch',
          group: 'apps',
          resource: 'deployments',
        },
      ],
    });
    this.setInformer({
      createInformer: this.createInformer,
    });
  }

  createInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<V1Deployment> {
    const namespace = kubeconfig.getNamespace();
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(AppsV1Api);
    const listFn = (): Promise<V1DeploymentList> => apiClient.listNamespacedDeployment({ namespace });
    const path = `/apis/apps/v1/namespaces/${namespace}/deployments`;
    return new ResourceInformer<V1Deployment>(kubeconfig, path, listFn, 'deployments');
  }
}
