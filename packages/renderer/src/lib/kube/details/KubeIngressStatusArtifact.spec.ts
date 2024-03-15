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

import type { V1IngressStatus } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import KubeIngressStatusArtifact from './KubeIngressStatusArtifact.svelte';

const validIngressStatus: V1IngressStatus = {
  loadBalancer: {
    ingress: [{ ip: '192.168.1.1' }, { hostname: 'example.com' }],
  },
};

describe('KubeIngressStatusArtifact', () => {
  test('renders load balancer ingress information correctly', async () => {
    render(KubeIngressStatusArtifact, { artifact: validIngressStatus });

    // Check if the Title "Status" is rendered
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check if the Cell "Load Balancer" is rendered
    expect(screen.getByText('Load Balancer')).toBeInTheDocument();

    // Verify that the ingress IP and hostname are rendered
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  test('does not render without loadBalancer.ingress', async () => {
    const invalidIngressStatus = {
      loadBalancer: {
        // Missing ingress array
      },
    };
    render(KubeIngressStatusArtifact, { artifact: invalidIngressStatus });

    // Attempt to find elements that should not be rendered
    const statusElement = screen.queryByText('Status');
    expect(statusElement).toBeNull();

    const loadBalancerElement = screen.queryByText('Load Balancer');
    expect(loadBalancerElement).toBeNull();
  });
});
