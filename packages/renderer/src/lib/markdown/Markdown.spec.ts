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

import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Markdown from './Markdown.svelte';

async function waitRender(customProperties: object): Promise<void> {
  const result = render(Markdown, { ...customProperties });
  // wait that result.component.$$.ctx[0] is set
  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect to have bold', async () => {
  await waitRender({ markdown: '**bold**' });
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  expect(markdownContent).toContainHTML('<strong>bold</strong>');
});

test('Expect to have italic', async () => {
  await waitRender({ markdown: '_italic_' });
  const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
  expect(markdownContent).toBeInTheDocument();
  expect(markdownContent).toContainHTML('<em>italic</em>');
});

describe('Custom button', () => {
  test('Expect without attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML('<a class="pf-c-button pf-m-primary" >Name of the button</a>');
  });

  test('Expect with all attributes', async () => {
    await waitRender({ markdown: ':button[Name of the button]{href=http://my-link title="tooltip text"}' });
    const markdownContent = screen.getByRole('region', { name: 'markdown-content' });
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toContainHTML(
      '<a class="pf-c-button pf-m-primary" href="http://my-link" title="tooltip text" >Name of the button</a>',
    );
  });
});
