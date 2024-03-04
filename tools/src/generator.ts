/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { graphql } from '@octokit/graphql';

export const RELEASE_NOTES_SECTION_TAG = '// release-notes';

const DEFAULT_MAPPINGS = new Map<string, string>([
  ['feat', 'Features'],
  ['fix', 'Bug Fixes'],
  ['docs', 'Documentation'],
  ['chore', 'Chore'],
]);

const DEFAULT_CATEGORY = 'Other';

interface PullRequestInfo {
  title: string;
  link: string;
  number: number;
  sections: string[];
}
export class Generator {
  private client;
  constructor(
    private token: string,
    private organization: string,
    private repo: string,
    private isUser: boolean,
    private milestone: string | undefined,
  ) {
    this.client = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  private getMilestoneQuery(): string {
    return `query {
  ${this.isUser ? 'user' : 'organization'}(login: "${this.organization}") {
    repository(name: "${this.repo}") {
      milestones(last:1, states: OPEN${this.milestone ? ', query: "' + `${this.milestone}` + '"' : ''}) {
    nodes {
    id
    title
    }
    }
    }
  }
}`;
  }

  private getPullRequestsQuery(milestone: string, latestPR?: string): string {
    return `query {
  ${this.isUser ? 'user' : 'organization'}(login: "${this.organization}") {
      repository(name: "${this.repo}") {
        milestones(last:1, states: OPEN, query: "${milestone}") {
          nodes {
            pullRequests(first: 100, states: MERGED${latestPR ? ', after: "' + `${latestPR}` + '"' : ''}) {
              pageInfo {
                endCursor
                startCursor
              }
              nodes {
                title
                state
                id
                number
                body
                permalink
              }
            }
          }
        }
      }
    }
  }`;
  }

  async getMilestone(): Promise<{ title: string }> {
    const query = this.getMilestoneQuery();
    const result = await this.client(query);
    if (this.isUser) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).user?.repository?.milestones?.nodes[0];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).organization?.repository?.milestones?.nodes[0];
    }
  }

  async getPullRequests(
    milestone: string,
    latestPr?: string,
  ): Promise<{
    pageInfo?: { endCursor?: string };
    nodes?: { body: string; title: string; permalink: string; number: number }[];
  }> {
    const query = this.getPullRequestsQuery(milestone, latestPr);
    const result = await this.client(query);
    if (this.isUser) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).user?.repository?.milestones?.nodes[0].pullRequests;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (result as any).organization?.repository?.milestones?.nodes[0].pullRequests;
    }
  }

  public getReleaseNotesSections(input: string): string[] {
    const sections = [];

    let index = 0;
    while ((index = input.indexOf(RELEASE_NOTES_SECTION_TAG, index)) !== -1) {
      const endIndex = input.indexOf(RELEASE_NOTES_SECTION_TAG, index + RELEASE_NOTES_SECTION_TAG.length);
      if (endIndex !== -1) {
        sections.push(input.substring(index + RELEASE_NOTES_SECTION_TAG.length, endIndex));
        index = endIndex + RELEASE_NOTES_SECTION_TAG.length;
      } else {
        sections.push(input.substring(index + RELEASE_NOTES_SECTION_TAG.length));
        break;
      }
    }
    return sections;
  }

  private processPullRequestTitle(title: string): { category: string; title: string } {
    const index = title.indexOf(':');
    if (index > 0) {
      let category: string | undefined = title.substring(0, index);
      const subIndex = category.indexOf('(');
      if (subIndex > 0) {
        category = category.substring(0, subIndex);
      }
      title = title.substring(index + 1).trim();
      category = DEFAULT_MAPPINGS.get(category);
      if (!category) {
        category = DEFAULT_CATEGORY;
      }
      return { category, title };
    } else {
      return { category: DEFAULT_CATEGORY, title };
    }
  }

  async generate(): Promise<string> {
    const milestone = await this.getMilestone();
    if (milestone) {
      const prInfos = new Map<string, PullRequestInfo[]>();
      let latestPR = undefined;
      let done = false;
      while (!done) {
        const pullRequests = await this.getPullRequests(milestone.title, latestPR);
        latestPR = pullRequests?.pageInfo?.endCursor;
        if (pullRequests?.nodes?.length) {
          for (const pr of pullRequests.nodes) {
            if (pr.body && pr.title) {
              const sections = this.getReleaseNotesSections(pr.body);
              if (sections.length > 0) {
                const { category, title } = this.processPullRequestTitle(pr.title);
                let categoryInfos = prInfos.get(category);
                if (!categoryInfos) {
                  categoryInfos = [];
                  prInfos.set(category, categoryInfos);
                }
                categoryInfos.push({ title, link: pr.permalink, number: pr.number, sections });
              }
            }
          }
        } else {
          done = true;
        }
      }
      let content = '';
      prInfos.forEach((prInfos1, category) => {
        content += `### ${category}\n`;
        prInfos1.forEach(prInfo => {
          content += `  - ${prInfo.title} [(#${prInfo.number})](${prInfo.link})\n`;
          content += prInfo.sections.join('');
          content += '\n';
        });
      });
      return content;
    } else {
      throw new Error(this.milestone ? `Milestone ${this.milestone} not found` : 'no milestone found');
    }
  }
}
