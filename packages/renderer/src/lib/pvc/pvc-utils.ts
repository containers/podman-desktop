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

import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';

import type { PVCUI } from './PVCUI';

export class PVCUtils {
  getPVCUI(pvc: V1PersistentVolumeClaim): PVCUI {
    const created = pvc.metadata?.creationTimestamp;
    const size = pvc.spec?.resources?.requests?.storage ?? '';

    // We will map "status" to the corresponding "StatusIcon" statuses equivilant.
    // PVC's only have "Pending", "Bound" and "Lost" as phases.
    // However, we can also determine if it is in the middle of deleting by
    // checking if the phase is "Terminating" through checking if the object has deletionTimestamp.
    let status = 'STOPPED';
    if (pvc.metadata?.deletionTimestamp) {
      status = 'TERMINATING';
    } else if (pvc.status?.phase === 'Bound') {
      status = 'RUNNING';
    } else if (pvc.status?.phase === 'Pending') {
      status = 'STARTING';
    } else if (pvc.status?.phase === 'Lost') {
      status = 'DEGRADED';
    }

    return {
      name: pvc.metadata?.name ?? '',
      namespace: pvc.metadata?.namespace ?? '',
      status,
      created,
      storageClass: pvc.spec?.storageClassName ?? '',
      accessModes: pvc.spec?.accessModes ?? [],
      selected: false,
      size,
    };
  }
}
