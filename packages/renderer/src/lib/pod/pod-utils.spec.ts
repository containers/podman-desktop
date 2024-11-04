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

import { expect, test } from 'vitest';

import { ensureRestrictedSecurityContext, PodUtils } from '/@/lib/pod/pod-utils';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';

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

test('Expect return a valid name for a new pod', () => {
  const podUtils = new PodUtils();
  const newPodName = podUtils.calculateNewPodName();

  expect(newPodName).toBe('my-pod');
});

test('Expect return a valid name for a new pod if there is a pod with the same name', () => {
  const podUtils = new PodUtils();
  const newPodName = podUtils.calculateNewPodName([{ Name: 'my-pod' } as PodInfo]);

  expect(newPodName).toBe('my-pod-1');
});

test('Expect return a valid name for a new pod if there is a pods with different names', () => {
  const podUtils = new PodUtils();
  const newPodName = podUtils.calculateNewPodName([{ Name: 'my-super-pod' } as PodInfo]);

  expect(newPodName).toBe('my-pod');
});

test('Expect return a valid name for a new pod if there are pods with the same name', () => {
  const podUtils = new PodUtils();
  const newPodName = podUtils.calculateNewPodName([{ Name: 'my-pod' } as PodInfo, { Name: 'my-pod-1' } as PodInfo]);

  expect(newPodName).toBe('my-pod-2');
});

test('Expect to get node and namespace from pod info', () => {
  const podUtils = new PodUtils();
  const podInfo = {
    kind: 'kubernetes',
    node: 'node1',
    Namespace: 'default',
    Id: 'pod-id',
  } as unknown as PodInfo;
  const pod = podUtils.getPodInfoUI(podInfo);

  expect(pod.node).toBe('node1');
  expect(pod.namespace).toBe('default');

  // Expect the date to be undefined because we did not pass any Created values in podInfo
  expect(pod.created).toBe(undefined);
});

test('Expect k8s format to convert to humanizedDuration format correctly', () => {
  // Expect age to show 2 years
  const created = new Date();
  created.setFullYear(created.getFullYear() - 2);
  const podUtils = new PodUtils();
  const podInfo = {
    kind: 'kubernetes',
    Namespace: 'default',
    Id: 'pod-id',
    Created: created.toISOString(),
  } as unknown as PodInfo;
  const pod = podUtils.getPodInfoUI(podInfo);
  expect(pod.age).toBe('2 years');

  // Do the same for 2 months
  const created2 = new Date();
  created2.setMonth(created.getMonth() - 2);
  podInfo.Created = created2.toISOString();
  const pod2 = podUtils.getPodInfoUI(podInfo);
  expect(pod2.age).toBe('2 months');

  // Expect age to show 2 days
  const created3 = new Date();
  created3.setDate(created.getDate() - 2);
  podInfo.Created = created3.toISOString();
  const pod3 = podUtils.getPodInfoUI(podInfo);
  expect(pod3.age).toBe('2 days');

  // Expect age to be 2 hours
  const created4 = new Date();
  created4.setHours(created.getHours() - 2);
  podInfo.Created = created4.toISOString();
  const pod4 = podUtils.getPodInfoUI(podInfo);
  expect(pod4.age).toBe('2 hours');
});
