/**********************************************************************
 * Copyright (C) 2024, 2025 Red Hat, Inc.
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

import type { Event } from '@desktop-framework/api';
import type { Disposable } from '@desktop-framework/extension-api';
import type {
  Informer,
  KubernetesListObject,
  KubernetesObject,
  ListPromise,
  ObjectCache,
} from '@kubernetes/client-node';
import { ADD, ApiException, DELETE, ERROR, ListWatch, UPDATE, Watch } from '@kubernetes/client-node';

import { Emitter } from '/@/plugin/events/emitter.js';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';

interface BaseEvent {
  kubeconfig: KubeConfigSingleContext;
  resourceName: string;
}

export interface CacheUpdatedEvent extends BaseEvent {
  countChanged: boolean;
}

export interface OfflineEvent extends BaseEvent {
  offline: boolean;
  reason?: string;
}

export interface ResourceInformerOptions<T extends KubernetesObject> {
  kubeconfig: KubeConfigSingleContext;
  // the endpoint in the Kubernetes api server to list the resources
  path: string;
  // the function to list the resources
  listFn: ListPromise<T>;
  // the kind of the resource (Pod, ...), appearing in the `kind` field of manifests for this resource
  kind: string;
  // the name of the resource for the 'REST API' (pods, ...), appearing in the path above
  plural: string;
}

export class ResourceInformer<T extends KubernetesObject> implements Disposable {
  #kubeConfig: KubeConfigSingleContext;
  #path: string;
  #listFn: ListPromise<T>;
  #pluralName: string;
  #kindName: string;
  #informer: Informer<T> | undefined;
  #offline: boolean = false;

  #onCacheUpdated = new Emitter<CacheUpdatedEvent>();
  onCacheUpdated: Event<CacheUpdatedEvent> = this.#onCacheUpdated.event;

  #onOffline = new Emitter<OfflineEvent>();
  onOffline: Event<OfflineEvent> = this.#onOffline.event;

  constructor(options: ResourceInformerOptions<T>) {
    this.#kubeConfig = options.kubeconfig;
    this.#path = options.path;
    this.#listFn = options.listFn;
    this.#pluralName = options.plural;
    this.#kindName = options.kind;
  }

  // start the informer and returns a cache to the data
  // The cache will be active all the time, even if an error happens
  // and the informer becomes offline
  start(): ObjectCache<T> {
    // internalInformer extends both Informer and ObjectCache
    const typedList = async (): Promise<KubernetesListObject<T>> => {
      const list = await this.#listFn();
      return {
        ...list,
        items: list.items.map(item => ({
          kind: this.#kindName,
          apiVersion: list.apiVersion,
          ...item,
        })),
      };
    };
    const internalInformer = this.getListWatch(this.#path, typedList);
    this.#informer = internalInformer;

    this.#informer.on(UPDATE, (_obj: T) => {
      this.#onCacheUpdated.fire({
        kubeconfig: this.#kubeConfig,
        resourceName: this.#pluralName,
        countChanged: false,
      });
    });
    this.#informer.on(ADD, (_obj: T) => {
      this.#onCacheUpdated.fire({
        kubeconfig: this.#kubeConfig,
        resourceName: this.#pluralName,
        countChanged: true,
      });
    });
    this.#informer.on(DELETE, (_obj: T) => {
      this.#onCacheUpdated.fire({
        kubeconfig: this.#kubeConfig,
        resourceName: this.#pluralName,
        countChanged: true,
      });
    });
    // This is issued when there is an error
    this.#informer.on(ERROR, (error: unknown) => {
      if (error instanceof ApiException && error.code === 404) {
        // starting from kubernetes-client v1.1, informer is correctly started even if resource does not exist in API
        // and the 404 error is received here
        return;
      }
      this.#offline = true;
      this.#onOffline.fire({
        kubeconfig: this.#kubeConfig,
        resourceName: this.#pluralName,
        offline: true,
        reason: String(error),
      });
    });
    this.#informer.start().catch((err: unknown) => {
      console.error(
        `error starting the informer for resource ${this.#pluralName} on context ${this.#kubeConfig.getKubeConfig().currentContext}: ${String(err)}`,
      );
    });
    return internalInformer;
  }

  // reconnect tries to start the informer again if it is marked as offline
  // (after an error happens)
  reconnect(): void {
    if (!!this.#informer && this.#offline) {
      this.#offline = false;
      this.#onOffline.fire({
        kubeconfig: this.#kubeConfig,
        resourceName: this.#pluralName,
        offline: false,
      });
      this.#informer.start().catch((err: unknown) => {
        console.error(
          `error starting the informer for resource ${this.#pluralName} on context ${this.#kubeConfig.getKubeConfig().currentContext}: ${String(err)}`,
        );
      });
    }
  }

  protected getListWatch(path: string, listFn: ListPromise<T>): ListWatch<T> {
    const watch = new Watch(this.#kubeConfig.getKubeConfig());
    return new ListWatch<T>(path, watch, listFn, false);
  }

  dispose(): void {
    this.#onCacheUpdated.dispose();
    this.#onOffline.dispose();
    this.#informer?.stop().catch((err: unknown) => {
      console.error(
        `error stopping the informer for resource ${this.#pluralName} on context ${this.#kubeConfig.getKubeConfig().currentContext}: ${String(err)}`,
      );
    });
  }

  isOffline(): boolean {
    return this.#offline;
  }
}
