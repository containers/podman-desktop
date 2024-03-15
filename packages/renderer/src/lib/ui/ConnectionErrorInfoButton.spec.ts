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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ConnectionErrorInfoButton from './ConnectionErrorInfoButton.svelte';

test('Expect nothing if status is undefined', async () => {
  render(ConnectionErrorInfoButton, {
    status: undefined,
  });

  // check element does not exists
  const button = screen.queryByRole('button', { name: 'action failed' });
  expect(button).not.toBeInTheDocument();
});

test('Expect error button if status action and error are defined', async () => {
  render(ConnectionErrorInfoButton, {
    status: {
      action: 'action',
      error: 'error',
      inProgress: false,
      status: 'failed',
    },
  });

  // check element does exist
  const button = screen.getByRole('button', { name: 'action failed' });
  expect(button).toBeInTheDocument();
});

test('Expect nothing if status action is not defined', async () => {
  render(ConnectionErrorInfoButton, {
    status: {
      error: 'error',
      inProgress: false,
      status: 'failed',
    },
  });

  // check element does not exists
  const button = screen.queryByRole('button', { name: 'action failed' });
  expect(button).not.toBeInTheDocument();
});

test('Expect nothing if status error is not defined', async () => {
  render(ConnectionErrorInfoButton, {
    status: {
      action: 'action',
      inProgress: false,
      status: 'failed',
    },
  });

  // check element does not exists
  const button = screen.queryByRole('button', { name: 'action failed' });
  expect(button).not.toBeInTheDocument();
});
