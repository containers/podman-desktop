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
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import GitHubIssueFeedback from './GitHubIssueFeedback.svelte';

const openExternalMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'openExternal', {
    value: openExternalMock,
  });
});

test('Expect feedback form to to be bug feedback form', async () => {
  render(GitHubIssueFeedback, {});

  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Description')).toBeInTheDocument();
});

test('Expect Preview on GitHub button to be disabled if there is no title or description', async () => {
  render(GitHubIssueFeedback, {});

  expect(screen.getByRole('button', { name: 'Preview on GitHub' })).toBeDisabled();

  const issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  await userEvent.type(issueTitle, 'Bug title');

  const issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  await userEvent.type(issueDescription, 'Bug description');

  await tick();
  expect(screen.getByRole('button', { name: 'Preview on GitHub' })).toBeEnabled();
});
