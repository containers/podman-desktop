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

import { expect, test } from 'vitest';
import { FileTree } from './file-tree.js';

interface typ {
  path: string;
}

test('add paths to filetree', () => {
  const tree = new FileTree<typ>('tree1')
    .addPath('A', { path: 'A-path' }, 5)
    .addPath('a/', { path: 'a/-path' }, 0)
    .addPath('a/b/c/d.txt', { path: 'a/b/c/d.txt-path' }, 3)
    .addPath('a/b/c/e.txt', { path: 'a/b/c/e.txt-path' }, 4);

  expect(tree.size).toBe(12);
  expect(tree.root.children).toHaveLength(2);
  expect(tree.root.children.get('A')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.data!.path).toBe('A-path');
  expect(tree.root.children.get('A')!.size).toBe(5);

  expect(tree.root.children.get('a')!.children).toHaveLength(1);
  expect(tree.root.children.get('a')!.data!.path).toBe('a/-path');
  expect(tree.root.children.get('a')!.size).toBe(7);

  expect(tree.root.children.get('a')!.children.get('b')!.children).toHaveLength(1);
  expect(tree.root.children.get('a')!.children.get('b')!.data).toBeUndefined();
  expect(tree.root.children.get('a')!.children.get('b')!.size).toBe(7);

  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children).toHaveLength(2);
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.data).toBeUndefined();
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.size).toBe(7);

  expect(
    tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.children,
  ).toHaveLength(0);
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.data!.path).toBe(
    'a/b/c/d.txt-path',
  );
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.size).toBe(3);

  expect(
    tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.children,
  ).toHaveLength(0);
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.data!.path).toBe(
    'a/b/c/e.txt-path',
  );
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.size).toBe(4);
});
