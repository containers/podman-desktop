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

import util from 'node:util';

import type { KubernetesObject, V1ResourceAttributes } from '@kubernetes/client-node';

import type { ContextPermissionsRequest } from './context-permissions-checker.js';
import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceInformer } from './resource-informer.js';

export interface ResourceFactory {
  get resource(): string;
  get permissionsRequests(): V1ResourceAttributes[];
  get isNamespaced(): boolean;
  getInformer?(kubeconfig: KubeConfigSingleContext): ResourceInformer<KubernetesObject>;
}

export class ResourceFactoryHandler {
  #resourceFactories: ResourceFactory[] = [];

  add(factory: ResourceFactory): void {
    if (this.getResourceFactoryByResourceName(factory.resource)) {
      throw new Error(`a factory for resource ${factory.resource} has already been added`);
    }
    this.#resourceFactories.push(factory);
  }

  getPermissionsRequests(namespace: string): ContextPermissionsRequest[] {
    return [
      ...this.getNamespacedOrNotPermissionsRequests(this.#resourceFactories, true, namespace),
      ...this.getNamespacedOrNotPermissionsRequests(this.#resourceFactories, false),
    ];
  }

  getResourceFactoryByResourceName(resource: string): ResourceFactory | undefined {
    return this.#resourceFactories.find(f => f.resource === resource);
  }

  private getNamespacedOrNotPermissionsRequests(
    factories: ResourceFactory[],
    isNamespaced: boolean,
    namespace?: string,
  ): ContextPermissionsRequest[] {
    if (!isNamespaced && !!namespace) {
      throw new Error('request for non-namespaced must not define a namespace');
    }
    if (isNamespaced && !namespace) {
      throw new Error('request for namespaced must define a namespace');
    }
    const filteredResourceFactories = factories.filter(f => f.isNamespaced === isNamespaced);
    if (!filteredResourceFactories[0]) {
      return [];
    }
    const firstFilteredResourceFactory = filteredResourceFactories[0];
    if (!firstFilteredResourceFactory.permissionsRequests[0]) {
      return [];
    }
    const children: ResourceFactory[] = [];
    const newRequest: ContextPermissionsRequest = {
      attrs: {
        namespace: isNamespaced ? namespace : undefined,
        ...firstFilteredResourceFactory.permissionsRequests[0],
      },
      resources: [firstFilteredResourceFactory.resource],
    };
    const clone = {
      ...structuredClone(firstFilteredResourceFactory),
      permissionsRequests: firstFilteredResourceFactory.permissionsRequests.slice(1),
    };
    children.push(clone);
    const remainings: ResourceFactory[] = [];
    for (const filteredResourceFactory of filteredResourceFactories.slice(1)) {
      if (
        util.isDeepStrictEqual(
          filteredResourceFactory.permissionsRequests[0],
          firstFilteredResourceFactory.permissionsRequests[0],
        )
      ) {
        newRequest.resources.push(filteredResourceFactory.resource);
        const clone = {
          ...structuredClone(filteredResourceFactory),
          permissionsRequests: filteredResourceFactory.permissionsRequests.slice(1),
        };
        children.push(clone);
      } else {
        remainings.push(filteredResourceFactory);
      }
    }
    const childrenRequests = this.getNamespacedOrNotPermissionsRequests(children, isNamespaced, namespace);
    if (childrenRequests.length) {
      newRequest.onDenyRequests = childrenRequests;
    }

    return [newRequest, ...this.getNamespacedOrNotPermissionsRequests(remainings, isNamespaced, namespace)];
  }
}
