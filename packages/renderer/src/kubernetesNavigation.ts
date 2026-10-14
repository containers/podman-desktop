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

import type { KubernetesNavigationRequest } from '@desktop-framework/api';
import { router } from 'tinro';

export function navigateTo(nav: KubernetesNavigationRequest): void {
  if (!nav.name) {
    // navigate to a kind (list)
    gotoKubernetesResources(nav.kind);
  } else {
    // navigate to a specific resource
    gotoKubernetesResource(nav.kind, nav.name, nav.namespace);
  }
}

function gotoKubernetesResources(kind: string): void {
  router.goto(`/kubernetes/${resourceKindToURL(kind)}`);
}

function gotoKubernetesResource(kind: string, name: string, namespace?: string): void {
  if (namespace) {
    if (kind === 'Ingress') {
      router.goto(`/kubernetes/${resourceKindToURL(kind)}/ingress/${name}/${namespace}/summary`);
    } else if (kind === 'Route') {
      router.goto(`/kubernetes/${resourceKindToURL(kind)}/route/${name}/${namespace}/summary`);
    } else if (kind === 'ConfigMap') {
      router.goto(`/kubernetes/${resourceKindToURL(kind)}/configmap/${name}/${namespace}/summary`);
    } else if (kind === 'Secret') {
      router.goto(`/kubernetes/${resourceKindToURL(kind)}/secret/${name}/${namespace}/summary`);
    } else {
      router.goto(`/kubernetes/${resourceKindToURL(kind)}/${name}/${namespace}/summary`);
    }
  } else {
    router.goto(`/kubernetes/${resourceKindToURL(kind)}/${name}/summary`);
  }
}

function resourceKindToURL(kind: string): string {
  // handle the special cases in our urls
  if (kind === 'Ingress' || kind === 'Route') {
    return 'ingressesRoutes';
  } else if (kind === 'ConfigMap' || kind === 'Secret') {
    return 'configmapsSecrets';
  }
  // otherwise do the simple conversion
  return kind.toLowerCase() + 's';
}
