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

import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import ContainerDetailsSummary from './ContainerDetailsSummary.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

test('Expect container command to be displayed as an array', async () => {
  const container: ContainerInfoUI = {
    shortId: 'myContainer',
    command: ['sh', '-c', 'something', 'else'],
    state: 'RUNNING',
    hasPublicPort: false,
  } as unknown as ContainerInfoUI;

  render(ContainerDetailsSummary, { container });
  expect(screen.getByTestId('container-details-command-td')).toHaveTextContent('["sh", "-c", "something", "else"]');
});

describe('Expect command to be hidden if command is an empty array or undefined', async () => {
  // eslint-disable-next-line no-null/no-null
  test.each([[], undefined, null])('given %p should not be visible', async command => {
    const container: ContainerInfoUI = {
      shortId: 'myContainer',
      command: command,
      state: 'RUNNING',
      hasPublicPort: false,
    } as unknown as ContainerInfoUI;

    render(ContainerDetailsSummary, { container });
    expect(screen.getByTestId('container-details-command-tr').classList.contains('hidden')).to.be.true;
  });
});
