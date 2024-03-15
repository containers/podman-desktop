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
import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test } from 'vitest';

import NewContentBadge from './NewContentBadge.svelte';

test('Expect to do not display any dot if active page is same from pagePath', async () => {
  router.goto('/');
  render(NewContentBadge, {
    pagePath: '/',
    show: true,
  });

  const dot = screen.queryByLabelText('New content available');
  expect(dot).not.toBeInTheDocument();
});

test('Expect to do not display any dot if active page is in pagePath but show prop is false', async () => {
  router.goto('/');
  render(NewContentBadge, {
    pagePath: '/',
    show: false,
  });

  const dot = screen.queryByLabelText('New content available');
  expect(dot).not.toBeInTheDocument();
});

test('Expect to display the dot if active page is not pagePath and there is new content', async () => {
  router.goto('/test');
  render(NewContentBadge, {
    pagePath: '/',
    show: true,
  });

  const dot = screen.getByLabelText('New content available');
  expect(dot).toBeInTheDocument();
});
