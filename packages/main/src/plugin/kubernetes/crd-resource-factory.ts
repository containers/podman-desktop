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

import type { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import { ResourceInformer } from './resource-informer.js';

export interface CRDDefinition {
  group: string;
  version: string;
  plural: string;
}

export class CRDResourceFactory extends ResourceFactoryBase implements ResourceFactory {
  #definition: CRDDefinition;
  constructor(definition: CRDDefinition) {
    super({
      resource: definition.plural,
    });
    this.#definition = definition;

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
          group: this.#definition.group,
          resource: this.#definition.plural,
        },
      ],
    });
    this.setInformer({
      createInformer: this.createInformer.bind(this),
    });
  }

  createInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<KubernetesObject> {
    const namespace = kubeconfig.getNamespace();
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(CustomObjectsApi);
    const listFn = (): Promise<KubernetesListObject<KubernetesObject>> =>
      apiClient.listNamespacedCustomObject({
        group: this.#definition.group,
        version: this.#definition.version,
        plural: this.#definition.plural,
        namespace,
      });
    const path = `/apis/${this.#definition.group}/${this.#definition.version}/${this.#definition.plural}`;
    return new ResourceInformer<KubernetesObject>(kubeconfig, path, listFn, this.#definition.plural);
  }
}
