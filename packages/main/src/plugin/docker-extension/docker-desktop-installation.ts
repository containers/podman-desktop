/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { ipcMain } from 'electron';
import type { ContainerProviderRegistry } from '../container-registry';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { readFile, cp } from 'node:fs/promises';
import * as tarFs from 'tar-fs';
import type Dockerode from 'dockerode';
import type { PullEvent } from '../api/pull-event';
import type { ContributionManager } from '../contribution-manager';
export class DockerDesktopInstallation {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
    private containerRegistry: ContainerProviderRegistry,
    private contributionManager: ContributionManager,
  ) {}

  async extractDockerDesktopFiles(
    tmpFolderPath: string,
    finalFolderPath: string,
    reportLog: (message: string) => void,
  ) {
    // ok now, we need to copy files that we're interested in by looking at the metadata.json file
    const metadataFile = await readFile(`${tmpFolderPath}/metadata.json`, 'utf8');
    const metadata = JSON.parse(metadataFile);

    // files or folder to grab
    const files: string[] = [];

    // save metadata
    files.push('metadata.json');

    // save icon
    if (metadata.icon) {
      files.push(metadata.icon);
    }

    if (metadata.ui) {
      Object.keys(metadata.ui).forEach(key => {
        files.push(metadata.ui[key].root);
      });
    }

    // host binaries
    const hostFiles: string[] = [];
    if (metadata.host && metadata.host.binaries) {
      // grab current platform
      let platform: string = process.platform;
      if (platform === 'win32') {
        platform = 'windows';
      }
      // do we have binaries ?
      if (metadata.host.binaries) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata.host.binaries.forEach((binary: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          binary[platform].forEach((binaryPlatform: any) => {
            hostFiles.push(binaryPlatform.path);
          });
        });
      }
    }

    // copy all files
    await Promise.all(
      files.map(async (file: string) => {
        return cp(path.join(tmpFolderPath, file), path.join(finalFolderPath, file), { recursive: true });
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
    ipcMain.handle('docker-desktop-plugin:get-preload-script', async (): Promise<string> => {
      const preloadScriptPath = path.join(__dirname, '../../preload-docker-extension/dist/index.cjs');
      return `file://${preloadScriptPath}`;
    });

    ipcMain.on(
      'docker-desktop-plugin:install',
      async (event: IpcMainEvent, imageName: string, logCallbackId: number): Promise<void> => {
        const reportLog = (message: string): void => {
          event.reply('docker-desktop-plugin:install-log', logCallbackId, message);
        };

        // use first working connection
        let providerConnectionDetails;
        try {
          providerConnectionDetails = this.containerRegistry.getFirstRunningConnection();
        } catch (error) {
          event.reply(
            'docker-desktop-plugin:install-error',
            logCallbackId,
            'No provider is running. Please start a provider.',
          );
          return;
        }

        const providerConnectionInfo = providerConnectionDetails[0];
        const providerConnection = providerConnectionDetails[1];
        //await providerConnection.pull('aquasec/trivy-docker-extension:0.4.3');
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
          event.reply('docker-desktop-plugin:install-error', logCallbackId, 'Error while pulling image: ' + error);
          return;
        }

        // ok search the image
        const images = await providerConnection.listImages();
        // const foundMatchingImage = images.find(image => image.RepoTags?.find(tag => tag.includes('aquasec/trivy-docker-extension:0.4.3')));
        const foundMatchingImage = images.find(image =>
          image.RepoTags?.find(tag => tag.includes(imageName) || imageName.includes(tag)),
        );

        if (!foundMatchingImage) {
          event.reply('docker-desktop-plugin:install-error', logCallbackId, `Not able to find image ${imageName}`);
          return;
        }

        // get the image information
        const image = await providerConnection.getImage(foundMatchingImage.Id);
        reportLog('Check if image is a Docker Desktop Extension...');

        // analyze the image
        const imageAnalysis = await image.inspect();

        // check if it's a Docker Desktop Extension
        const labels = imageAnalysis.Config.Labels;
        if (!labels) {
          event.reply(
            'docker-desktop-plugin:install-error',
            logCallbackId,
            `Image ${imageName} is not a Docker Desktop Extension`,
          );
          return;
        }
        const titleLabel = labels['org.opencontainers.image.title'];
        const descriptionLabel = labels['org.opencontainers.image.description'];
        const vendorLabel = labels['org.opencontainers.image.vendor'];
        const apiVersion = labels['com.docker.desktop.extension.api.version'];

        if (!titleLabel || !descriptionLabel || !vendorLabel || !apiVersion) {
          event.reply(
            'docker-desktop-plugin:install-error',
            logCallbackId,
            `Image ${imageName} is not a Docker Desktop Extension`,
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
        const finalFolderPath = path.join(
          this.contributionManager.getContributionStorageDir(),
          imageNameWithoutSpecialChars,
        );

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

        event.reply('docker-desktop-plugin:install-log', logCallbackId, 'Filtering image content...');

        await this.extractDockerDesktopFiles(tmpFolderPath, finalFolderPath, reportLog);

        // check metadata. If name is missing, add the one from the image
        const metadata = await this.contributionManager.loadMetadata(finalFolderPath);
        if (!metadata.name) {
          // need to add the title from the image
          metadata.name = titleLabel;
          await this.contributionManager.saveMetadata(finalFolderPath, metadata);
        }

        event.reply('docker-desktop-plugin:install-end', logCallbackId, 'Extension Successfully installed.');
        // refresh contributions
        await this.contributionManager.init();
      },
    );

    ipcMain.handle(
      'docker-desktop-plugin:delete',
      async (event: IpcMainInvokeEvent, extensionName: string): Promise<void> => {
        return this.contributionManager.deleteExtension(extensionName);
      },
    );

    ipcMain.handle(
      'docker-desktop-adapter:desktopUIToast',
      async (_event: IpcMainInvokeEvent, type: string, message: string): Promise<void> => {
        this.apiSender.send('toast:handler', { type, message });
      },
    );
  }
}
