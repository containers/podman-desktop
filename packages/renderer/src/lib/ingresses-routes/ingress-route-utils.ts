/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { V1Ingress } from '@kubernetes/client-node';

import type { V1Route } from '/@api/openshift-types';

import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export interface HostPathObject {
  label: string;
  url?: string;
}

export class IngressRouteUtils {
  getIngressUI(ingress: V1Ingress): IngressUI {
    return {
      name: ingress.metadata?.name ?? '',
      namespace: ingress.metadata?.namespace ?? '',
      status: 'RUNNING',
      rules: ingress.spec?.rules,
      selected: false,
      created: ingress.metadata?.creationTimestamp ? new Date(ingress.metadata.creationTimestamp) : undefined,
    };
  }
  getRouteUI(route: V1Route): RouteUI {
    return {
      name: route.metadata?.name ?? '',
      namespace: route.metadata?.namespace ?? '',
      status: 'RUNNING',
      host: route.spec.host,
      port: route.spec.port?.targetPort,
      path: route.spec.path,
      to: {
        kind: route.spec.to.kind,
        name: route.spec.to.name,
      },
      selected: false,
      // true if tls part is defined
      tlsEnabled: !!route.spec.tls,
      created: route.metadata?.creationTimestamp ? new Date(route.metadata.creationTimestamp) : undefined,
    };
  }
  isIngress(object: IngressUI | RouteUI): object is IngressUI {
    return !('to' in object);
  }
  getHostPaths(ingressRoute: IngressUI | RouteUI): HostPathObject[] {
    if (this.isIngress(ingressRoute)) {
      return this.getIngressHostPaths(ingressRoute);
    } else {
      return this.getRouteHostPaths(ingressRoute);
    }
  }
  getIngressHostPaths(ingressUI: IngressUI): HostPathObject[] {
    const hostPaths: HostPathObject[] = [];
    for (const rule of ingressUI.rules ?? []) {
      for (const path of rule.http?.paths ?? []) {
        if (path.path) {
          if (rule.host) {
            hostPaths.push({
              label: `${rule.host}${path.path}`,
              url: `https://${rule.host}${path.path}`,
            });
          } else {
            hostPaths.push({
              label: path.path,
            });
          }
        }
      }
    }
    return hostPaths;
  }
  getRouteHostPaths(routeUI: RouteUI): HostPathObject[] {
    const protocol = routeUI.tlsEnabled ? 'https' : 'http';
    return [
      {
        label: `${routeUI.host}${routeUI.path ?? ''}`,
        url: `${protocol}://${routeUI.host}${routeUI.path ?? ''}`,
      },
    ];
  }
  getBackends(ingressRoute: IngressUI | RouteUI): string[] {
    if (this.isIngress(ingressRoute)) {
      return this.getIngressBackends(ingressRoute);
    } else {
      return [`${ingressRoute.to.kind} ${ingressRoute.to.name}`];
    }
  }
  getIngressBackends(ingressUI: IngressUI): string[] {
    const backends: string[] = [];
    for (const rule of ingressUI.rules ?? []) {
      for (const path of rule.http?.paths ?? []) {
        if (path.backend.service) {
          backends.push(
            `${path.backend.service.name}${
              path.backend.service.port?.number ? ':' + path.backend.service.port.number : ''
            }`,
          );
        } else if (path.backend.resource) {
          backends.push(`${path.backend.resource.kind} ${path.backend.resource.name}`);
        }
      }
    }
    return backends;
  }
}
