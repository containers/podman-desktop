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

export class FilesystemNode<T> {
  name: string;
  data?: T;
  isDirectory: boolean;
  children: Map<string, FilesystemNode<T>>;
  size: number;
  hidden: boolean;

  constructor(name: string, isDirectory: boolean) {
    this.name = name;
    this.children = new Map<string, FilesystemNode<T>>();
    this.size = 0;
    this.hidden = false;
    this.isDirectory = isDirectory;
  }

  addChild(name: string, isDirectory: boolean): FilesystemNode<T> {
    const child = new FilesystemNode<T>(name, isDirectory);
    this.children.set(name, child);
    return child;
  }

  copy(): FilesystemNode<T> {
    const result = new FilesystemNode<T>(this.name, this.isDirectory);
    result.data = this.data;
    result.size = this.size;
    result.hidden = this.hidden;
    for (const [name, child] of this.children) {
      result.children.set(name, child.copy());
    }
    return result;
  }
}

export class FilesystemTree<T> {
  name: string;
  root: FilesystemNode<T>;
  size: number;

  // The number of added/modified/removed files
  addedCount: number;
  modifiedCount: number;
  removedCount: number;

  addedSize: number;
  modifiedSize: number;
  removedSize: number;

  constructor(name: string) {
    this.name = name;
    this.root = new FilesystemNode<T>('/', true);
    this.size = 0;

    this.addedCount = 0;
    this.modifiedCount = 0;
    this.removedCount = 0;

    this.addedSize = 0;
    this.modifiedSize = 0;
    this.removedSize = 0;
  }

  addPath(path: string, entry: T, size: number, isDirectory: boolean): FilesystemTree<T> {
    const currentSize = this.currentSize(path);
    // If we add an already existing directory, we replace its size with its current one
    // so we do not overwrite it (being the size of all its descendants)
    if (currentSize && !this.isDirectory(path)) {
      this.modifiedCount++;
      this.modifiedSize += size - currentSize;
    } else if (!this.isDirectory(path)) {
      this.addedCount++;
      this.addedSize += size;
    } else if (this.isDirectory(path)) {
      this.modifiedCount++;
    }
    if (currentSize && this.isDirectory(path)) {
      size = currentSize;
    }
    this.size += size - (currentSize ?? 0);
    const parts = path.split('/');
    let node = this.root;
    for (const element of parts) {
      const part = element;
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        node = node.addChild(part, isDirectory);
      }
      node.size += size - (currentSize ?? 0);
    }
    node.data = entry;
    return this;
  }

  hideDirectoryContent(path: string): FilesystemTree<T> {
    const currentSize = this.currentSize(path);
    if (currentSize === undefined) {
      // the path is not found, return now
      return this;
    }
    this.size -= currentSize;
    const parts = path.split('/');
    let node = this.root;
    for (const element of parts) {
      const part = element;
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        return this;
      }
      node.size -= currentSize;
    }
    for (const child of node.children.values()) {
      this.hideRecursive(child);
    }
    return this;
  }

  hideRecursive(node: FilesystemNode<T>): void {
    node.hidden = true;
    for (const child of node.children.values()) {
      this.hideRecursive(child);
    }
  }

  hidePath(path: string): FilesystemTree<T> {
    const currentSize = this.currentSize(path);
    if (currentSize === undefined) {
      // the path is not found, return now
      return this;
    }
    this.removedCount++;
    this.removedSize -= currentSize;
    this.size -= currentSize;
    const parts = path.split('/');
    let node = this.root;
    for (const element of parts) {
      const part = element;
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        return this;
      }
      node.size -= currentSize;
    }
    node.hidden = true;
    return this;
  }

  addWhiteout(path: string): FilesystemTree<T> {
    const currentSize = this.currentSize(path);
    this.size -= currentSize ?? 0;
    const parts = path.split('/');
    let node = this.root;
    for (const element of parts) {
      const part = element;
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        node = node.addChild(part, false);
      }
      node.size -= currentSize ?? 0;
    }
    node.hidden = true;
    return this;
  }

  // returns the size of the file is it already exists in the tree, or 0 otherwise
  currentSize(path: string): number | undefined {
    const parts = path.split('/');
    let node = this.root;
    for (const element of parts) {
      const part = element;
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        return undefined;
      }
    }
    return node.size;
  }

  isDirectory(path: string): boolean {
    const parts = path.split('/');
    let node = this.root;
    for (const element of parts) {
      const part = element;
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        return false;
      }
    }
    return node.children.size > 0 || node.isDirectory;
  }

  copy(): FilesystemTree<T> {
    const result = new FilesystemTree<T>(this.name);
    result.size = this.size;
    result.root = this.root.copy();
    return result;
  }
}
