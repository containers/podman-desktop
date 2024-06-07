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

import type { V1Service } from '@kubernetes/client-node';

import type { ServiceUI } from './ServiceUI';

export class ServiceUtils {
  getServiceUI(service: V1Service): ServiceUI {
    return {
      name: service.metadata?.name ?? '',
      status: 'RUNNING',
      namespace: service.metadata?.namespace ?? '',
      created: service.metadata?.creationTimestamp,
      selected: false,
      type: service.spec?.type ?? '',
      clusterIP: service.spec?.clusterIP ?? '',
      loadBalancerIPs: service.status?.loadBalancer?.ingress?.map(ingress => ingress.ip).join(', '),
      ports: (service.spec?.ports ?? [])
        .map(port => port.port + (port.nodePort ? ':' + port.nodePort : '') + '/' + port.protocol)
        .join(', '),
    };
  }
}
