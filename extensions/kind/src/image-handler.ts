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
import type { KindCluster } from './extension';
import * as extensionApi from '@podman-desktop/api';
import { tmpName } from 'tmp-promise';
import { runCliCommand } from './util';
import * as fs from 'node:fs';

type ImageInfo = { engineId: string; name?: string; tag?: string };

export class ImageHandler {
  async moveImage(image: ImageInfo, kindClusters: KindCluster[], kindCli: string) {
    if (!image.name) {
      throw new Error('Image selection not supported yet');
    }
    const clusters = kindClusters.filter(cluster => cluster.status === 'started');
    let selectedCluster: { label: string; engineType: string };

    if (clusters.length == 0) {
      throw new Error('No Kind clusters to push to');
    } else if (clusters.length == 1) {
      selectedCluster = { label: clusters[0].name, engineType: clusters[0].engineType };
    } else {
      selectedCluster = await extensionApi.window.showQuickPick(
        clusters.map(cluster => {
          return { label: cluster.name, engineType: cluster.engineType };
        }),
        { placeHolder: 'Select a Kind cluster to push to' },
      );
    }
    if (selectedCluster) {
      const filename = await tmpName();
      try {
        let name = image.name;
        if (image.tag) {
          name = name + ':' + image.tag;
        }
        await extensionApi.containerEngine.saveImage(image.engineId, name, filename);
        const env = process.env;
        if (selectedCluster.engineType === 'podman') {
          env['KIND_EXPERIMENTAL_PROVIDER'] = 'podman';
        } else {
          env['KIND_EXPERIMENTAL_PROVIDER'] = 'docker';
        }
        const result = await runCliCommand(kindCli, ['load', 'image-archive', '-n', selectedCluster.label, filename], {
          env: env,
        });
        if (result.exitCode === 0) {
          extensionApi.window.showNotification({
            body: `Image ${image.name} pushed to Kind cluster ${selectedCluster.label}`,
          });
        } else {
          throw new Error(
            `Error while pushing image ${image.name} to Kind cluster ${selectedCluster.label}: ${result.error}`,
          );
        }
      } catch (err) {
        throw new Error(`Error while pushing image ${image.name} to Kind cluster ${selectedCluster.label}: ${err}`);
      } finally {
        fs.promises.rm(filename);
      }
    }
  }
}
