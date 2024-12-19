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

export interface ContextPermission {
  contextName: string;
  // the resource name is a generic string type and not a string literal type, as we want to handle CRDs names
  resourceName: string;
  // permitted if allowed and not denied
  // > When multiple authorization modules are configured, each is checked in sequence.
  // > If any authorizer approves or denies a request, that decision is immediately returned
  // > and no other authorizer is consulted. If all modules have no opinion on the request,
  // > then the request is denied. An overall deny verdict means that the API server rejects
  // > the request and responds with an HTTP 403 (Forbidden) status.
  // (source: https://kubernetes.io/docs/reference/access-authn-authz/authorization/)
  permitted: boolean;
  // A free-form and optional text reason for the resource being allowed or denied.
  // We cannot rely on having a reason for every request.
  // For exemple on Kind cluster, a reason is given only when the access is allowed, no reason is done for denial.
  reason?: string;
}
