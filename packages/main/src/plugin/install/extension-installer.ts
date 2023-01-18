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

import type { IpcMainEvent } from 'electron';
import { ipcMain } from 'electron';
import type { ContainerProviderRegistry } from '../container-registry';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { cp } from 'node:fs/promises';
import * as tarFs from 'tar-fs';
import type Dockerode from 'dockerode';
import type { PullEvent } from '../api/pull-event';
import type { ExtensionLoader } from '../extension-loader';
export class ExtensionInstaller {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
    private containerRegistry: ContainerProviderRegistry,
    private extensionLoader: ExtensionLoader,
  ) {}

  async extractExtensionFiles(tmpFolderPath: string, finalFolderPath: string, reportLog: (message: string) => void) {
    // files or folder to grab
    const filesExtension: string[] = [];
    const hostFiles: string[] = [];
    // do we have binaries in ${tmpFolderPath}/extension folder ?
    if (fs.existsSync(`${tmpFolderPath}/extension`)) {
      // list all files in the binaries/${platform} folder
      const extensionFolder = `${tmpFolderPath}/extension/`;

      // grab files from that directory using fs promises
      const extensionFiles = await fs.promises.readdir(extensionFolder, { withFileTypes: true });

      // add all files
      for (const file of extensionFiles) {
        // if it's a file, add it to the files list
        //if (file.isFile()) {
        filesExtension.push(file.name);
        //}
      }
    }

    // copy all files
    await Promise.all(
      filesExtension.map(async (file: string) => {
        return cp(path.join(tmpFolderPath, 'extension', file), path.join(finalFolderPath, file), { recursive: true });
      }),
    );
    // copy all host files
    await Promise.all(
      hostFiles.map(async (file: string) => {
        const sourceFile = path.join(tmpFolderPath, file);
        // get only the filename from the path
        const destFile = path.basename(sourceFile);
        reportLog(`Copying host file ${destFile}.`);
        return cp(sourceFile, path.join(finalFolderPath, 'host', destFile), { recursive: true });
      }),
    );

    // delete the tmp folder
    fs.rmSync(tmpFolderPath, { recursive: true });
  }

  async unpackTarFile(tarFilePath: string, destFolder: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(tarFilePath);
      const extract = tarFs.extract(destFolder);
      readStream.pipe(extract);

      extract.on('finish', async () => {
        resolve();
      });

      extract.on('error', error => {
        reject(error);
      });
    });
  }

  async exportContentOfContainer(providerConnection: Dockerode, imageId: string, tmpTarPath: string): Promise<void> {
    // export the content of the image
    const containerFromImage = await providerConnection.createContainer({ Image: imageId, Entrypoint: ['/bin/sh'] });
    const exportResult = await containerFromImage.export();

    const fileWriteStream = fs.createWriteStream(tmpTarPath, {
      flags: 'w',
    });

    return new Promise<void>((resolve, reject) => {
      exportResult.on('close', () => {
        fileWriteStream.close();

        // ok we can remove the container
        containerFromImage.remove().then(() => resolve(undefined));
      });

      exportResult.on('data', chunk => {
        fileWriteStream.write(chunk);
      });

      exportResult.on('error', error => {
        reject(error);
      });
    });
  }

  async init(): Promise<void> {
    ipcMain.on(
      'extension-installer:install-from-image',
      async (event: IpcMainEvent, imageName: string, logCallbackId: number): Promise<void> => {
        const reportLog = (message: string): void => {
          event.reply('extension-installer:install-from-image-log', logCallbackId, message);
        };

        // use first working connection
        let providerConnectionDetails;
        try {
          providerConnectionDetails = this.containerRegistry.getFirstRunningConnection();
        } catch (error) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            'No provider is running. Please start a provider.',
          );
          return;
        }

        const providerConnectionInfo = providerConnectionDetails[0];
        const providerConnection = providerConnectionDetails[1];
        reportLog(`Pulling image ${imageName}...`);

        try {
          await this.containerRegistry.pullImage(providerConnectionInfo, imageName, (pullEvent: PullEvent) => {
            if (pullEvent.progress || pullEvent.progressDetail) {
              console.log(pullEvent.progress);
            } else if (pullEvent.status) {
              reportLog(pullEvent.status);
            }
          });
        } catch (error) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            'Error while pulling image: ' + error,
          );
          return;
        }

        // ok search the image
        const images = await providerConnection.listImages();
        const foundMatchingImage = images.find(image =>
          image.RepoTags?.find(tag => tag.includes(imageName) || imageName.includes(tag)),
        );

        if (!foundMatchingImage) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            `Not able to pull image ${imageName}`,
          );
          return;
        }

        // get the image information
        const image = await providerConnection.getImage(foundMatchingImage.Id);
        reportLog('Check if image is a Podman Desktop Extension...');

        // analyze the image
        const imageAnalysis = await image.inspect();

        // check if it's a Podman Desktop Extension
        const labels = imageAnalysis.Config.Labels;
        if (!labels) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            `Image ${imageName} is not a Podman Desktop Extension`,
          );
          return;
        }
        const titleLabel = labels['org.opencontainers.image.title'];
        const descriptionLabel = labels['org.opencontainers.image.description'];
        const vendorLabel = labels['org.opencontainers.image.vendor'];
        const apiVersion = labels['io.podman-desktop.api.version'];

        if (!titleLabel || !descriptionLabel || !vendorLabel || !apiVersion) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            `Image ${imageName} is not a Podman Desktop Extension`,
          );
          return;
        }

        // strip the tag (ending with :something) from the image name if any
        let imageNameWithoutTag: string;
        if (imageName.includes(':')) {
          imageNameWithoutTag = imageName.split(':')[0];
        } else {
          imageNameWithoutTag = imageName;
        }

        // remove all special characters from the image name
        const imageNameWithoutSpecialChars = imageNameWithoutTag.replace(/[^a-zA-Z0-9]/g, '');

        // tmp folder
        const tmpFolderPath = path.join(os.tmpdir(), `/tmp/${imageNameWithoutSpecialChars}-tmp`);

        // tmp tar file
        const tmpTarPath = path.join(os.tmpdir(), `${imageNameWithoutSpecialChars}-tmp.tar`);

        // final folder
        const finalFolderPath = path.join(this.extensionLoader.getPluginsDirectory(), imageNameWithoutSpecialChars);

        // grab all extensions
        const extensions = await this.extensionLoader.listExtensions();

        // check if the extension is already installed for that path
        const alreadyInstalledExtension = extensions.find(extension => extension.path === finalFolderPath);

        if (alreadyInstalledExtension) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            `Extension ${alreadyInstalledExtension.name} is already installed`,
          );
          return;
        }

        reportLog('Grabbing image content...');
        await this.exportContentOfContainer(providerConnection, foundMatchingImage.Id, tmpTarPath);

        // delete image
        await image.remove();

        reportLog('Extracting image content...');
        try {
          await this.unpackTarFile(tmpTarPath, tmpFolderPath);
        } finally {
          // delete the tmp tar file
          fs.unlinkSync(tmpTarPath);
        }

        event.reply('extension-installer:install-from-image-log', logCallbackId, 'Filtering image content...');

        await this.extractExtensionFiles(tmpFolderPath, finalFolderPath, reportLog);

        // refresh contributions
        try {
          await this.extensionLoader.loadExtension(finalFolderPath, true);
        } catch (error) {
          event.reply(
            'extension-installer:install-from-image-error',
            logCallbackId,
            'Error while loading the extension ' + error,
          );
          return;
        }

        event.reply('extension-installer:install-from-image-end', logCallbackId, 'Extension Successfully installed.');
        this.apiSender.send('extension-started', {});
      },
    );
  }
}
