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

import type { Disposable, ImageFilesProvider, ImageFileSymlink, ImageFilesystemLayer } from '@podman-desktop/api';

import type { ImageFilesRegistry } from './image-files-registry.js';

export interface AddCommonOptions {
  path: string;
  mode: number;
  uid?: number;
  gid?: number;
  ctime?: Date;
  atime?: Date;
  mtime?: Date;
}

export class ImageFilesImpl implements ImageFilesProvider, Disposable {
  constructor(
    readonly id: string,
    readonly registry: ImageFilesRegistry,
  ) {}

  addFile(layer: ImageFilesystemLayer, opts: AddCommonOptions & { size: number }): ImageFilesProvider {
    if (!layer.files) {
      layer.files = [];
    }
    layer.files.push({
      path: opts.path,
      type: 'file',
      mode: opts.mode,
      uid: opts.uid ?? 1,
      gid: opts.gid ?? 1,
      ctime: opts.ctime ?? new Date(),
      atime: opts.atime ?? new Date(),
      mtime: opts.mtime ?? new Date(),
      size: opts.size,
    });
    return this;
  }

  addDirectory(layer: ImageFilesystemLayer, opts: AddCommonOptions): ImageFilesProvider {
    if (!layer.files) {
      layer.files = [];
    }
    layer.files.push({
      path: opts.path,
      type: 'directory',
      mode: opts.mode,
      uid: opts.uid ?? 1,
      gid: opts.gid ?? 1,
      ctime: opts.ctime ?? new Date(),
      atime: opts.atime ?? new Date(),
      mtime: opts.mtime ?? new Date(),
      size: 0,
    });
    return this;
  }

  addSymlink(layer: ImageFilesystemLayer, opts: AddCommonOptions & { linkPath: string }): ImageFilesProvider {
    if (!layer.files) {
      layer.files = [];
    }
    layer.files.push({
      path: opts.path,
      type: 'symlink',
      mode: opts.mode,
      uid: opts.uid ?? 1,
      gid: opts.gid ?? 1,
      ctime: opts.ctime ?? new Date(),
      atime: opts.atime ?? new Date(),
      mtime: opts.mtime ?? new Date(),
      size: 0,
      linkPath: opts.linkPath,
    } as ImageFileSymlink);
    return this;
  }

  addWhiteout(layer: ImageFilesystemLayer, path: string): ImageFilesProvider {
    if (!layer.whiteouts) {
      layer.whiteouts = [];
    }
    layer.whiteouts.push(path);
    return this;
  }

  addOpaqueWhiteout(layer: ImageFilesystemLayer, path: string): ImageFilesProvider {
    if (!layer.opaqueWhiteouts) {
      layer.opaqueWhiteouts = [];
    }
    layer.opaqueWhiteouts.push(path);
    return this;
  }

  dispose(): void {
    this.registry.disposeImageFiles(this);
  }
}
