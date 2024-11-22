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

import type { GitHubIssue } from '/@api/feedback';

import GitHubIssueFeedback from './GitHubIssueFeedback.svelte';

const openExternalMock = vi.fn();
const previewOnGitHubMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      openExternal: openExternalMock,
      previewOnGitHub: previewOnGitHubMock,
      navigator: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect feedback form to to be GitHub issue feedback form', async () => {
  const renderObject = render(GitHubIssueFeedback, { category: 'bug', onCloseForm: vi.fn(), contentChange: vi.fn() });

  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Description')).toBeInTheDocument();
  renderObject.unmount();
});

test('Expect Preview on GitHub button to be disabled if there is no title or description', async () => {
  const renderObject = render(GitHubIssueFeedback, { category: 'bug', onCloseForm: vi.fn(), contentChange: vi.fn() });

  expect(screen.getByRole('button', { name: 'Preview on GitHub' })).toBeDisabled();

  const issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  await userEvent.type(issueTitle, 'Bug title');

  const issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  await userEvent.type(issueDescription, 'Bug description');

  await tick();
  expect(screen.getByRole('button', { name: 'Preview on GitHub' })).toBeEnabled();
  renderObject.unmount();
});

test('Expect to have different placeholders for bug vs feaure', async () => {
  let renderObject = render(GitHubIssueFeedback, { category: 'bug', onCloseForm: vi.fn(), contentChange: vi.fn() });

  let issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  expect(issueTitle).toHaveProperty('placeholder', 'Bug Report Title');

  let issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  expect(issueDescription).toHaveProperty('placeholder', 'Bug description');

  renderObject.unmount();

  renderObject = render(GitHubIssueFeedback, { category: 'feature', onCloseForm: vi.fn(), contentChange: vi.fn() });

  issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  expect(issueTitle).toHaveProperty('placeholder', 'Feature name');

  issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  expect(issueDescription).toHaveProperty('placeholder', 'Feature description');
  renderObject.unmount();
});

test('Expect to have different existing GitHub issues links for bug and feature categories', async () => {
  let renderObject = render(GitHubIssueFeedback, { category: 'bug', onCloseForm: vi.fn(), contentChange: vi.fn() });
  let existingIssues = screen.getByLabelText('GitHub issues');
  expect(existingIssues).toBeInTheDocument();

  await userEvent.click(existingIssues);
  expect(openExternalMock).toHaveBeenCalledWith(
    'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Fbug%20%F0%9F%90%9E%22',
  );
  renderObject.unmount();

  renderObject = render(GitHubIssueFeedback, { category: 'feature', onCloseForm: vi.fn(), contentChange: vi.fn() });
  existingIssues = screen.getByLabelText('GitHub issues');
  expect(existingIssues).toBeInTheDocument();

  await userEvent.click(existingIssues);
  expect(openExternalMock).toHaveBeenCalledWith(
    'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Ffeature%20%F0%9F%92%A1%22',
  );
  renderObject.unmount();
});

test('Expect the right category to be included in previewOnGitHub call', async () => {
  const issueProperties: GitHubIssue = {
    category: 'bug',
    title: 'Bug title',
    description: 'Bug description',
  };
  const renderObject = render(GitHubIssueFeedback, { category: 'bug', onCloseForm: vi.fn(), contentChange: vi.fn() });
  const previewButton = screen.getByRole('button', { name: 'Preview on GitHub' });

  const issueTitle = screen.getByTestId('issueTitle');
  expect(issueTitle).toBeInTheDocument();
  await userEvent.type(issueTitle, 'Bug title');

  const issueDescription = screen.getByTestId('issueDescription');
  expect(issueDescription).toBeInTheDocument();
  await userEvent.type(issueDescription, 'Bug description');

  await userEvent.click(previewButton);

  expect(previewOnGitHubMock).toHaveBeenCalledWith(issueProperties);
  renderObject.unmount();
});
