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
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import ImageColumnName from './ImageColumnName.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import { router } from 'tinro';
import { fireEvent } from '@testing-library/dom';

const image: ImageInfoUI = {
  id: 'my-image',
  shortId: 'short-id',
  name: 'my-image-name',
  engineId: 'podman',
  engineName: '',
  tag: 'latest-tag',
  createdAt: 0,
  age: '',
  size: 0,
  humanSize: '',
  base64RepoTag: 'repoTag',
  selected: false,
  inUse: false,
};

test('Expect simple column styling', async () => {
  render(ImageColumnName, { object: image });

  const text = screen.getByText(image.name);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-sm');
  expect(text).toHaveClass('text-gray-300');

  const id = screen.getByText(image.shortId);
  expect(id).toBeInTheDocument();
  expect(id).toHaveClass('text-violet-400');

  const tag = screen.getByText(image.tag);
  expect(tag).toBeInTheDocument();
  expect(tag).toHaveClass('text-gray-400');
  expect(tag).toHaveClass('font-extra-light');
});

test('Expect clicking works', async () => {
  render(ImageColumnName, { object: image });

  const text = screen.getByText(image.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');

  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith('/images/my-image/podman/repoTag/summary');
});
