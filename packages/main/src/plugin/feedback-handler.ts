/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { FeedbackMessages, GitHubIssue } from '@desktop-framework/api';
import { shell } from 'electron';
import { inject, injectable } from 'inversify';

import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import type { SystemInfo } from '/@/plugin/util/sys-info.js';
import { getSystemInfo } from '/@/plugin/util/sys-info.js';
import productJSONFile from '/@product.json' with { type: 'json' };

@injectable()
export class FeedbackHandler {
  #systemInfo: SystemInfo;

  constructor(@inject(ExtensionLoader) protected extensionLoader: ExtensionLoader) {
    this.#systemInfo = getSystemInfo();
  }

  getFeedbackMessages(): FeedbackMessages {
    const productName = productJSONFile.name;
    return {
      experienceLabel: `How was your experience with ${productName}`,
      thankYouMessage: `Your input is valuable in helping us better understand and tailor ${productName}.`,
      gitHubStarsMessage: `Like ${productName}? Give us a star on GitHub`,
    };
  }

  async openGitHubIssue(issueProperties: GitHubIssue): Promise<void> {
    if (productJSONFile.GitHubFeedbackLinks?.issues) {
      let additionalContent: string | undefined;
      if (issueProperties.includeExtensionInfo) {
        const extensions = await this.getStartedExtensions();
        additionalContent = `**Enabled Extensions**\n${extensions}`;
      }

      const urlSearchParams = new URLSearchParams(
        this.toQueryParameters(issueProperties, additionalContent),
      ).toString();
      const link = `${productJSONFile.GitHubFeedbackLinks?.issues}/new?${urlSearchParams}`;
      await shell.openExternal(link);
    } else {
      console.log('No GitHub issues link found, cannot preview new GitHub issue');
    }
  }

  getGitHubFeedbackLinks(): { [category: string]: string } | undefined {
    return productJSONFile.GitHubFeedbackLinks;
  }

  getFeedbackLinks(): { [category: string]: string } | undefined {
    return productJSONFile.feedbackLinks;
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
