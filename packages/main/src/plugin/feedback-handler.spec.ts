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

import { shell } from 'electron';
import { beforeEach, expect, test, vi } from 'vitest';

import type { GitHubIssueProperties } from '/@api/feedback.js';

import { FeedbackHandler } from './feedback-handler.js';

beforeEach(() => {
  vi.mock('electron', () => ({
    shell: {
      openExternal: vi.fn(),
    },
  }));
});

const issueProperties: GitHubIssueProperties = {
  category: 'bug',
  issueTitle: 'PD is not working',
  issueDescription: 'bug description',
};

const queryParams = 'template=bug_report.yml&title=PD+is+not+working&bug-description=bug+description';

test('Expect openExternal to be called with queryParams', async () => {
  const feedbackHandler = new FeedbackHandler();
  await feedbackHandler.openGitHubIssue(issueProperties);
  expect(shell.openExternal).toBeCalledWith(`https://github.com/containers/podman-desktop/issues/new?${queryParams}`);
});
