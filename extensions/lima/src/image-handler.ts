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
import * as fs from 'node:fs';

import * as extensionApi from '@podman-desktop/api';
import { tmpName } from 'tmp-promise';

import { getInstallationPath } from './limactl';

type ImageInfo = { engineId: string; name?: string; tag?: string };

// Handle the image move command when moving from Podman or Docker to Lima
export class ImageHandler {
  // Move image from Podman or Docker to Lima
  async moveImage(image: ImageInfo, instanceName: string, limactl: string): Promise<void> {
    // If there's no image name passed in, we can't do anything
    if (!image.name) {
      throw new Error('Image selection not supported yet');
    }

    // Only proceed if instance was given
    if (instanceName) {
      let name = image.name;
      let filename: string | undefined;
      const env = Object.assign({}, process.env) as { [key: string]: string };

      // Create a name:tag string for the image
      if (image.tag) {
        name = name + ':' + image.tag;
      }

      env.PATH = getInstallationPath() ?? '';
      try {
        // Create a temporary file to store the image
        filename = await tmpName();

        // Save the image to the temporary file
        await extensionApi.containerEngine.saveImage(image.engineId, name, filename);

        // Run the Lima commands to push the image to the cluster
        const { stdout: tempname } = await extensionApi.process.exec(limactl, ['shell', instanceName, 'mktemp'], {
          env: env,
        });
        await extensionApi.process.exec(limactl, ['copy', filename, instanceName + ':' + tempname], { env: env });
        const loadCommand = ['sudo', 'ctr', '-n=k8s.io', 'images', 'import']; // or "sudo nerdctl -n k8s.io load -i"
        await extensionApi.process.exec(limactl, ['shell', instanceName, ...loadCommand, tempname], { env: env });
        await extensionApi.process.exec(limactl, ['shell', instanceName, 'rm', tempname], { env: env });

        // Show a dialog to the user that the image was pushed
        // TODO: Change this to taskbar notification when implemented
        await extensionApi.window.showInformationMessage(
          `Image ${image.name} pushed to Lima instance: ${instanceName}`,
        );
      } catch (err) {
        // Show a dialog error to the user that the image was not pushed
        await extensionApi.window.showErrorMessage(
          `Unable to push image ${image.name} to Lima instance: ${instanceName}. Error: ${err}`,
        );

        // Throw the errors to the console aswell
        throw new Error(`Unable to push image to Lima instance: ${err}`);
      } finally {
        // Remove the temporary file if one was created
        if (filename !== undefined) {
          await fs.promises.rm(filename);
        }
      }
    }
  }
}
