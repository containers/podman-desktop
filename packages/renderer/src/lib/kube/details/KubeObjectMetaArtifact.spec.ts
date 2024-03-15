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

import type { V1ObjectMeta } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubeObjectMetaArtifact from './KubeObjectMetaArtifact.svelte';

const fakeObjectMeta: V1ObjectMeta = {
  name: 'test-name',
  namespace: 'test-namespace',
  labels: {
    'custom-label': 'custom-value',
  },
  annotations: {
    'custom-annotation': 'custom-value',
  },
};

test('Renders object meta correctly', () => {
  render(KubeObjectMetaArtifact, { artifact: fakeObjectMeta });
  expect(screen.getByText('Metadata')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('test-name')).toBeInTheDocument();
  expect(screen.getByText('Namespace')).toBeInTheDocument();
  expect(screen.getByText('test-namespace')).toBeInTheDocument();
  expect(screen.getByText('Created')).toBeInTheDocument();
  expect(screen.getByText('Labels')).toBeInTheDocument();
  expect(screen.getByText('custom-label: custom-value')).toBeInTheDocument();
  expect(screen.getByText('Annotations')).toBeInTheDocument();
  expect(screen.getByText('custom-annotation: custom-value')).toBeInTheDocument();
});
