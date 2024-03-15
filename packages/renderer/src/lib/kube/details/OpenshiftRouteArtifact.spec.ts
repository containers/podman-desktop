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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import type { V1Route } from '../../../../../main/src/plugin/api/openshift-types';
import OpenshiftRouteArtifact from './OpenshiftRouteArtifact.svelte';

const fakeRoute: V1Route = {
  apiVersion: 'v1',
  kind: 'Route',
  metadata: {
    name: 'example-route',
    namespace: 'default',
    annotations: { 'annotation-key': 'annotation-value' },
    labels: { 'label-key': 'label-value' },
  },
  spec: {
    host: 'example.com',
    path: '/api',
    port: {
      targetPort: 'http2',
    },
    tls: {
      termination: 'edge',
      insecureEdgeTerminationPolicy: 'Redirect',
    },
    to: {
      kind: 'Service',
      name: 'backend-service',
      weight: 100,
    },
    wildcardPolicy: 'None',
  },
};

test('Renders V1Route details correctly with hardcoded values', () => {
  render(OpenshiftRouteArtifact, { artifact: fakeRoute });

  // Verify metadata and spec details are displayed
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.getByText('Host')).toBeInTheDocument();
  expect(screen.getByText('example.com')).toBeInTheDocument();
  expect(screen.getByText('Path')).toBeInTheDocument();
  expect(screen.getByText('/api')).toBeInTheDocument();
  expect(screen.getByText('Port')).toBeInTheDocument();
  expect(screen.getByText('http2')).toBeInTheDocument();
  expect(screen.getByText('TLS')).toBeInTheDocument();
  expect(screen.getByText('Termination: edge • Insecure Edge Policy: Redirect')).toBeInTheDocument();
  expect(screen.getByText('Backend')).toBeInTheDocument();
  expect(screen.getByText('Service / backend-service (Weight: 100)')).toBeInTheDocument();
  expect(screen.getByText('Link')).toBeInTheDocument();
  expect(screen.getByText(`https://example.com/api`)).toBeInTheDocument(); // Verifying the constructed link
});
