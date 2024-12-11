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

import type { ExtensionLoader } from '/@/plugin/extension-loader.js';
import type { SystemInfo } from '/@/plugin/util/sys-info.js';
import { getSystemInfo } from '/@/plugin/util/sys-info.js';
import type { GitHubIssue } from '/@api/feedback.js';

export class FeedbackHandler {
  #systemInfo: SystemInfo;

  constructor(protected extensionLoader: ExtensionLoader) {
    this.#systemInfo = getSystemInfo();
  }

  async openGitHubIssue(issueProperties: GitHubIssue): Promise<void> {
    let additionalContent: string | undefined;
    if (issueProperties.includeExtensionInfo) {
      const extensions = await this.getStartedExtensions();
      additionalContent = `**Enabled Extensions**\n${extensions}`;
    }

    const urlSearchParams = new URLSearchParams(this.toQueryParameters(issueProperties, additionalContent)).toString();
    const link = `https://github.com/containers/podman-desktop/issues/new?${urlSearchParams}`;
    await shell.openExternal(link);
  }

  protected async getStartedExtensions(): Promise<string> {
    const extensions = await this.extensionLoader.listExtensions();
    return extensions
      .filter(extension => extension.state === 'started')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(extension => `- ${extension.id}`)
      .join('\n');
  }

  /**
   * Generic method to get the system info (system platform, architecture, version)
   * @protected
   */
  protected getOsInfo(): string {
    return this.#systemInfo.getSystemName();
  }

  protected toQueryParameters(issue: GitHubIssue, additional?: string): Record<string, string> {
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

        // append additional context if provided
        if (additional) result['additional-context'] = additional;

        return result;
      default:
        throw new Error(`unknown category ${issue.category}`);
    }
  }
}
