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

import type { ContextPermissionsRequest } from './context-permissions-checker.js';
import type { ResourceFactory } from './resource-factory.js';
import { isResourceFactoryWithPermissions } from './resource-factory.js';

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
      ...this.getNamespacedOrNotPermissionsRequests(this.#resourceFactories, namespace),
      ...this.getNamespacedOrNotPermissionsRequests(this.#resourceFactories),
    ];
  }

  getResourceFactoryByResourceName(resource: string): ResourceFactory | undefined {
    return this.#resourceFactories.find(f => f.resource === resource);
  }

  private getNamespacedOrNotPermissionsRequests(
    factories: ResourceFactory[],
    namespace?: string,
  ): ContextPermissionsRequest[] {
    const isNamespaced = !!namespace;
    const filteredResourceFactories = factories
      .filter(isResourceFactoryWithPermissions)
      .filter(f => f.permissions.isNamespaced === isNamespaced);
    if (!filteredResourceFactories[0]) {
      return [];
    }
    const firstFilteredResourceFactory = filteredResourceFactories[0];
    if (!firstFilteredResourceFactory.permissions.permissionsRequests[0]) {
      return [];
    }
    const children: ResourceFactory[] = [];
    const newRequest: ContextPermissionsRequest = {
      attrs: {
        namespace: isNamespaced ? namespace : undefined,
        ...firstFilteredResourceFactory.permissions.permissionsRequests[0],
      },
      resources: [firstFilteredResourceFactory.resource],
    };
    const child = firstFilteredResourceFactory.copyWithSlicedPermissions();
    children.push(child);
    const remainings: ResourceFactory[] = [];
    for (const filteredResourceFactory of filteredResourceFactories.slice(1)) {
      if (
        util.isDeepStrictEqual(
          filteredResourceFactory.permissions.permissionsRequests[0],
          firstFilteredResourceFactory.permissions.permissionsRequests[0],
        )
      ) {
        newRequest.resources.push(filteredResourceFactory.resource);
        const child = filteredResourceFactory.copyWithSlicedPermissions();
        children.push(child);
      } else {
        remainings.push(filteredResourceFactory);
      }
    }
    const childrenRequests = this.getNamespacedOrNotPermissionsRequests(children, namespace);
    if (childrenRequests.length) {
      newRequest.onDenyRequests = childrenRequests;
    }

    return [newRequest, ...this.getNamespacedOrNotPermissionsRequests(remainings, namespace)];
  }
}
