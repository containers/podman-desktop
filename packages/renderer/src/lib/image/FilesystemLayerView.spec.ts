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

import type { ImageFile } from '@podman-desktop/api';
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import { FilesystemNode } from '/@/lib/image/filesystem-tree';

import FilesystemLayerView from './FilesystemLayerView.svelte';

test('simple folder should have margin provided as prop', async () => {
  const { getByText } = render(FilesystemLayerView, {
    tree: new FilesystemNode<ImageFile>('folder-example', true),
    margin: 10,
    root: false,
  });

  const div = getByText('folder-example');
  expect(
    Array.from(div.childNodes.values())
      .filter((node): node is HTMLSpanElement => node instanceof HTMLSpanElement)
      .some(node => node.style?.marginLeft === '10rem'),
  ).toBeTruthy();
});

test('root folder with one children should have margin increment by 0.5', async () => {
  const root = new FilesystemNode<ImageFile>('folder-example', true);
  const child = new FilesystemNode<ImageFile>('file-example', true);
  child.hidden = false;
  root.children.set('potatoes', child);

  const { getByText } = render(FilesystemLayerView, {
    tree: root,
    margin: 10,
    root: true,
  });

  const div = getByText('file-example');
  expect(
    Array.from(div.childNodes.values())
      .filter((node): node is HTMLSpanElement => node instanceof HTMLSpanElement)
      .some(node => node.style?.marginLeft === '10.5rem'),
  ).toBeTruthy();
});
