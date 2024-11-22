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
import { beforeAll, expect, test, vi } from 'vitest';

import DevelopersFeedback from './feedbackForms/DevelopersFeedback.svelte';
import GitHubIssueFeedback from './feedbackForms/GitHubIssueFeedback.svelte';
import SendFeedback from './SendFeedback.svelte';

vi.mock('./feedbackForms/GitHubIssueFeedback.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('./feedbackForms/DevelopersFeedback.svelte', () => ({
  default: vi.fn(),
}));

beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect developers feedback form to be rendered by default', async () => {
  render(SendFeedback, {});

  expect(vi.mocked(DevelopersFeedback)).toBeCalled();
});

test('Expect GitHubIssue feedback form to be rendered if category is not developers', async () => {
  render(SendFeedback, {});

  const categorySelect = screen.getByRole('button', { name: /Direct your words to the developers/ });
  expect(categorySelect).toBeInTheDocument();
  categorySelect.focus();

  // select the Feature request category
  await userEvent.keyboard('[ArrowDown]');
  const bugCategory = screen.getByRole('button', { name: /Bug/ });
  expect(bugCategory).toBeInTheDocument();
  await fireEvent.click(bugCategory);
  // click on a smiley
  expect(vi.mocked(GitHubIssueFeedback)).toHaveBeenNthCalledWith(1, expect.anything(), {
    onCloseForm: expect.any(Function),
    category: 'bug',
    contentChange: expect.any(Function),
  });

  categorySelect.focus();

  // select the Feature request category
  await userEvent.keyboard('[ArrowDown]');
  const featureCategory = screen.getByRole('button', { name: /Feature/ });
  await fireEvent.click(featureCategory);
  expect(vi.mocked(GitHubIssueFeedback)).toHaveBeenNthCalledWith(2, expect.anything(), {
    onCloseForm: expect.any(Function),
    category: 'feature',
    contentChange: expect.any(Function),
  });
});
