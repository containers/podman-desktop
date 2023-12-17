import nodeTar from 'tar';
import fs from 'node:fs';
import path from 'node:path';
import { fileTree } from './filetree.js';

export interface ImageLayer {
  id: string;
  history?: string;
  files: nodeTar.ReadEntry[];
  tree: fileTree<nodeTar.ReadEntry>;
}

export async function getLayersFromImageArchive(tmpdir: string): Promise<ImageLayer[]> {
  const manifest = JSON.parse(fs.readFileSync(path.join(tmpdir, 'manifest.json'), 'utf-8'));
  const layers = manifest[0].Layers;

  const configFile = manifest[0].Config;
  const config = JSON.parse(fs.readFileSync(path.join(tmpdir, configFile), 'utf-8'));
  const history = config.history;
  const layersResult: ImageLayer[] = [];
  for (const layer of layers) {
    const tree = new fileTree<nodeTar.ReadEntry>(layer);
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
