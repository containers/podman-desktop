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

import KubeServiceSpecArtifact from './KubeServiceArtifact.svelte'; // Adjust the import path as necessary

const fakeServiceSpec = {
  type: 'ClusterIP',
  clusterIP: '10.96.0.1',
  externalIPs: ['192.168.1.1', '192.168.1.2'],
  sessionAffinity: 'None',
  ports: [
    { name: 'http', port: 80, protocol: 'TCP' },
    { name: 'http2', port: 80, nodePort: 12345, protocol: 'TCP' },
    { port: 443, protocol: 'TCP' },
  ],
  selector: {
    app: 'myApp',
    department: 'engineering',
  },
};

test('Renders service spec correctly', () => {
  render(KubeServiceSpecArtifact, { artifact: fakeServiceSpec });

  // Verify static details
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(screen.getByText('ClusterIP')).toBeInTheDocument();
  expect(screen.getByText('Cluster IP')).toBeInTheDocument();
  expect(screen.getByText('10.96.0.1')).toBeInTheDocument();
  expect(screen.getByText('External IPs')).toBeInTheDocument();
  expect(screen.getByText('192.168.1.1, 192.168.1.2')).toBeInTheDocument();
  expect(screen.getByText('Session Affinity')).toBeInTheDocument();
  expect(screen.getByText('None')).toBeInTheDocument();

  // Verify ports are displayed correctly
  expect(screen.getByText('Ports')).toBeInTheDocument();
  expect(screen.getByText('http:80/TCP')).toBeInTheDocument();
  expect(screen.getByText('http2:80:12345/TCP')).toBeInTheDocument();
  expect(screen.getByText('443/TCP')).toBeInTheDocument();

  // Verify selectors are displayed correctly
  expect(screen.getByText('Selectors')).toBeInTheDocument();
  expect(screen.getByText('app: myApp')).toBeInTheDocument();
  expect(screen.getByText('department: engineering')).toBeInTheDocument();
});
