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

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import GitHubIssueFeedback from './GitHubIssueFeedback.svelte';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).openExternal = vi.fn();
});

test('Expect feedback form to change to bug form when selected as category', async () => {
  render(GitHubIssueFeedback, {});

  // click on a smiley
  const categorySelect = screen.getByRole('button', { name: /Direct your words to the developers/ });
  expect(categorySelect).toBeInTheDocument();
  categorySelect.focus();

  // select the Feature request category
  await userEvent.keyboard('[ArrowDown]');
  const bugCategory = screen.getByRole('button', { name: /Bug/ });
  expect(bugCategory).toBeInTheDocument();
  await fireEvent.click(bugCategory);

  await tick();

  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Description')).toBeInTheDocument();
});

test('Expect bug GitHub link to include bug title and description', async () => {
  render(GitHubIssueFeedback, {});

  // click on a smiley
  const categorySelect = screen.getByRole('button', { name: /Direct your words to the developers/ });
  expect(categorySelect).toBeInTheDocument();
  categorySelect.focus();

  // select the Feature request category
  await userEvent.keyboard('[ArrowDown]');
  const bugCategory = screen.getByRole('button', { name: /Bug/ });
  expect(bugCategory).toBeInTheDocument();
  await fireEvent.click(bugCategory);

  await tick();

  const bugTitle = screen.getByRole('textbox', { name: 'Title' });
  expect(bugTitle).toBeInTheDocument();
  await userEvent.type(bugTitle, 'PD is not working');

  const bugDescription = screen.getByRole('textbox', { name: 'Description' });
  expect(bugDescription).toBeInTheDocument();
  await userEvent.type(bugDescription, 'bug description');

  const gitHubButton = screen.getByRole('button', { name: 'Preview on GitHub' });
  expect(gitHubButton).toBeInTheDocument();
  await fireEvent.click(gitHubButton);

  expect(window.openExternal).toHaveBeenCalledWith(
    'https://github.com/containers/podman-desktop/issues/new?template=bug_report.yml&title=PD+is+not+working&bug-description=bug+description',
  );
});
