/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { ImageFile, ImageFilesystemLayer } from '@desktop-framework/extension-api';

import type { FilesystemTree } from './filesystem-tree.js';

export interface ImageFilesystemLayersUI {
  layers: ImageFilesystemLayerUI[];
}

export interface ImageFilesystemLayerUI extends ImageFilesystemLayer {
  // The files of the current layer and previous ones
  stackTree: FilesystemTree<ImageFile>;
  // The files of the current layer only
  layerTree: FilesystemTree<ImageFile>;
  // The sum of the sizes of all the files in the layer
  sizeInArchive: number;
  // The number of added/modified/removed files and the sizes of related changes
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  addedSize: number;
  modifiedSize: number;
  removedSize: number;
}
