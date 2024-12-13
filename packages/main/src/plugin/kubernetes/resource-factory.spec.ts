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
import type { V1Pod } from '@kubernetes/client-node';
import { expect, test } from 'vitest';

import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import { isResourceFactoryWithPermissions, ResourceFactoryBase } from './resource-factory.js';
import type { ResourceInformer } from './resource-informer.js';

test('ResourceFactoryBase set permissions', () => {
  const factory = new ResourceFactoryBase({ resource: 'resource1' });

  const permissionsRequests = [
    {
      group: '*',
      resource: '*',
      verb: 'watch',
    },
    {
      verb: 'watch',
      resource: 'resource1',
    },
  ];
  factory.setPermissions({
    isNamespaced: true,
    permissionsRequests,
  });
  expect(factory.permissions?.isNamespaced).toBeTruthy();
  expect(factory.permissions?.permissionsRequests).toEqual(permissionsRequests);
  expect(factory.informer).toBeUndefined();

  expect(isResourceFactoryWithPermissions(factory)).toBeTruthy();
});

test('copyWithSlicedPermissions', () => {
  const factory = new ResourceFactoryBase({ resource: 'resource1' });

  const permissionsRequests = [
    {
      group: '*',
      resource: '*',
      verb: 'watch',
    },
    {
      verb: 'watch',
      resource: 'resource1',
    },
  ];
  factory.setPermissions({
    isNamespaced: true,
    permissionsRequests,
  });

  const copy = factory.copyWithSlicedPermissions();
  expect(copy.permissions?.isNamespaced).toBeTruthy();
  expect(copy.permissions?.permissionsRequests).toEqual([
    {
      verb: 'watch',
      resource: 'resource1',
    },
  ]);
});

test('ResourceFactoryBase set informer', () => {
  const factory = new ResourceFactoryBase({ resource: 'resource1' });
  const createInformer = (_kubeconfig: KubeConfigSingleContext): ResourceInformer<V1Pod> => {
    return {} as ResourceInformer<V1Pod>;
  };
  factory.setInformer({
    createInformer,
  });

  expect(factory.informer?.createInformer).toEqual(createInformer);
  expect(isResourceFactoryWithPermissions(factory)).toBeFalsy();
});
