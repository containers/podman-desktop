/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { V1Route } from '@desktop-framework/api';
import type { KubernetesListObject } from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import { ResourceInformer } from './resource-informer.js';

export class RoutesResourceFactory extends ResourceFactoryBase implements ResourceFactory {
  constructor() {
    super({
      resource: 'routes',
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
          group: 'route.openshift.io',
          resource: 'routes',
        },
      ],
    });
    this.setInformer({
      createInformer: this.createInformer,
    });
  }

  createInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<V1Route> {
    const namespace = kubeconfig.getNamespace();
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(CustomObjectsApi);
    const listFn = (): Promise<KubernetesListObject<V1Route>> =>
      apiClient.listNamespacedCustomObject({
        group: 'route.openshift.io',
        version: 'v1',
        namespace,
        plural: 'routes',
      });
    const path = `/apis/route.openshift.io/v1/namespaces/${namespace}/routes`;
    return new ResourceInformer<V1Route>({ kubeconfig, path, listFn, kind: 'Route', plural: 'routes' });
  }
}
