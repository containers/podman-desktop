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

import { expect, test } from 'vitest';

import { DeploymentsResourceFactory } from './deployments-resource-factory.js';
import { PodsResourceFactory } from './pods-resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import { ResourceFactoryHandler } from './resource-factory-handler.js';

test('with 1 level and same request', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        namespace: 'ns',
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods', 'deployments'],
    },
  ]);
});

test('with 1 level and different requests', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: 'group1',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: 'group2',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        namespace: 'ns',
        group: 'group1',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods'],
    },
    {
      attrs: {
        namespace: 'ns',
        group: 'group2',
        resource: '*',
        verb: 'watch',
      },
      resources: ['deployments'],
    },
  ]);
});

test('with 2 levels and same request at first level', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          verb: 'watch',
          resource: 'pods',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          verb: 'watch',
          group: 'group2',
          resource: 'deployments',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        namespace: 'ns',
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods', 'deployments'],
      onDenyRequests: [
        {
          attrs: {
            namespace: 'ns',
            verb: 'watch',
            resource: 'pods',
          },
          resources: ['pods'],
        },
        {
          attrs: {
            namespace: 'ns',
            verb: 'watch',
            group: 'group2',
            resource: 'deployments',
          },
          resources: ['deployments'],
        },
      ],
    },
  ]);
});

test('with 1 level and same request, non namespaced', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods', 'deployments'],
    },
  ]);
});

test('with 1 level and different requests, non namespaced', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: 'group1',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: 'group2',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        group: 'group1',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods'],
    },
    {
      attrs: {
        group: 'group2',
        resource: '*',
        verb: 'watch',
      },
      resources: ['deployments'],
    },
  ]);
});

test('with 2 levels and same request at first level, non namespaced', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          verb: 'watch',
          resource: 'pods',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          verb: 'watch',
          group: 'group2',
          resource: 'deployments',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods', 'deployments'],
      onDenyRequests: [
        {
          attrs: {
            verb: 'watch',
            resource: 'pods',
          },
          resources: ['pods'],
        },
        {
          attrs: {
            verb: 'watch',
            group: 'group2',
            resource: 'deployments',
          },
          resources: ['deployments'],
        },
      ],
    },
  ]);
});

test('with 1 level and same request, both namespaced ant not namespaced', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'pods',
    }).setPermissions({
      isNamespaced: true,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  factoryHandler.add(
    new ResourceFactoryBase({
      resource: 'deployments',
    }).setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
      ],
    }),
  );

  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        namespace: 'ns',
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods'],
    },
    {
      attrs: {
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['deployments'],
    },
  ]);
});

test('real pods and deployments', () => {
  const factoryHandler = new ResourceFactoryHandler();

  factoryHandler.add(new PodsResourceFactory());
  factoryHandler.add(new DeploymentsResourceFactory());
  const requests = factoryHandler.getPermissionsRequests('ns');
  expect(requests).toEqual([
    {
      attrs: {
        namespace: 'ns',
        group: '*',
        resource: '*',
        verb: 'watch',
      },
      resources: ['pods', 'deployments'],
      onDenyRequests: [
        {
          attrs: {
            namespace: 'ns',
            verb: 'watch',
            resource: 'pods',
          },
          resources: ['pods'],
        },
        {
          attrs: {
            namespace: 'ns',
            verb: 'watch',
            group: 'apps',
            resource: 'deployments',
          },
          resources: ['deployments'],
        },
      ],
    },
  ]);
});
