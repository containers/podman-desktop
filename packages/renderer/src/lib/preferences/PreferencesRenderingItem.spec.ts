/**********************************************************************
 * Copyright (C) 2025 - 2026 Red Hat, Inc.
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

import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import PreferencesRenderingItem from '/@/lib/preferences/PreferencesRenderingItem.svelte';

const EXPERIMENTAL_RECORD: IConfigurationPropertyRecordedSchema = {
  id: 'hello.world.fooBar',
  title: 'Hello',
  parentId: 'parent.record',
  description: 'record-description',
  type: 'integer',
  minimum: 1,
  maximum: 15,
  experimental: {
    githubDiscussionLink: 'https://github.com/podman-desktop',
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.openExternal).mockResolvedValue(undefined);
  vi.mocked(window.getUrlProtocol).mockResolvedValue('podman-desktop');
});

test('experimental record should have clickable GitHub link', async () => {
  const { getByRole } = render(PreferencesRenderingItem, {
    record: EXPERIMENTAL_RECORD,
  });

  const link: HTMLElement = await vi.waitFor(() => {
    const element = getByRole('button', { name: 'Share feedback' });
    expect(element).toBeInTheDocument();
    return element;
  });

  await fireEvent.click(link);

  await vi.waitFor(() => {
    expect(window.openExternal).toHaveBeenCalledWith(EXPERIMENTAL_RECORD.experimental?.githubDiscussionLink);
  });
});

test('experimental record should have flask icon', async () => {
  const { queryAllByRole } = render(PreferencesRenderingItem, {
    record: EXPERIMENTAL_RECORD,
  });

  await vi.waitFor(() => {
    const elements = queryAllByRole('img', { hidden: true });
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.find(element => element.textContent === 'experimental')).toBeDefined();
  });
});

test('record should have short title by default', async () => {
  const { getByText } = render(PreferencesRenderingItem, {
    record: EXPERIMENTAL_RECORD,
  });

  await vi.waitFor(() => {
    const element = getByText('Foo Bar');
    expect(element).toBeDefined();
    expect(element).toHaveClass('font-semibold');
  });
});

test.each(['short', 'full'] as const)('displayName overrides the %s title and follows record updates', async title => {
  const record = { ...EXPERIMENTAL_RECORD, displayName: 'Path to Podman Binary' };
  const { getByText, queryByText, rerender } = render(PreferencesRenderingItem, { record, title });

  expect(getByText('Path to Podman Binary')).toHaveClass('font-semibold');

  await rerender({ record: { ...record, displayName: 'Binary location' }, title });
  expect(getByText('Binary location')).toHaveClass('font-semibold');
  expect(queryByText('Path to Podman Binary')).not.toBeInTheDocument();

  await rerender({ record: EXPERIMENTAL_RECORD, title });
  expect(getByText(title === 'short' ? 'Foo Bar' : 'Hello world foo Bar')).toHaveClass('font-semibold');
  expect(queryByText('Binary location')).not.toBeInTheDocument();
});

test('props title full should use full record id', async () => {
  const { getByText } = render(PreferencesRenderingItem, {
    record: EXPERIMENTAL_RECORD,
    title: 'full',
  });

  await vi.waitFor(() => {
    const element = getByText('Hello world foo Bar');
    expect(element).toBeDefined();
    expect(element).toHaveClass('font-semibold');
  });
});

test('locked record should display managed-by label', async () => {
  const lockedRecord: IConfigurationPropertyRecordedSchema = {
    id: 'proxy.http',
    title: 'Proxy',
    parentId: 'proxy',
    description: 'HTTP proxy configuration',
    type: 'string',
    locked: true,
  };

  const { getByText } = render(PreferencesRenderingItem, {
    record: lockedRecord,
  });

  await vi.waitFor(() => getByText('Managed'));
});

test('locked record should not show reset to default button', async () => {
  const lockedRecord: IConfigurationPropertyRecordedSchema = {
    id: 'proxy.http',
    title: 'Proxy',
    parentId: 'proxy',
    description: 'HTTP proxy configuration',
    type: 'string',
    locked: true,
    default: 'default-value',
  };

  const { queryByRole, getByText } = render(PreferencesRenderingItem, {
    record: lockedRecord,
  });

  // Verify managed label is shown
  await vi.waitFor(() => getByText('Managed'));

  // Verify reset button is not present
  const resetButton = queryByRole('button', { name: 'Reset to default value' });
  expect(resetButton).not.toBeInTheDocument();
});

test('type markdown record with markdownDescription should render markdown content only once', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'ext.markdown.info',
    title: 'Info',
    parentId: 'ext',
    description: 'plain description text',
    markdownDescription: 'Some **markdown** content',
    type: 'markdown',
  };

  const { getAllByLabelText, getByText } = render(PreferencesRenderingItem, { record });

  await vi.waitFor(() => {
    const markdownSections = getAllByLabelText('markdown-content');
    expect(markdownSections).toHaveLength(1);
  });

  expect(getByText('plain description text')).toBeInTheDocument();
});

test('Expect reset enum value to update dropdown value', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    enum: ['first', 'second'],
    default: 'first',
  };
  const { getByRole, getByLabelText } = render(PreferencesRenderingItem, { record: record });
  const dropdown = getByRole('button', { name: 'first' });
  expect(dropdown).toBeInTheDocument();
  await userEvent.click(dropdown);

  const nonDefaultValue = getByRole('button', { name: 'second' });
  expect(nonDefaultValue).toBeInTheDocument();
  await userEvent.click(nonDefaultValue);

  let dropdownValue = getByLabelText('hidden input');
  expect(dropdownValue).toHaveValue('second');

  const resetButton = getByRole('button', { name: 'Reset to default value' });
  expect(resetButton).toBeInTheDocument();
  await userEvent.click(resetButton);

  await waitFor(() => {
    expect(resetButton).not.toBeInTheDocument();
  });

  dropdownValue = getByLabelText('hidden input');
  expect(dropdownValue).toHaveValue('first');
});
