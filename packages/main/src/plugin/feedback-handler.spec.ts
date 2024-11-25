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

import { arch, release, version } from 'node:os';

import { shell } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isLinux, isMac, isWindows } from '/@/util.js';
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
  arch: vi.fn(),
  release: vi.fn(),
  version: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();

  // all false by default
  vi.mocked(isLinux).mockReturnValue(false);
  vi.mocked(isMac).mockReturnValue(false);
  vi.mocked(isWindows).mockReturnValue(false);
});

class FeedbackHandlerTest extends FeedbackHandler {
  public override getWindowsInfo(): string {
    return super.getWindowsInfo();
  }
  public override getLinuxInfo(): string {
    return super.getLinuxInfo();
  }
  public override getDarwinInfo(): string {
    return super.getDarwinInfo();
  }
  public override getOsInfo(): string {
    return super.getOsInfo();
  }
}

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
    expect(search.has(key)).toBeTruthy();
    expect(search.get(key)).toBe(value);
  });
}

describe('openGitHubIssue', () => {
  test('Expect openExternal to be called with queryParams and bug report template', async () => {
    const issueProperties: GitHubIssue = {
      category: 'bug',
      title: 'PD is not working',
      description: 'bug description',
    };

    const feedbackHandler = new FeedbackHandler();
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

    const feedbackHandler = new FeedbackHandler();
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
    vi.mocked(isLinux).mockReturnValue(true);
    vi.mocked(release).mockReturnValue('dummy-release');

    const issueProperties: GitHubIssue = {
      category: 'bug',
      title: 'PD is not working',
      description: 'bug description',
      includeSystemInfo: true,
    };

    const feedbackHandler = new FeedbackHandler();
    await feedbackHandler.openGitHubIssue(issueProperties);

    expect(shell.openExternal).toHaveBeenCalledOnce();

    // extract the first argument of the shell.openExternal call
    const url: string | undefined = vi.mocked(shell.openExternal).mock.calls[0]?.[0];
    containSearchParams(url, {
      os: 'Linux - dummy-release',
    });
  });
});

describe('getOsInfo', () => {
  let feedbackHandlerTest: FeedbackHandlerTest;
  beforeEach(() => {
    feedbackHandlerTest = new FeedbackHandlerTest();
  });

  test('windows should use os#version and os#arch', () => {
    vi.mocked(isWindows).mockReturnValue(true);
    vi.mocked(arch).mockReturnValue('x64');
    vi.mocked(version).mockReturnValue('Windows 11 Home');

    const result = feedbackHandlerTest.getWindowsInfo();

    expect(release).not.toHaveBeenCalled();
    expect(version).toHaveBeenCalled();
    expect(arch).toHaveBeenCalled();

    expect(result).toBe('Windows 11 Home - x64');
  });

  test('linux should use os#release', () => {
    vi.mocked(isLinux).mockReturnValue(true);
    vi.mocked(release).mockReturnValue('6.11.7-300.fc41.x86_64');

    const result = feedbackHandlerTest.getLinuxInfo();

    expect(release).toHaveBeenCalled();
    expect(version).not.toHaveBeenCalled();
    expect(arch).not.toHaveBeenCalled();

    expect(result).toBe('Linux - 6.11.7-300.fc41.x86_64');
  });

  test('flatpak linux should include flatpak info', () => {
    vi.mocked(isLinux).mockReturnValue(true);
    vi.mocked(release).mockReturnValue('6.11.7-300.fc41.x86_64');

    process.env['FLATPAK_ID'] = 'dummy-id';

    const result = feedbackHandlerTest.getLinuxInfo();

    expect(release).toHaveBeenCalled();
    expect(version).not.toHaveBeenCalled();
    expect(arch).not.toHaveBeenCalled();

    expect(result).toBe('Linux - 6.11.7-300.fc41.x86_64 (flatpak)');
  });

  test('darwin should use os#release and os#arch', () => {
    vi.mocked(isMac).mockReturnValue(true);
    vi.mocked(release).mockReturnValue('23.9.4');
    vi.mocked(arch).mockReturnValue('arm64');

    const result = feedbackHandlerTest.getDarwinInfo();

    expect(release).toHaveBeenCalled();
    expect(version).not.toHaveBeenCalled();
    expect(arch).toHaveBeenCalled();

    expect(result).toBe('Darwin 23.9.4 - arm64');
  });
});
