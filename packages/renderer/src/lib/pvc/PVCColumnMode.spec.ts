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

import PVCColumnMode from './PVCColumnMode.svelte';

const fakePVC = {
  name: 'my-pvc',
  namespace: 'default',
  status: 'Available',
  volume: '1Gi',
  accessModes: ['ReadWriteOnce'],
  storageClass: 'standard',
  size: '1Gi',
  selected: false,
};

test('Expect mode display', async () => {
  render(PVCColumnMode, { object: fakePVC });

  const text = screen.getByText('ReadWriteOnce');
  expect(text).toBeInTheDocument();
});
