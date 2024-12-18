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
import type { KubernetesObject, V1ResourceAttributes } from '@kubernetes/client-node';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceInformer } from './resource-informer.js';

export interface ResourcePermissionsFactory {
  get permissionsRequests(): V1ResourceAttributes[];
  get isNamespaced(): boolean;
}

export interface ResourceInformerFactory {
  createInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<KubernetesObject>;
}

export class ResourceFactoryBase {
  #resource: string;
  #permissions: ResourcePermissionsFactory | undefined;
  #informer: ResourceInformerFactory | undefined;

  constructor(options: {
    resource: string;
  }) {
    this.#resource = options.resource;
  }

  setPermissions(options: {
    permissionsRequests: V1ResourceAttributes[];
    isNamespaced: boolean;
  }): ResourceFactoryBase {
    this.#permissions = {
      permissionsRequests: options.permissionsRequests,
      isNamespaced: options.isNamespaced,
    };
    return this;
  }

  setInformer(options: {
    createInformer: (kubeconfig: KubeConfigSingleContext) => ResourceInformer<KubernetesObject>;
  }): ResourceFactoryBase {
    this.#informer = {
      createInformer: options.createInformer,
    };
    return this;
  }

  get resource(): string {
    return this.#resource;
  }

  get permissions(): ResourcePermissionsFactory | undefined {
    return this.#permissions;
  }

  get informer(): ResourceInformerFactory | undefined {
    return this.#informer;
  }

  copyWithSlicedPermissions(): ResourceFactory {
    if (!this.#permissions) {
      throw new Error('permission must be defined before calling copyWithSlicedPermissions');
    }
    return new ResourceFactoryBase({
      resource: this.#resource,
    }).setPermissions({
      permissionsRequests: this.#permissions.permissionsRequests.slice(1),
      isNamespaced: this.#permissions.isNamespaced,
    });
  }
}

export interface ResourceFactory {
  get resource(): string;
  permissions?: ResourcePermissionsFactory;
  informer?: ResourceInformerFactory;
  copyWithSlicedPermissions(): ResourceFactory;
}

export function isResourceFactoryWithPermissions(object: ResourceFactory): object is ResourceFactoryWithPermissions {
  return !!object.permissions;
}

interface ResourceFactoryWithPermissions extends ResourceFactory {
  permissions: ResourcePermissionsFactory;
}
