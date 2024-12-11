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

import '@testing-library/jest-dom/vitest';

import { render, type RenderResult } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { type Component, type ComponentProps } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { FeedbackCategory } from '/@api/feedback';

import GitHubIssueFeedback from './GitHubIssueFeedback.svelte';

const openExternalMock = vi.fn();
const previewOnGitHubMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      openExternal: openExternalMock,
      previewOnGitHub: previewOnGitHubMock,
      navigator: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

/**
 * Utility method to query get GitHub issue inputs
 * @param props
 */
function renderGitHubIssueFeedback(props: ComponentProps<typeof GitHubIssueFeedback>): {
  title: HTMLInputElement;
  description: HTMLTextAreaElement;
  preview: HTMLButtonElement;
  includeSystemInfo?: HTMLElement;
  includeExtensionInfo?: HTMLElement;
} & RenderResult<Component<ComponentProps<typeof GitHubIssueFeedback>>> {
  const { getByRole, queryByTitle, ...restResult } = render(GitHubIssueFeedback, props);

  // text inputs
  const title = getByRole('textbox', { name: 'Issue Title' });
  expect(title).toBeInstanceOf(HTMLInputElement);

  const description = getByRole('textbox', { name: 'Issue Description' });
  expect(description).toBeInstanceOf(HTMLTextAreaElement);

  // button
  const preview = getByRole('button', { name: 'Preview on GitHub' });
  expect(preview).toBeInstanceOf(HTMLButtonElement);

  // checkbox
  const includeSystemInfo = queryByTitle('Include system information') ?? undefined;

  const includeExtensionInfo = queryByTitle('Include enabled extensions') ?? undefined;

  return {
    title: title as HTMLInputElement,
    description: description as HTMLTextAreaElement,
    preview: preview as HTMLButtonElement,
    includeSystemInfo,
    includeExtensionInfo,
    getByRole,
    queryByTitle,
    ...restResult,
  };
}

test('Expect feedback form to to be GitHub issue feedback form', async () => {
  const { title, description, includeSystemInfo } = renderGitHubIssueFeedback({
    category: 'bug',
    onCloseForm: vi.fn(),
    contentChange: vi.fn(),
  });

  expect(title).toBeInTheDocument();
  expect(description).toBeInTheDocument();
  expect(includeSystemInfo).toBeInTheDocument();
});

test('Expect Preview on GitHub button to be disabled if there is no title or description', async () => {
  const { title, description, preview } = renderGitHubIssueFeedback({
    category: 'bug',
    onCloseForm: vi.fn(),
    contentChange: vi.fn(),
  });

  // default: disabled
  expect(preview).toBeDisabled();

  await userEvent.type(title, 'Bug title');
  await userEvent.type(description, 'Bug description');

  await vi.waitFor(() => {
    expect(preview).toBeEnabled();
  });
});

test.each([
  {
    category: 'bug',
    placeholders: {
      title: 'Bug Report Title',
      description: 'Bug description',
    },
  },
  {
    category: 'feature',
    placeholders: {
      title: 'Feature name',
      description: 'Feature description',
    },
  },
])('$category should have specific placeholders', async ({ category, placeholders }) => {
  const { title, description } = renderGitHubIssueFeedback({
    category: category as FeedbackCategory,
    onCloseForm: vi.fn(),
    contentChange: vi.fn(),
  });

  expect(title).toHaveProperty('placeholder', placeholders.title);
  expect(description).toHaveProperty('placeholder', placeholders.description);
});

test.each([
  {
    category: 'bug',
    link: 'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Fbug%20%F0%9F%90%9E%22',
  },
  {
    category: 'feature',
    link: 'https://github.com/podman-desktop/podman-desktop/issues?q=label%3A%22kind%2Ffeature%20%F0%9F%92%A1%22',
  },
])('$category should have specific issues link', async ({ category, link }) => {
  const { getByLabelText } = renderGitHubIssueFeedback({
    category: category as FeedbackCategory,
    onCloseForm: vi.fn(),
    contentChange: vi.fn(),
  });

  const existingIssues = getByLabelText('GitHub issues');
  expect(existingIssues).toBeInTheDocument();

  await userEvent.click(existingIssues);
  expect(openExternalMock).toHaveBeenCalledWith(link);
});

