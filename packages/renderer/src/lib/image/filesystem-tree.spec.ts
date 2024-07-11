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

import { FilesystemTree } from './filesystem-tree.js';

interface typ {
  path: string;
}

test('add paths to filetree', () => {
  const tree = new FilesystemTree<typ>('tree1')
    .addPath('A', { path: 'A-path' }, 5)
    .addPath('a/', { path: 'a/-path' }, 0)
    .addPath('a/b/c/d.txt', { path: 'a/b/c/d.txt-path' }, 3)
    .addPath('a/b/c/e.txt', { path: 'a/b/c/e.txt-path' }, 4);

  const copy = tree.copy();

  for (const t of [tree, copy]) {
    expect(t.size).toBe(12);
    expect(t.root.children).toHaveLength(2);
    expect(t.root.children.get('A')!.children).toHaveLength(0);
    expect(t.root.children.get('A')!.data!.path).toBe('A-path');
    expect(t.root.children.get('A')!.size).toBe(5);

    expect(t.root.children.get('a')!.children).toHaveLength(1);
    expect(t.root.children.get('a')!.data!.path).toBe('a/-path');
    expect(t.root.children.get('a')!.size).toBe(7);

    expect(t.root.children.get('a')!.children.get('b')!.children).toHaveLength(1);
    expect(t.root.children.get('a')!.children.get('b')!.data).toBeUndefined();
    expect(t.root.children.get('a')!.children.get('b')!.size).toBe(7);

    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.children).toHaveLength(2);
    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.data).toBeUndefined();
    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.size).toBe(7);

    expect(
      t.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.children,
    ).toHaveLength(0);
    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.data!.path).toBe(
      'a/b/c/d.txt-path',
    );
    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.size).toBe(3);

    expect(
      t.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.children,
    ).toHaveLength(0);
    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.data!.path).toBe(
      'a/b/c/e.txt-path',
    );
    expect(t.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.size).toBe(4);
  }
});

test('currentSize with existing file', () => {
  const tree = new FilesystemTree<typ>('tree1').addPath('A/B/C.txt', { path: 'A/B/C.txt' }, 5);
  const current = tree.currentSize('A/B/C.txt');
  expect(current).toBe(5);
});

test('currentSize with non existing file', () => {
  const tree = new FilesystemTree<typ>('tree1').addPath('A/B/C.txt', { path: 'A/B/C.txt' }, 5);
  const current = tree.currentSize('A/B/C.log');
  expect(current).toBe(undefined);
});

test('add an existing file', () => {
  const tree = new FilesystemTree<typ>('tree1')
    .addPath('A/B/C.txt', { path: 'A/B/C.txt ' }, 5)
    .addPath('A/B/C.txt', { path: 'A/B/C.txt ' }, 4);
  expect(tree.size).toBe(4);
  expect(tree.root.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.children).toHaveLength(0);
});

test('remove a non existing file', () => {
  const tree = new FilesystemTree<typ>('tree1').addPath('A/B/C.txt', { path: 'A/B/C.txt' }, 5).hidePath('A/B/D.txt');
  expect(tree.size).toBe(5);
  expect(tree.root.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.hidden).toBeFalsy();
});

test('remove an existing file', () => {
  const tree = new FilesystemTree<typ>('tree1').addPath('A/B/C.txt', { path: 'A/B/C.txt' }, 5).hidePath('A/B/C.txt');
  expect(tree.size).toBe(0);
  expect(tree.root.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.hidden).toBeTruthy();
});

test('add a whiteout', () => {
  const tree = new FilesystemTree<typ>('tree1').addWhiteout('A/B/C.txt');
  expect(tree.size).toBe(0);
  expect(tree.root.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.hidden).toBeTruthy();
});

test('hide content of non-existing directory', () => {
  const tree = new FilesystemTree<typ>('tree1')
    .addPath('A/B/C.txt', { path: 'A/B/C.txt' }, 1)
    .addPath('A/B/D.txt', { path: 'A/B/D.txt' }, 2)
    .hideDirectoryContent('A/E');
  expect(tree.size).toBe(3);
  expect(tree.root.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children).toHaveLength(2);
  expect(tree.root.children.get('A')!.children.get('B')!.hidden).toBeFalsy();
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.hidden).toBeFalsy();
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('D.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('D.txt')!.hidden).toBeFalsy();
});

test('hide directory content', () => {
  const tree = new FilesystemTree<typ>('tree1')
    .addPath('A/B/C.txt', { path: 'A/B/C.txt' }, 1)
    .addPath('A/B/D.txt', { path: 'A/B/D.txt' }, 2)
    .hideDirectoryContent('A');
  expect(tree.size).toBe(0);
  expect(tree.root.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children).toHaveLength(1);
  expect(tree.root.children.get('A')!.children.get('B')!.children).toHaveLength(2);
  expect(tree.root.children.get('A')!.children.get('B')!.hidden).toBeTruthy();
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('C.txt')!.hidden).toBeTruthy();
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('D.txt')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.children.get('B')!.children.get('D.txt')!.hidden).toBeTruthy();
});
