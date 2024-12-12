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

import type {
  AuthorizationV1ApiCreateSelfSubjectAccessReviewRequest,
  V1ResourceAttributes,
  V1SubjectAccessReviewStatus,
} from '@kubernetes/client-node';
import { AuthorizationV1Api } from '@kubernetes/client-node';
import type { Disposable } from '@podman-desktop/api';

import type { Event } from '../events/emitter.js';
import { Emitter } from '../events/emitter.js';
import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';

export interface ContextPermissionsRequest {
  // the request to send
  attrs: V1ResourceAttributes;
  // the resources covered by the request
  resources: string[];
  // list of more fine-grained requests to send in case of denied request
  onDenyRequests?: ContextPermissionsRequest[];
}

// ContextResourcePermission is the permission for a specific resource
export interface ContextResourcePermission {
  attrs: V1ResourceAttributes;
  // permitted if allowed and not denied
  permitted: boolean;
  reason?: string;
}

// ContextPermissionResult is the result of a request, which can cover several resources
export interface ContextPermissionResult extends ContextResourcePermission {
  kubeConfig: KubeConfigSingleContext;
  resources: string[];
}

export class ContextPermissionsChecker implements Disposable {
  #kubeconfig: KubeConfigSingleContext;
  #client: AuthorizationV1Api;
  #request: ContextPermissionsRequest;
  #subCheckers: ContextPermissionsChecker[] = [];
  #results: Map<string, ContextResourcePermission>;

  #onPermissionResult = new Emitter<ContextPermissionResult>();
  onPermissionResult: Event<ContextPermissionResult> = this.#onPermissionResult.event;

  // builds a ContextPermissionsChecker which will check permissions on the current context of the given kubeConfig
  // The request will be made with `attrs` and if allowed, permissions will be given for `resources`
  // If the result is denied, `onDenyRequests` will be started
  constructor(kubeconfig: KubeConfigSingleContext, request: ContextPermissionsRequest) {
    this.#kubeconfig = kubeconfig;
    this.#request = request;
    this.#results = new Map<string, ContextResourcePermission>();
    this.#client = this.#kubeconfig.getKubeConfig().makeApiClient(AuthorizationV1Api);
  }

  public async start(): Promise<void> {
    const result = await this.makeRequest(this.#request.attrs);
    if ((!result.allowed || result.denied) && this.#request.onDenyRequests?.length) {
      // if not permitted and sub-requests are defined, let start them and don't send any result
      for (const subreq of this.#request.onDenyRequests) {
        const subchecker = new ContextPermissionsChecker(this.#kubeconfig, subreq);
        this.#subCheckers.push(subchecker);
        subchecker.onPermissionResult((permissionResult: ContextPermissionResult) => {
          this.saveAndFireResult(permissionResult);
        });
        await subchecker.start();
      }
    } else {
      // send the result for resources concerned by the request
      this.saveAndFireResult({
        kubeConfig: this.#kubeconfig,
        resources: this.#request.resources,
        attrs: this.#request.attrs,
        permitted: result.allowed && !result.denied,
        reason: result.reason,
      });
    }
  }

  private saveAndFireResult(result: ContextPermissionResult): void {
    this.#onPermissionResult.fire(result);
    for (const resource of result.resources) {
      this.#results.set(resource, {
        attrs: result.attrs,
        permitted: result.permitted,
        reason: result.reason,
      });
    }
  }

  public getPermissions(): Map<string, ContextResourcePermission> {
    return this.#results;
  }

  public dispose(): void {
    this.#onPermissionResult.dispose();
    for (const subchecker of this.#subCheckers) {
      subchecker.dispose();
    }
  }

  private async makeRequest(attrs: V1ResourceAttributes): Promise<V1SubjectAccessReviewStatus> {
    const param: AuthorizationV1ApiCreateSelfSubjectAccessReviewRequest = {
      body: {
        spec: {
          resourceAttributes: attrs,
        },
      },
    };
    const result = await this.#client.createSelfSubjectAccessReview(param);
    if (!result.status) {
      return {
        allowed: false,
      };
    }
    return result.status;
  }
}
