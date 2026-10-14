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

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import ExtensionDetailsReadme from './ExtensionDetailsReadme.svelte';

async function waitRender(customProperties: object): Promise<void> {
  render(ExtensionDetailsReadme, { ...customProperties });
}

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect to have readme with URI', async () => {
  vi.mocked(window.fetchCatalogReadme).mockResolvedValueOnce('# This is my README');

  await waitRender({ extensionId: 'test.extension', readme: { uri: 'http://my-fake-registry/readme-content' } });

  // expect Markdown
  await vi.waitFor(() => expect(screen.getByRole('region', { name: 'markdown-content' })).toBeInTheDocument());

  await vi.waitFor(() => expect(window.fetchCatalogReadme).toHaveBeenCalledWith('test.extension'));
  await vi.waitFor(() =>
    expect(screen.queryByRole('region', { name: 'markdown-content' })).toContainHTML(
      '<h1 id="this-is-my-readme">This is my README</h1>',
    ),
  );
});

test('Expect to have readme with content', async () => {
  await waitRender({ extensionId: 'test.extension', readme: { content: '# my README' } });

  // expect not calling fetch
  expect(window.fetchCatalogReadme).not.toHaveBeenCalled();

  // expect Markdown
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  await vi.waitFor(() => expect(markdownContent).toContainHTML('<h1 id="my-readme">my README</h1>'));
});

test('Expect empty screen if no content', async () => {
  await waitRender({ extensionId: 'test.extension', readme: { content: '' } });

  // expect not calling fetch
  expect(window.fetchCatalogReadme).not.toHaveBeenCalled();

  // expect no Markdown
  const markdownContent = screen.queryByRole('region', { name: 'markdown-content' });
  expect(markdownContent).not.toBeInTheDocument();

  // but empty screen
  const emptyScreen = screen.getByRole('heading', { name: 'No Readme' });
  expect(emptyScreen).toBeInTheDocument();
});

test('Expect empty screen when fetch fails', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
  const fetchError = new Error('Error fetching README');
  vi.mocked(window.fetchCatalogReadme).mockRejectedValueOnce(fetchError);

  await waitRender({ extensionId: 'test.extension', readme: { uri: 'https://test-uri' } });

  // expect fetch was called with extension ID
  await vi.waitFor(() => expect(window.fetchCatalogReadme).toHaveBeenCalledWith('test.extension'));

  // expect error to be logged
  await vi.waitFor(() =>
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to fetch README for extension test.extension', fetchError),
  );

  // expect empty screen to appear
  const emptyScreen = await screen.findByRole('heading', { name: 'No Readme' });
  expect(emptyScreen).toBeInTheDocument();

  // expect no Markdown
  const markdownContent = screen.queryByRole('region', { name: 'markdown-content' });
  expect(markdownContent).not.toBeInTheDocument();
});
