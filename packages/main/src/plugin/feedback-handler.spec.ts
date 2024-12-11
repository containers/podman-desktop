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

import { release } from 'node:os';

import { shell } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExtensionLoader } from '/@/plugin/extension-loader.js';
import { isLinux, isMac, isWindows } from '/@/util.js';
import type { ExtensionInfo } from '/@api/extension-info.js';
import type { GitHubIssue } from '/@api/feedback.js';

import { FeedbackHandler } from './feedback-handler.js';

vi.mock('electron', () => ({
  shell: {
    openExternal: vi.fn(),
  },
}));

vi.mock('/@/util.js', () => ({
  isLinux: vi.fn(),
  isMac: vi.fn(),
  isWindows: vi.fn(),
}));

vi.mock('node:os', () => ({
  release: vi.fn(),
}));

const extensionLoaderMock: ExtensionLoader = {
  listExtensions: vi.fn(),
} as unknown as ExtensionLoader;

const STARTED_EXTENSION: ExtensionInfo = {
  state: 'started',
  id: 'dummy-started-extension',
} as ExtensionInfo;

const STOPPED_EXTENSION: ExtensionInfo = {
  state: 'stopped',
  id: 'dummy-stopped-extension',
} as ExtensionInfo;

beforeEach(() => {
  vi.resetAllMocks();

  // default to linux for testing
  vi.mocked(isLinux).mockReturnValue(true);
  vi.mocked(isMac).mockReturnValue(false);
  vi.mocked(isWindows).mockReturnValue(false);

  vi.mocked(extensionLoaderMock.listExtensions).mockResolvedValue([STARTED_EXTENSION, STOPPED_EXTENSION]);
});

/**
 * Utility method to ensure an url provided contains the param provided
 * as search values
 * @param url
 * @param params
 */
function containSearchParams(url: string | undefined, params: Record<string, string>): void {
  if (url === undefined) throw new Error('undefined url');

  const search = new URLSearchParams(new URL(url).search);
  Object.entries(params).forEach(([key, value]) => {
    expect(search.has(key), `expected url to have ${key} as query parameter`).toBeTruthy();
    expect(search.get(key), `expected ${search.get(key)} to be ${value}`).toBe(value);
  });
}

describe('openGitHubIssue', () => {
  test('Expect openExternal to be called with queryParams and bug report template', async () => {
    const issueProperties: GitHubIssue = {
      category: 'bug',
      title: 'PD is not working',
      description: 'bug description',
    };

    const feedbackHandler = new FeedbackHandler(extensionLoaderMock);
    await feedbackHandler.openGitHubIssue(issueProperties);

    expect(shell.openExternal).toHaveBeenCalledOnce();

    // extract the first argument of the shell.openExternal call
    const url: string | undefined = vi.mocked(shell.openExternal).mock.calls[0]?.[0];
    containSearchParams(url, {
      template: 'bug_report.yml',
      title: 'PD is not working',
      'bug-description': 'bug description',
    });
  });

  test('Expect openExternal to be called with queryParams and feature request template', async () => {
    const issueProperties: GitHubIssue = {
      category: 'feature',
      title: 'new feature',
      description: 'feature description',
    };

    const feedbackHandler = new FeedbackHandler(extensionLoaderMock);
    await feedbackHandler.openGitHubIssue(issueProperties);

    expect(shell.openExternal).toHaveBeenCalledOnce();

    // extract the first argument of the shell.openExternal call
    const url: string | undefined = vi.mocked(shell.openExternal).mock.calls[0]?.[0];
    containSearchParams(url, {
      template: 'feature_request.yml',
      title: 'new feature',
      solution: 'feature description',
    });
  });

  test('expect os info to be included if includeSystemInfo is true', async () => {
    vi.mocked(release).mockReturnValue('dummy-release');

    const issueProperties: GitHubIssue = {
      category: 'bug',
      title: 'PD is not working',
      description: 'bug description',
      includeSystemInfo: true,
    };

    const feedbackHandler = new FeedbackHandler(extensionLoaderMock);
    await feedbackHandler.openGitHubIssue(issueProperties);

    expect(shell.openExternal).toHaveBeenCalledOnce();

    // extract the first argument of the shell.openExternal call
    const url: string | undefined = vi.mocked(shell.openExternal).mock.calls[0]?.[0];
    containSearchParams(url, {
      os: 'Linux - dummy-release',
    });
  });

  test('expect enabled extensions to be included if includeExtensionInfo is true', async () => {
    const issueProperties: GitHubIssue = {
      category: 'bug',
      title: 'PD is not working',
      description: 'bug description',
      includeSystemInfo: false,
      includeExtensionInfo: true,
    };

    const feedbackHandler = new FeedbackHandler(extensionLoaderMock);
    await feedbackHandler.openGitHubIssue(issueProperties);

    expect(shell.openExternal).toHaveBeenCalledOnce();

    // extract the first argument of the shell.openExternal call
    const url: string | undefined = vi.mocked(shell.openExternal).mock.calls[0]?.[0];
    containSearchParams(url, {
      'additional-context': '**Enabled Extensions**\n- dummy-started-extension',
    });
  });

  test('expect extensions to be sorted', async () => {
    const extensions: ExtensionInfo[] = [
      {
        id: 'b',
        name: 'b',
        state: 'started',
      },
      {
        id: 'a',
        name: 'a',
        state: 'started',
      },
      {
        id: 'c',
        name: 'c',
        state: 'started',
      },
    ] as ExtensionInfo[];

    vi.mocked(extensionLoaderMock.listExtensions).mockResolvedValue(extensions);

    const issueProperties: GitHubIssue = {
      category: 'bug',
      title: 'PD is not working',
      description: 'bug description',
      includeSystemInfo: false,
      includeExtensionInfo: true,
    };

    const feedbackHandler = new FeedbackHandler(extensionLoaderMock);
    await feedbackHandler.openGitHubIssue(issueProperties);

    // extract the first argument of the shell.openExternal call
    const url: string | undefined = vi.mocked(shell.openExternal).mock.calls[0]?.[0];
    containSearchParams(url, {
      'additional-context': '**Enabled Extensions**\n- a\n- b\n- c',
    });
  });
});