test.each(['bug', 'feature'])('Expect %s to be included in previewOnGitHub call', async category => {
  const { preview, title, description } = renderGitHubIssueFeedback({
    category: category as FeedbackCategory,
    onCloseForm: vi.fn(),
    contentChange: vi.fn(),
  });

  // type dummy data
  await userEvent.type(title, 'Bug title');
  await userEvent.type(description, 'Bug description');

  // wait enable
  await vi.waitFor(() => {
    expect(preview).toBeEnabled();
  });

  // preview
  await userEvent.click(preview);

  expect(previewOnGitHubMock).toHaveBeenCalledWith(
    expect.objectContaining({
      category: category,
    }),
  );
});

describe('includeSystemInfo', () => {
  test('should not be visible on category feature', async () => {
    const { includeSystemInfo } = renderGitHubIssueFeedback({
      category: 'feature',
      onCloseForm: vi.fn(),
      contentChange: vi.fn(),
    });
    expect(includeSystemInfo).toBeUndefined();
  });

  test('should be visible on category bug and enabled by default', async () => {
    const { includeSystemInfo } = renderGitHubIssueFeedback({
      category: 'bug',
      onCloseForm: vi.fn(),
      contentChange: vi.fn(),
    });
    expect(includeSystemInfo).toBeInTheDocument();

    // enabled by default
    expect(includeSystemInfo?.children?.[0]).toHaveClass('text-[var(--pd-input-checkbox-checked)]');
  });

  test('uncheck the Include system information should set includeSystemInfo to false', async () => {
    const { preview, title, description, includeSystemInfo } = renderGitHubIssueFeedback({
      category: 'bug',
      onCloseForm: vi.fn(),
      contentChange: vi.fn(),
    });

    if (!includeSystemInfo) throw new Error('includeSystemInfo should be defined');

    // type dummy data
    await userEvent.type(title, 'Bug title');
    await userEvent.type(description, 'Bug description');

    // uncheck
    await userEvent.click(includeSystemInfo);

    // open in GitHub
    await userEvent.click(preview);

    expect(previewOnGitHubMock).toHaveBeenCalledWith(
      expect.objectContaining({
        includeSystemInfo: false,
      }),
    );
  });
});

describe('includeExtensionInfo', () => {
  test('should not be visible on category feature', async () => {
    const { includeExtensionInfo } = renderGitHubIssueFeedback({
      category: 'feature',
      onCloseForm: vi.fn(),
      contentChange: vi.fn(),
    });
    expect(includeExtensionInfo).toBeUndefined();
  });

  test('should be visible on category bug and enabled by default', async () => {
    const { includeExtensionInfo } = renderGitHubIssueFeedback({
      category: 'bug',
      onCloseForm: vi.fn(),
      contentChange: vi.fn(),
    });
    expect(includeExtensionInfo).toBeInTheDocument();

    // enabled by default
    expect(includeExtensionInfo?.children?.[0]).toHaveClass('text-[var(--pd-input-checkbox-checked)]');
  });

  test('uncheck the Include system information should set includeSystemInfo to false', async () => {
    const { preview, title, description, includeExtensionInfo } = renderGitHubIssueFeedback({
      category: 'bug',
      onCloseForm: vi.fn(),
      contentChange: vi.fn(),
    });

    if (!includeExtensionInfo) throw new Error('includeExtensionInfo should be defined');

    // type dummy data
    await userEvent.type(title, 'Bug title');
    await userEvent.type(description, 'Bug description');

    // uncheck
    await userEvent.click(includeExtensionInfo);

    // open in GitHub
    await userEvent.click(preview);

    expect(previewOnGitHubMock).toHaveBeenCalledWith(
      expect.objectContaining({
        includeExtensionInfo: false,
      }),
    );
  });
});
