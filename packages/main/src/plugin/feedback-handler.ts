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

import { isLinux, isMac, isWindows } from '/@/util.js';
import type { GitHubIssue } from '/@api/feedback.js';

export class FeedbackHandler {
  async openGitHubIssue(issueProperties: GitHubIssue): Promise<void> {
    const urlSearchParams = new URLSearchParams(this.toQueryParameters(issueProperties)).toString();
    const link = `https://github.com/containers/podman-desktop/issues/new?${urlSearchParams}`;
    await shell.openExternal(link);
  }

  /**
   * According to the node documentation, we should be using the os#release
   * but this has some problems with our current version of node
   *
   * Some node version do not report well the Windows 10 / 11 difference
   * Ref https://github.com/nodejs/node/issues/40862
   *
   * E.g. on a Windows 11 x64 we would get `Windows 11 Home - x64`
   *
   * @remarks the type of license is important (Home / Pro) as we have different feature depending
   * on the feature (HyperV support or not)
   * @protected
   */
  protected getWindowsInfo(): string {
    return `${version()} - ${arch()}`;
  }

  /**
   * Getting more details about the distribution is not feasible through the node api.
   * Online recommendation are to look at the `/etc/os-release` but let's avoid making this
   * too complicated.
   *
   * The os#release on linux seems to contain the architecture as it use internally [`uname(3)`](https://linux.die.net/man/3/uname).
   *
   * E.g. on a fedora 41 x64 we would get `Linux - <kernel-version>.fc41.<arch>`
   *
   * @protected
   */
  protected getLinuxInfo(): string {
    let result = `Linux - ${release()}`;

    // the flatpak information is a very valuable information
    if (process.env['FLATPAK_ID']) {
      result += ' (flatpak)';
    }
    return result;
  }

  /**
   * On Darwin system, we have too much information in the is os#version
   * so we use release to get the os version (E.g. 24.1.0), and arch (E.g. arm64)
   * @protected
   */
  protected getDarwinInfo(): string {
    return `Darwin ${release()} - ${arch()}`;
  }

  /**
   * Generic method to get the system info (system platform, architecture, version)
   * @protected
   */
  protected getOsInfo(): string {
    if (isWindows()) {
      return this.getWindowsInfo();
    } else if (isMac()) {
      return this.getDarwinInfo();
    } else if (isLinux()) {
      return this.getLinuxInfo();
    }
    // default fallback - should not be reached, but we never know
    return release();
  }

  protected toQueryParameters(issue: GitHubIssue): Record<string, string> {
    const result: Record<string, string> = {};
    result['title'] = issue.title;

    switch (issue.category) {
      case 'feature':
        result['template'] = 'feature_request.yml';
        result['solution'] = issue.description;
        return result;
      case 'bug':
        result['template'] = 'bug_report.yml';
        result['bug-description'] = issue.description;

        // include system info if authorised
        if (issue.includeSystemInfo) {
          result['os'] = this.getOsInfo();
        }

        return result;
      default:
        throw new Error(`unknown category ${issue.category}`);
    }
  }
}
