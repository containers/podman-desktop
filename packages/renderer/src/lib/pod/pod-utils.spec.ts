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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect } from 'vitest';
import { ensureRestrictedSecurityContext } from '/@/lib/pod/pod-utils';

function verifyPodSecurityContext(containers: any[], type = 'RuntimeDefault') {
  containers.forEach(container => {
    const securityContext = container.securityContext;
    expect(securityContext).toBeDefined();
    expect(securityContext.allowPrivilegeEscalation).toBeFalsy();
    expect(securityContext.runAsNonRoot).toBeTruthy();
    expect(securityContext.seccompProfile).toBeDefined();
    expect(securityContext.seccompProfile.type).toBe(type);
    expect(securityContext.capabilities).toBeDefined();
    expect(securityContext.capabilities.drop).toBeDefined();
    expect(securityContext.capabilities.drop).toContain('ALL');
  });
}

test('Expect security context to be added to single container pod', async () => {
  const pod = {
    kind: 'Pod',
    apiversion: 'v1',
    spec: {
      containers: [{ image: 'image' }],
    },
  };
  ensureRestrictedSecurityContext(pod);
  verifyPodSecurityContext(pod.spec.containers);
});

test('Expect security context to be keep seccompProfile.type', async () => {
  const pod = {
    kind: 'Pod',
    apiversion: 'v1',
    spec: {
      containers: [
        {
          image: 'image',
          securityContext: {
            seccompProfile: {
              type: 'Localhost',
            },
          },
        },
      ],
    },
  };
  ensureRestrictedSecurityContext(pod);
  verifyPodSecurityContext(pod.spec.containers, 'Localhost');
});

test('Expect security context to be added to dual containers pod', async () => {
  const pod = {
    kind: 'Pod',
    apiversion: 'v1',
    spec: {
      containers: [{ image: 'image1' }, { image: 'image2' }],
    },
  };
  ensureRestrictedSecurityContext(pod);
  verifyPodSecurityContext(pod.spec.containers);
});
