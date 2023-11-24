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
import type { IngressUI } from './IngressUI';
import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';
import type { RouteUI } from './RouteUI';

export class IngressRouteUtils {
  getIngressUI(ingress: V1Ingress): IngressUI {
    return {
      name: ingress.metadata?.name || '',
      namespace: ingress.metadata?.namespace || '',
      rules: ingress.spec?.rules,
      selected: false,
    };
  }
  getRouteUI(route: V1Route): RouteUI {
    return {
      name: route.metadata?.name || '',
      namespace: route.metadata?.namespace || '',
      host: route.spec.host,
      port: route.spec.port?.targetPort,
      path: route.spec.path,
      to: {
        kind: route.spec.to.kind,
        name: route.spec.to.name,
      },
      selected: false,
    };
  }
}
