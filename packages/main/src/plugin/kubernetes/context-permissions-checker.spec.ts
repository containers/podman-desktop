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

import util from 'node:util';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContextPermissionResult, ContextResourcePermission } from './context-permissions-checker.js';
import { ContextPermissionsChecker } from './context-permissions-checker.js';
import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';

describe('ContextPermissionsChecker is built with a non recursive request', async () => {
  let permissionsChecker: ContextPermissionsChecker;
  const createSelfSubjectAccessReviewMock = vi.fn();
  const onPermissionResultCB = vi.fn();

  let kubeConfig: KubeConfigSingleContext;

  const attrs = {
    namespace: 'ns1',
    group: '*',
    resource: '*',
    verb: 'watch',
  };
  const resources = ['resource1', 'resource2'];

  beforeEach(async () => {
    vi.clearAllMocks();
    kubeConfig = {
      getKubeConfig: vi.fn().mockReturnValue({
        makeApiClient: vi.fn().mockReturnValue({
          createSelfSubjectAccessReview: createSelfSubjectAccessReviewMock,
        }),
      }),
    } as unknown as KubeConfigSingleContext;
  });

  describe('permission is allowed', async () => {
    beforeEach(async () => {
      createSelfSubjectAccessReviewMock.mockResolvedValue({
        status: {
          allowed: true,
          reason: 'a reason',
        },
      });
      permissionsChecker = new ContextPermissionsChecker(kubeConfig, {
        attrs,
        resources,
      });
      permissionsChecker.onPermissionResult(onPermissionResultCB);
      await permissionsChecker.start();
    });

    test('onPermissionResult is fired with permitted true', async () => {
      expect(onPermissionResultCB).toHaveBeenCalledWith({
        kubeConfig: expect.anything(),
        attrs,
        resources,
        permitted: true,
        reason: 'a reason',
      });
    });

    test('getPermissions returns permitted true', async () => {
      const permissions = permissionsChecker.getPermissions();
      const expected = new Map<string, ContextResourcePermission>();
      expected.set('resource1', {
        attrs,
        permitted: true,
        reason: 'a reason',
      });
      expected.set('resource2', {
        attrs,
        permitted: true,
        reason: 'a reason',
      });
      expect(permissions).toEqual(expected);
    });
  });

  describe('permission is allowed and denied is true', async () => {
    beforeEach(async () => {
      createSelfSubjectAccessReviewMock.mockResolvedValue({
        status: {
          allowed: true,
          denied: true,
          reason: 'a reason',
        },
      });
      permissionsChecker = new ContextPermissionsChecker(kubeConfig, {
        attrs,
        resources,
      });
      permissionsChecker.onPermissionResult(onPermissionResultCB);
      await permissionsChecker.start();
    });

    test('onPermissionResult is fired with permitted false', async () => {
      expect(onPermissionResultCB).toHaveBeenCalledWith({
        kubeConfig: expect.anything(),
        attrs,
        resources,
        permitted: false,
        reason: 'a reason',
      });
    });

    test('getPermissions returns permitted false', async () => {
      const permissions = permissionsChecker.getPermissions();
      const expected = new Map<string, ContextResourcePermission>();
      expected.set('resource1', {
        attrs,
        permitted: false,
        reason: 'a reason',
      });
      expected.set('resource2', {
        attrs,
        permitted: false,
        reason: 'a reason',
      });
      expect(permissions).toEqual(expected);
    });
  });

  describe('permission is not allowed', async () => {
    beforeEach(async () => {
      createSelfSubjectAccessReviewMock.mockResolvedValue({
        status: {
          allowed: false,
          reason: 'a reason',
        },
      });
      permissionsChecker = new ContextPermissionsChecker(kubeConfig, {
        attrs,
        resources,
      });
      permissionsChecker.onPermissionResult(onPermissionResultCB);
      await permissionsChecker.start();
    });

    test('onPermissionResult is fired with permitted false', async () => {
      expect(onPermissionResultCB).toHaveBeenCalledWith({
        kubeConfig: expect.anything(),
        attrs,
        resources,
        permitted: false,
        reason: 'a reason',
      });
    });

    test('getPermissions returns permitted false', async () => {
      const permissions = permissionsChecker.getPermissions();
      const expected = new Map<string, ContextResourcePermission>();
      expected.set('resource1', {
        attrs,
        permitted: false,
        reason: 'a reason',
      });
      expected.set('resource2', {
        attrs,
        permitted: false,
        reason: 'a reason',
      });
      expect(permissions).toEqual(expected);
    });
  });
});

