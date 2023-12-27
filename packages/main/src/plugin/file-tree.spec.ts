import { expect, test } from 'vitest';
import { FileTree } from './file-tree.js';

interface typ {
  path: string;
}

test('add paths to filetree', () => {
  const tree = new FileTree<typ>('tree1');
  tree.addPath('A', { path: 'A-path' });
  tree.addPath('a/', { path: 'a/-path' });
  tree.addPath('a/b/c/d.txt', { path: 'a/b/c/d.txt-path' });
  tree.addPath('a/b/c/e.txt', { path: 'a/b/c/e.txt-path' });

  expect(tree.root.children).toHaveLength(2);
  expect(tree.root.children.get('A')!.children).toHaveLength(0);
  expect(tree.root.children.get('A')!.data!.path).toBe('A-path');

  expect(tree.root.children.get('a')!.children).toHaveLength(1);
  expect(tree.root.children.get('a')!.data!.path).toBe('a/-path');

  expect(tree.root.children.get('a')!.children.get('b')!.children).toHaveLength(1);
  expect(tree.root.children.get('a')!.children.get('b')!.data).toBeUndefined();

  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children).toHaveLength(2);
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.data).toBeUndefined();

  expect(
    tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.children,
  ).toHaveLength(0);
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d.txt')!.data!.path).toBe(
    'a/b/c/d.txt-path',
  );

  expect(
    tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.children,
  ).toHaveLength(0);
  expect(tree.root.children.get('a')!.children.get('b')!.children.get('c')!.children.get('e.txt')!.data!.path).toBe(
    'a/b/c/e.txt-path',
  );
});
