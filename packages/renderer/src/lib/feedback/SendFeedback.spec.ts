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

import { render } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { FeedbackCategory } from '/@api/feedback';

import SendFeedback from './SendFeedback.svelte';

const mocks = vi.hoisted(() => ({
  gitHubIssueMock: vi.fn(),
  developersFeedbackMock: vi.fn(),
}));

vi.mock('./GitHubIssueFeedback.svelte', () => ({
  default: mocks.gitHubIssueMock,
}));

vi.mock('./DevelopersFeedback.svelte', () => ({
  default: mocks.developersFeedbackMock,
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

  // click on a smiley
  expect(mocks.developersFeedbackMock).toBeCalled();
});

test('Expect GitHubIssue feedback form to be rendered if category is not developers', async () => {
  const feedbackCategory: FeedbackCategory = 'bug';
  render(SendFeedback, { category: feedbackCategory });

  // click on a smiley
  expect(mocks.gitHubIssueMock).toBeCalled();
});