describe('ContextPermissionsChecker is built with a recursive request', async () => {
  let permissionsChecker: ContextPermissionsChecker;
  const createSelfSubjectAccessReviewMock = vi.fn();
  const onPermissionResultCB = vi.fn();

  let kubeConfig: KubeConfigSingleContext;

  const attrs = {
    namespace: 'ns1',
    group: '*',
    resource: '*',
    verb: 'watch',
  };
  const resources = ['resource1', 'resource2'];

  const attrsResource1 = {
    namespace: 'ns1',
    group: 'group1',
    resource: 'resource1',
    verb: 'watch',
  };
  const resources1 = ['resource1'];

  const attrsResource2 = {
    namespace: 'ns1',
    group: 'group2',
    resource: 'resource2',
    verb: 'watch',
  };
  const resources2 = ['resource2'];

  beforeEach(async () => {
    vi.clearAllMocks();
    kubeConfig = {
      getKubeConfig: vi.fn().mockReturnValue({
        makeApiClient: vi.fn().mockReturnValue({
          createSelfSubjectAccessReview: createSelfSubjectAccessReviewMock,
        }),
      }),
    } as unknown as KubeConfigSingleContext;
  });

  describe('permission is denied globally, and allowed for resource1 only', async () => {
    beforeEach(async () => {
      createSelfSubjectAccessReviewMock.mockImplementation(param => {
        if (util.isDeepStrictEqual(param.body.spec.resourceAttributes, attrs)) {
          return {
            status: {
              allowed: false,
              reason: 'a global reason',
            },
          };
        } else if (util.isDeepStrictEqual(param.body.spec.resourceAttributes, attrsResource1)) {
          return {
            status: {
              allowed: true,
              reason: 'a reason 1',
            },
          };
        }
        return {
          status: {
            allowed: false,
            reason: 'a reason 2',
          },
        };
      });
      permissionsChecker = new ContextPermissionsChecker(kubeConfig, {
        attrs,
        resources,
        onDenyRequests: [
          {
            attrs: attrsResource1,
            resources: resources1,
          },
          {
            attrs: attrsResource2,
            resources: resources2,
          },
        ],
      });
      permissionsChecker.onPermissionResult(onPermissionResultCB);
      await permissionsChecker.start();
    });

    test('onPermissionResult is fired with permitted true for resource1 and false for resource2', async () => {
      expect(onPermissionResultCB).toHaveBeenCalledWith({
        kubeConfig: expect.anything(),
        attrs: attrsResource1,
        resources: resources1,
        permitted: true,
        reason: 'a reason 1',
      } as ContextPermissionResult);
      expect(onPermissionResultCB).toHaveBeenCalledWith({
        kubeConfig: expect.anything(),
        attrs: attrsResource2,
        resources: resources2,
        permitted: false,
        reason: 'a reason 2',
      } as ContextPermissionResult);
    });

    test('getPermissions returns permitted true for resource1 and false for resource2', async () => {
      const permissions = permissionsChecker.getPermissions();
      const expected = new Map<string, ContextResourcePermission>();
      expected.set('resource1', {
        attrs: attrsResource1,
        permitted: true,
        reason: 'a reason 1',
      });
      expected.set('resource2', {
        attrs: attrsResource2,
        permitted: false,
        reason: 'a reason 2',
      });
      expect(permissions).toEqual(expected);
    });
  });
});
