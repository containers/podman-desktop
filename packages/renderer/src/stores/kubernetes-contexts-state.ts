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

import type { KubernetesObject } from '@kubernetes/client-node';
import { derived, readable, writable } from 'svelte/store';

import type { ContextGeneralState } from '../../../main/src/plugin/kubernetes-context-state';
import { findMatchInLeaves } from './search-util';

export const kubernetesContextsState = readable(new Map<string, ContextGeneralState>(), set => {
  window.kubernetesGetContextsGeneralState().then(value => set(value));
  window.events?.receive('kubernetes-contexts-general-state-update', (value: unknown) => {
    set(value as Map<string, ContextGeneralState>);
  });
});

export const kubernetesCurrentContextState = readable(
  {
    reachable: false,
    error: 'initializing',
    resources: { pods: 0, deployments: 0 },
  } as ContextGeneralState,
  set => {
    window.kubernetesGetCurrentContextGeneralState().then(value => set(value));
    window.events?.receive('kubernetes-current-context-general-state-update', (value: unknown) => {
      set(value as ContextGeneralState);
    });
  },
);

export const kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([], set => {
  window.kubernetesRegisterGetCurrentContextResources('deployments').then(value => set(value));
  window.events?.receive('kubernetes-current-context-deployments-update', (value: unknown) => {
    set(value as KubernetesObject[]);
  });
});

export const deploymentSearchPattern = writable('');

// The deployments in the current context, filtered with `deploymentSearchPattern`
export const kubernetesCurrentContextDeploymentsFiltered = derived(
  [deploymentSearchPattern, kubernetesCurrentContextDeployments],
  ([$searchPattern, $deployments]) =>
    $deployments.filter(deployment => findMatchInLeaves(deployment, $searchPattern.toLowerCase())),
);

// Services

export const kubernetesCurrentContextServices = readable<KubernetesObject[]>([], set => {
  window.kubernetesRegisterGetCurrentContextResources('services').then(value => set(value));
  window.events?.receive('kubernetes-current-context-services-update', (value: unknown) => {
    set(value as KubernetesObject[]);
  });
  return () => {
    window.kubernetesUnregisterGetCurrentContextResources('services');
  };
});

export const serviceSearchPattern = writable('');

// The services in the current context, filtered with `serviceSearchPattern`
export const kubernetesCurrentContextServicesFiltered = derived(
  [serviceSearchPattern, kubernetesCurrentContextServices],
  ([$searchPattern, $services]) =>
    $services.filter(service => findMatchInLeaves(service, $searchPattern.toLowerCase())),
);

// Ingresses

export const kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([], set => {
  window.kubernetesRegisterGetCurrentContextResources('ingresses').then(value => set(value));
  window.events?.receive('kubernetes-current-context-ingresses-update', (value: unknown) => {
    set(value as KubernetesObject[]);
  });
  return () => {
    window.kubernetesUnregisterGetCurrentContextResources('ingresses');
  };
});

export const ingressSearchPattern = writable('');

// The ingresses in the current context, filtered with `ingressSearchPattern`
export const kubernetesCurrentContextIngressesFiltered = derived(
  [ingressSearchPattern, kubernetesCurrentContextIngresses],
  ([$searchPattern, $ingresses]) =>
    $ingresses.filter(ingress => findMatchInLeaves(ingress, $searchPattern.toLowerCase())),
);

// Routes

export const kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([], set => {
  window.kubernetesRegisterGetCurrentContextResources('routes').then(value => set(value));
  window.events?.receive('kubernetes-current-context-routes-update', (value: unknown) => {
    set(value as KubernetesObject[]);
  });
  return () => {
    window.kubernetesUnregisterGetCurrentContextResources('routes');
  };
});

export const routeSearchPattern = writable('');

// The routes in the current context, filtered with `routeSearchPattern`
export const kubernetesCurrentContextRoutesFiltered = derived(
  [routeSearchPattern, kubernetesCurrentContextRoutes],
  ([$searchPattern, $routes]) => $routes.filter(route => findMatchInLeaves(route, $searchPattern.toLowerCase())),
);
