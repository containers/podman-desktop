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

import type { GitHubIssue } from '/@api/feedback.js';

export class FeedbackHandler {
  async openGitHubIssue(issueProperties: GitHubIssue): Promise<void> {
    const urlSearchParams = new URLSearchParams(this.toQueryParameters(issueProperties)).toString();
    const link = `https://github.com/containers/podman-desktop/issues/new?${urlSearchParams}`;
    await shell.openExternal(link);
  }

  protected toQueryParameters(issue: GitHubIssue): Record<string, string> {
    switch (issue.category) {
      case 'feature':
        return {
          template: 'feature_request.yml',
          title: issue.title,
          solution: issue.description,
        };
      case 'bug':
        return {
          template: 'bug_report.yml',
          title: issue.title,
          'bug-description': issue.description,
        };
      default:
        throw new Error(`unknown category ${issue.category}`);
    }
  }
}
