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

export interface Colorable {
  isDir: boolean;
  isLink: boolean;
  isFifo: boolean;
  isBlock: boolean;
  isChar: boolean;
  isExec: boolean;
  isSUID: boolean;
  isSGID: boolean;
}

export interface File extends Colorable {
  typeChar: string;
  modeString: string;
  uid: number | undefined;
  gid: number | undefined;
  size: number | undefined;
  linkTarget: string | undefined;
}

export interface ImageLayer {
  id: string;
  history?: string;
  tree: FileTree<File>;
}

interface ExtendedNodeEntry extends nodeTar.ReadEntry {
  linkpath: string;
}

function getModeString(mode: number | undefined): string {
  if (!mode) {
    return '';
  }
  return (
    (mode & 0o400 ? 'r' : '-') +
    (mode & 0o200 ? 'w' : '-') +
    (mode & 0o100 ? 'x' : '-') +
    (mode & 0o040 ? 'r' : '-') +
    (mode & 0o020 ? 'w' : '-') +
    (mode & 0o010 ? 'x' : '-') +
    (mode & 0o004 ? 'r' : '-') +
    (mode & 0o002 ? 'w' : '-') +
    (mode & 0o001 ? 'x' : '-')
  );
}

export async function getLayersFromImageArchive(tmpdir: string): Promise<ImageLayer[]> {
  const fileContent = fs.readFileSync(path.join(tmpdir, 'manifest.json'), 'utf-8');
  const manifest = JSON.parse(fileContent);
  if (manifest.length < 1) {
    return [];
  }
  const layers = manifest[0].Layers;

  const configFile = manifest[0].Config;
  const config = JSON.parse(fs.readFileSync(path.join(tmpdir, configFile), 'utf-8'));
  const history = config.history;
  const layersResult: ImageLayer[] = [];
  for (const layer of layers) {
    const tree = new FileTree<File>(layer);
    const layerTar = path.join(tmpdir, layer);
    await nodeTar.list({
      file: layerTar,
      onentry: (entry: ExtendedNodeEntry) => {
        const file = {
          typeChar: entry.type === 'Directory' ? 'd' : '-',
          modeString: getModeString(entry.mode),
          uid: entry.uid,
          gid: entry.gid,
          size: entry.size,
          isDir: entry.type === 'Directory',
          isLink: entry.type === 'SymbolicLink',
          isFifo: entry.type === 'FIFO',
          isBlock: entry.type === 'BlockDevice',
          isChar: entry.type === 'CharacterDevice',
          isExec: !!entry.mode && (entry.mode & 0o111) !== 0,
          isSUID: !!entry.mode && (entry.mode & 0o4000) !== 0,
          isSGID: !!entry.mode && (entry.mode & 0o2000) !== 0,
          linkTarget: entry.type === 'SymbolicLink' ? entry.linkpath : undefined,
        };
        tree.addPath(entry.path, file, entry.size ?? 0);
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
      layerHistory = hist.created_by.replace(/^\/bin\/sh -c #\(nop\) /, '');
      break;
    }
    layersResult.push({ id: layer, tree: tree, history: layerHistory } as ImageLayer);
  }
  return layersResult;
}
