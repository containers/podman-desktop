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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import GitHubIssueFeedback from './GitHubIssueFeedback.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'openExternal', {
    value: vi.fn(),
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect feedback form to to be GitHub issue feedback form', async () => {
  render(GitHubIssueFeedback, { category: 'bug' });

  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Description')).toBeInTheDocument();
});

test('Expect Preview on GitHub button to be disabled if there is no title or description', async () => {
  render(GitHubIssueFeedback, { category: 'bug' });

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

test('Expect to have different placeholders for bug vs feaure', async () => {
  const renderObject = render(GitHubIssueFeedback, { category: 'bug' });
  let issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  expect(issueTitle).toHaveProperty('placeholder', 'Bug Report Title');

  let issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  expect(issueDescription).toHaveProperty('placeholder', 'Bug description');

  renderObject.unmount();

  render(GitHubIssueFeedback, { category: 'feature' });

  issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  expect(issueTitle).toHaveProperty('placeholder', 'Feature name');

  issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  expect(issueDescription).toHaveProperty('placeholder', 'Feature description');
});

test('Expect to have different existing GitHub issues links for bug and feature categories', async () => {
  const renderObject = render(GitHubIssueFeedback, { category: 'bug' });
  let existingIssues = screen.getByLabelText('GitHub issues');
  expect(existingIssues).toBeInTheDocument();

  await userEvent.click(existingIssues);
  expect(window.openExternal).toHaveBeenCalledWith(
    'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Fbug%20%F0%9F%90%9E%22',
  );
  renderObject.unmount();

  render(GitHubIssueFeedback, { category: 'feature' });
  existingIssues = screen.getByLabelText('GitHub issues');
  expect(existingIssues).toBeInTheDocument();

  await userEvent.click(existingIssues);
  expect(window.openExternal).toHaveBeenCalledWith(
    'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Ffeature%20%F0%9F%92%A1%22',
  );
});
