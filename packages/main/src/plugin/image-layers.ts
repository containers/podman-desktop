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

import nodeTar from 'tar';
import fs from 'node:fs';
import path from 'node:path';
import { FileTree } from './file-tree.js';

export interface ImageLayer {
  id: string;
  history?: string;
  files: nodeTar.ReadEntry[];
  tree: FileTree<nodeTar.ReadEntry>;
}

export async function getLayersFromImageArchive(tmpdir: string): Promise<ImageLayer[]> {
  const manifest = JSON.parse(fs.readFileSync(path.join(tmpdir, 'manifest.json'), 'utf-8'));
  const layers = manifest[0].Layers;

  const configFile = manifest[0].Config;
  const config = JSON.parse(fs.readFileSync(path.join(tmpdir, configFile), 'utf-8'));
  const history = config.history;
  const layersResult: ImageLayer[] = [];
  for (const layer of layers) {
    const tree = new FileTree<nodeTar.ReadEntry>(layer);
    const entries: nodeTar.ReadEntry[] = [];
    const layerTar = path.join(tmpdir, layer);
    await nodeTar.list({
      file: layerTar,
      onentry: (entry: nodeTar.ReadEntry) => {
        entries.push(entry);
        tree.addPath(entry.path, entry);
        tree.addFileSize(entry.size ?? 0);
      },
    });
    let layerHistory: string | undefined;
    for (;;) {
      const hist = history.shift();
      if (!hist) {
        break;
      }
      if (hist.empty_layer) {
        continue;
      }
      layerHistory = hist.created_by.replace(/^\/bin\/sh -c /, '');
      break;
    }
    layersResult.push({ id: layer, files: entries, tree: tree, history: layerHistory });
  }
  return layersResult;
}
