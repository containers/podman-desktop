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

const REMOVED_TAG = '.wh.';

export class FileNode<T> {
  name: string;
  isRemoved: boolean;
  data?: T;
  children: Map<string, FileNode<T>>;
  size: number;

  constructor(name: string) {
    this.isRemoved = name.startsWith(REMOVED_TAG);
    this.name = this.isRemoved ? name.substring(4) : name;
    this.children = new Map<string, FileNode<T>>();
    this.size = 0;
  }

  addChild(name: string): FileNode<T> {
    const child = new FileNode<T>(name);
    this.children.set(name, child);
    return child;
  }
}

export class FileTree<T> {
  name: string;
  root: FileNode<T>;
  size: number;

  constructor(name: string) {
    this.name = name;
    this.root = new FileNode<T>('/');
    this.size = 0;
  }

  addPath(path: string, entry: T, size: number): FileTree<T> {
    this.size += size;
    const parts = path.split('/');
    let node = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '') {
        continue;
      }
      const next = node.children.get(part);
      if (next) {
        node = next;
      } else {
        node = node.addChild(part);
      }
      node.size += size;
    }
    node.data = entry;
    return this;
  }
}
