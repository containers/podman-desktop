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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import IngressRouteColumnStatus from './IngressRouteColumnStatus.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

test('Expect simple column styling with Ingress', async () => {
  const ingressUI: IngressUI = {
    name: 'my-ingress',
    namespace: 'test-namespace',
    status: 'RUNNING',
    selected: false,
  };
  render(IngressRouteColumnStatus, { object: ingressUI });

  const text = screen.getByRole('status');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('bg-[var(--pd-status-running)]');
});

test('Expect simple column styling with Route', async () => {
  const routeUI: RouteUI = {
    name: 'my-route',
    namespace: 'test-namespace',
    status: 'RUNNING',
    host: 'foo.bar.com',
    port: '80',
    to: {
      kind: 'Service',
      name: 'service',
    },
    selected: false,
    tlsEnabled: false,
  };
  render(IngressRouteColumnStatus, { object: routeUI });

  const text = screen.getByRole('status');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('bg-[var(--pd-status-running)]');
});
