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

import '@testing-library/jest-dom/vitest';

import type {
  V1ConfigMapVolumeSource,
  V1Container,
  V1PersistentVolumeClaimVolumeSource,
  V1Pod,
  V1PodSpec,
  V1PodStatus,
  V1SecretVolumeSource,
  V1Volume,
} from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubeDetailsSummary from './KubePodDetailsSummary.svelte';

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

// Test render KubeDetailsSummary with the V1Pod object
test('KubeDetailsSummary renders with V1Pod object', async () => {
  // Render
  render(KubeDetailsSummary, { pod: fakePod });

  // Check that the rendered text is correct
  expect(screen.getByText('fakepod')).toBeInTheDocument();
  expect(screen.getByText('Running')).toBeInTheDocument();
  expect(screen.getByText('fake-service-account')).toBeInTheDocument();
  expect(screen.getByText('Always')).toBeInTheDocument();
  expect(screen.getAllByText('fake-container')[0]).toBeInTheDocument();
  expect(screen.getByText('fake-image')).toBeInTheDocument();
  expect(screen.getByText('ENV_VAR1: value1')).toBeInTheDocument();
  expect(screen.getByText('ENV_VAR2: value2')).toBeInTheDocument();
  expect(screen.getByText('secret-volume')).toBeInTheDocument();
  expect(screen.getByText('configmap-volume')).toBeInTheDocument();
  expect(screen.getByText('pvc-volume')).toBeInTheDocument();
  expect(screen.getByText('secret-volume')).toBeInTheDocument();
  expect(screen.getByText('configmap-volume')).toBeInTheDocument();
  expect(screen.getByText('pvc-volume')).toBeInTheDocument();
});
