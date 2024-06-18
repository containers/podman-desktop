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
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PVCUtils } from './pvc-utils';

let pvcUtils: PVCUtils;

beforeEach(() => {
  vi.clearAllMocks();
  pvcUtils = new PVCUtils();
});

describe('PVC UI conversion', () => {
  test('expect basic PVC UI conversion', async () => {
    const fakePVC = {
      metadata: {
        name: 'pvc-1',
        namespace: 'default',
        creationTimestamp: '2021-06-07T18:00:00Z',
      },
      spec: {
        storageClassName: 'standard',
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage: '1Gi',
          },
        },
      },
      status: {
        phase: 'Bound',
      },
    } as unknown as V1PersistentVolumeClaim;

    const pvcUI = pvcUtils.getPVCUI(fakePVC);

    expect(pvcUI.name).toEqual('pvc-1');
    expect(pvcUI.namespace).toEqual('default');
    expect(pvcUI.status).toEqual('RUNNING');
    expect(pvcUI.created).toEqual('2021-06-07T18:00:00Z');
    expect(pvcUI.storageClass).toEqual('standard');
    expect(pvcUI.accessModes).toEqual(['ReadWriteOnce']);
    expect(pvcUI.selected).toEqual(false);
    expect(pvcUI.size).toEqual('1Gi');
  });
});
