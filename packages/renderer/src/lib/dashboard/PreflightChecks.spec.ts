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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import PreflightChecks from './PreflightChecks.svelte';

beforeEach(() => {
  Object.defineProperty(global, 'window', {
    value: {
      openExternal: vi.fn(),
    },
    writable: true,
  });
  vi.resetAllMocks();
});

test('Expect preCheck to be displayed when having just title and description', async () => {
  render(PreflightChecks, {
    preflightChecks: [
      {
        name: 'name',
        description: 'description',
        successful: true,
      },
    ],
  });

  const title = screen.getByLabelText('precheck-title');
  expect(title).toBeInTheDocument();
  expect(title.textContent).equals('name');
  const description = screen.getByLabelText('precheck-description');
  expect(description).toBeInTheDocument();
  expect(description.textContent).equals('description');
  const docLinksDescription = screen.queryByLabelText('precheck-docLinksDescription');
  expect(docLinksDescription).not.toBeInTheDocument();
  const link = screen.queryByLabelText('precheck-link');
  expect(link).not.toBeInTheDocument();
});

test('Expect preCheck to be displayed when having all props', async () => {
  render(PreflightChecks, {
    preflightChecks: [
      {
        name: 'name',
        description: 'description',
        docLinksDescription: 'docLinkDescription',
        docLinks: [
          {
            title: 'link',
            url: 'url',
          },
        ],
        successful: true,
      },
    ],
  });

  const title = screen.getByLabelText('precheck-title');
  expect(title).toBeInTheDocument();
  expect(title.textContent).equals('name');
  const description = screen.getByLabelText('precheck-description');
  expect(description).toBeInTheDocument();
  expect(description.textContent).equals('description');
  const docLinksDescription = screen.getByLabelText('precheck-docLinksDescription');
  expect(docLinksDescription).toBeInTheDocument();
  expect(docLinksDescription.textContent).equals('docLinkDescription');
  const docLinks = screen.getByLabelText('precheck-link');
  expect(docLinks).toBeInTheDocument();
  expect(docLinks.textContent).equals('link');
  // click on the button
  await fireEvent.click(docLinks);
  // check openExternal is called
  expect(window.openExternal).toHaveBeenCalledWith('url');
});
