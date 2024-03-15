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

import type { V1IngressSpec } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubeIngressArtifact from './KubeIngressArtifact.svelte';

const fakeIngress: V1IngressSpec = {
  rules: [
    {
      host: 'example.com',
      http: {
        paths: [
          {
            path: '/api',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'api-service',
                port: {
                  number: 8080,
                },
              },
            },
          },
        ],
      },
    },
  ],
  tls: [
    {
      hosts: ['example.com'],
      secretName: 'example-tls',
    },
  ],
};

test('Ingress artifact renders with correct values', async () => {
  render(KubeIngressArtifact, { artifact: fakeIngress });

  expect(screen.getByText(/Path: \/api/)).toBeInTheDocument();
  expect(screen.getByText(/https:\/\/example\.com\/api/)).toBeInTheDocument();
  expect(screen.getByText(/api-service:8080/)).toBeInTheDocument();
});
