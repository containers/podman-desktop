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
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import { Generator, RELEASE_NOTES_SECTION_TAG } from './generator';

vi.mock('@octokit/graphql', async () => {
  const graphql = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (graphql as any).defaults = vi.fn().mockReturnValue(graphql);
  return {
    graphql: vi.fn(),
  };
});

beforeEach(() => {
  graphql.defaults = vi.fn().mockReturnValue(graphql);
});

test('Ensure error is returned if network error', async () => {
  (graphql as unknown as Mock).mockRejectedValue(new Error('Custom error'));
  try {
    const generator = new Generator('token', 'org', 'repo', false, undefined);
    await generator.generate();
  } catch (err) {
    expect(err).to.be.a('Error');
    expect(err).toBeDefined();
  }
});

test('Ensure error is returned if no milestone', async () => {
  (graphql as unknown as Mock).mockResolvedValue({});
  try {
    const generator = new Generator('token', 'org', 'repo', false, undefined);
    await generator.generate();
  } catch (err) {
    expect(err).to.be.a('Error');
    expect(err).toBeDefined();
  }
});

test('Ensure empty if no pull requests', async () => {
  let index = 0;
  (graphql as unknown as Mock).mockImplementation(async () => {
    if (++index === 1) {
      return { organization: { repository: { milestones: { nodes: [{ title: '1.0' }] } } } };
    } else if (index === 2) {
      return EMPTY_PULL_REQUESTS_RESPONSE;
    }
  });
  const generator = new Generator('token', 'org', 'repo', false, undefined);
  const result = await generator.generate();
  expect(result).toBe('');
});

const EMPTY_PULL_REQUESTS_RESPONSE = {
  organization: { repository: { milestones: { nodes: [{ pullRequests: { nodes: [] } }] } } },
};
test('Ensure Other category if pull request without conventional commit', async () => {
  let index = 0;
  (graphql as unknown as Mock).mockImplementation(async () => {
    if (++index === 1) {
      return { organization: { repository: { milestones: { nodes: [{ title: '1.0' }] } } } };
    } else if (index === 2) {
      return {
        organization: {
          repository: {
            milestones: {
              nodes: [
                {
                  pullRequests: {
                    nodes: [
                      {
                        title: 'First PR',
                        body: 'PR description' + RELEASE_NOTES_SECTION_TAG + 'section1' + RELEASE_NOTES_SECTION_TAG,
                        number: 1,
                        permalink: '',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      };
    } else {
      return EMPTY_PULL_REQUESTS_RESPONSE;
    }
  });
  const generator = new Generator('token', 'org', 'repo', false, undefined);
  const result = await generator.generate();
  expect(result).toContain('### Other');
  expect(result).toContain('- First PR');
  expect(result).toContain('section1');
});

test('Ensure all sections are extracted', async () => {
  let index = 0;
  (graphql as unknown as Mock).mockImplementation(async () => {
    if (++index === 1) {
      return { organization: { repository: { milestones: { nodes: [{ title: '1.0' }] } } } };
    } else if (index === 2) {
      return {
        organization: {
          repository: {
            milestones: {
              nodes: [
                {
                  pullRequests: {
                    nodes: [
                      {
                        title: 'First PR',
                        body:
                          'PR description' +
                          RELEASE_NOTES_SECTION_TAG +
                          'section1' +
                          RELEASE_NOTES_SECTION_TAG +
                          'see' +
                          RELEASE_NOTES_SECTION_TAG +
                          'section2' +
                          RELEASE_NOTES_SECTION_TAG,
                        number: 1,
                        permalink: '',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      };
    } else {
      return EMPTY_PULL_REQUESTS_RESPONSE;
    }
  });
  const generator = new Generator('token', 'org', 'repo', false, undefined);
  const result = await generator.generate();
  expect(result).toContain('### Other');
  expect(result).toContain('- First PR');
  expect(result).toContain('section1');
  expect(result).toContain('section2');
});

test('Ensure category from pull request conventional commit', async () => {
  let index = 0;
  (graphql as unknown as Mock).mockImplementation(async () => {
    if (++index === 1) {
      return { organization: { repository: { milestones: { nodes: [{ title: '1.0' }] } } } };
    } else if (index === 2) {
      return {
        organization: {
          repository: {
            milestones: {
              nodes: [
                {
                  pullRequests: {
                    nodes: [
                      {
                        title: 'fix: First PR',
                        body: 'PR description' + RELEASE_NOTES_SECTION_TAG + 'section1' + RELEASE_NOTES_SECTION_TAG,
                        number: 1,
                        permalink: '',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      };
    } else {
      return EMPTY_PULL_REQUESTS_RESPONSE;
    }
  });
  const generator = new Generator('token', 'org', 'repo', false, undefined);
  const result = await generator.generate();
  expect(result).toContain('### Bug Fixes');
  expect(result).toContain('- First PR');
  expect(result).toContain('section1');
});

test('Ensure unterminated section is extracted', async () => {
  let index = 0;
  (graphql as unknown as Mock).mockImplementation(async () => {
    if (++index === 1) {
      return { organization: { repository: { milestones: { nodes: [{ title: '1.0' }] } } } };
    } else if (index === 2) {
      return {
        organization: {
          repository: {
            milestones: {
              nodes: [
                {
                  pullRequests: {
                    nodes: [
                      {
                        title: 'fix: First PR',
                        body: 'PR description' + RELEASE_NOTES_SECTION_TAG + 'section1',
                        number: 1,
                        permalink: '',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      };
    } else {
      return EMPTY_PULL_REQUESTS_RESPONSE;
    }
  });
  const generator = new Generator('token', 'org', 'repo', false, undefined);
  const result = await generator.generate();
  expect(result).toContain('### Bug Fixes');
  expect(result).toContain('- First PR');
  expect(result).toContain('section1');
});
