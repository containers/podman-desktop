/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import type {
  CoreV1Event,
  V1ConfigMapVolumeSource,
  V1Container,
  V1PersistentVolumeClaimVolumeSource,
  V1Pod,
  V1PodSpec,
  V1PodStatus,
  V1SecretVolumeSource,
  V1Volume,
} from '@kubernetes/client-node';
import { render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import * as kubePodDetailsSummary from '../kube/KubePodDetailsSummary.svelte';
import PodDetailsSummary from './PodDetailsSummary.svelte';
import type { PodInfoUI } from './PodInfoUI';

const fakePod: V1Pod = {
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: {
    name: 'fakepod',
    annotations: {
      'example.com/annotation1': 'annotation-value1',
      'example.com/annotation2': 'annotation-value2',
    },
    // Use Date object to avoid timezone issues
    creationTimestamp: new Date('2021-01-01T00:00:00Z'),
  },
  spec: {
    serviceAccountName: 'fake-service-account',
    restartPolicy: 'Always',
    containers: [
      {
        name: 'fake-container',
        image: 'fake-image',
        env: [
          {
            name: 'ENV_VAR1',
            value: 'value1',
          },
          {
            name: 'ENV_VAR2',
            value: 'value2',
          },
        ],
        volumeMounts: [
          {
            name: 'secret-volume',
            mountPath: '/etc/secret',
          },
          {
            name: 'configmap-volume',
            mountPath: '/etc/config',
          },
          {
            name: 'pvc-volume',
            mountPath: '/data',
          },
        ],
      } as V1Container,
    ],
    volumes: [
      {
        name: 'secret-volume',
        secret: {
          secretName: 'fake-secret',
        } as V1SecretVolumeSource,
      },
      {
        name: 'configmap-volume',
        configMap: {
          name: 'fake-configmap',
        } as V1ConfigMapVolumeSource,
      },
      {
        name: 'pvc-volume',
        persistentVolumeClaim: {
          claimName: 'fake-pvc',
        } as V1PersistentVolumeClaimVolumeSource,
      },
    ] as V1Volume[],
  } as V1PodSpec,
  status: {
    phase: 'Running',
  } as V1PodStatus,
};

// Create a fake PodInfoUI
const fakePodInfoUI: PodInfoUI = {
  id: '012345',
  shortId: '012345',
  name: 'fakepod',
  engineId: 'fakeengineid',
  engineName: 'fakeenginename',
  status: 'Running',
  age: '1h',
  created: '2021-01-01T00:00:00Z',
  selected: false,
  containers: [
    {
      Id: 'fakecontainer',
      Names: 'fakecontainername',
      Status: 'Running',
    },
  ],
  kind: 'kubernetes',
};

const fakePodV1: V1Pod = {
  metadata: {
    uid: '12345678',
    name: 'fakepod',
  },
};

const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesReadNamespacedPodMock = vi.fn();

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {
    kubernetesCurrentContextEvents: vi.fn(),
  };
});

beforeEach(() => {
  Object.defineProperty(window, 'kubernetesGetCurrentNamespace', {
    value: kubernetesGetCurrentNamespaceMock,
  });
  Object.defineProperty(window, 'kubernetesReadNamespacedPod', {
    value: kubernetesReadNamespacedPodMock,
  });
});

test('Render with a kubernetes object', async () => {
  // Mock the values
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedPodMock.mockResolvedValue(fakePod);

  const eventsStore = writable<CoreV1Event[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextEvents = eventsStore;

  render(PodDetailsSummary, { pod: JSON.parse(JSON.stringify(fakePodInfoUI)) });

  // Wait for the mock to be called as it sometimes takes a few ms
  await waitFor(() => expect(kubernetesReadNamespacedPodMock).toHaveBeenCalled());

  // Test that 'fake-secret' shows up
  expect(screen.getByText('fake-secret')).toBeInTheDocument();
});

test('Render the pod information when pod object is kind == podman', async () => {
  // Mock the values
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedPodMock.mockResolvedValue(undefined);

  const fakePodInfo = JSON.parse(JSON.stringify(fakePodInfoUI));
  fakePodInfo.kind = 'podman';
  render(PodDetailsSummary, { pod: JSON.parse(JSON.stringify(fakePodInfo)) });

  // Expect the pod name, id, container.Names and container.Id to show
  expect(screen.getByText('fakepod')).toBeInTheDocument();
  expect(screen.getByText('012345')).toBeInTheDocument();

  // Expect 'fakecontainername' and 'fakecontainer' to show
  expect(screen.getByText('fakecontainername')).toBeInTheDocument();
  expect(screen.getByText('fakecontainer')).toBeInTheDocument();
});

test('Expect KubePodDetailsSummary to be called with related events only', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedPodMock.mockResolvedValue(fakePodV1);
  const kubePodDetailsSummarySpy = vi.spyOn(kubePodDetailsSummary, 'default');
  // mock object stores
  const events: CoreV1Event[] = [
    {
      metadata: {
        name: 'event1',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event2',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event3',
      },
      involvedObject: { uid: '1234' },
    },
  ];
  const eventsStore = writable<CoreV1Event[]>(events);
  vi.mocked(kubeContextStore).kubernetesCurrentContextEvents = eventsStore;

  render(PodDetailsSummary, { pod: fakePodInfoUI });
  await waitFor(() => {
    expect(kubePodDetailsSummarySpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        events: [events[0], events[1]],
      }),
    );
  });
});
