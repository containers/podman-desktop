/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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
import { cp, readFile } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import type { RequestConfig } from '@docker/extension-api-client-types/dist/v1';
import type Dockerode from 'dockerode';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { ipcMain } from 'electron';
import type { Method, OptionsOfTextResponseBody } from 'got';
import got, { RequestError } from 'got';
import * as tarFs from 'tar-fs';

import type { ApiSenderType } from '../api.js';
import type { PullEvent } from '../api/pull-event.js';
import type { ContainerProviderRegistry } from '../container-registry.js';
import type { ContributionManager } from '../contribution-manager.js';
import type { Directories } from '../directories.js';

export class DockerDesktopInstallation {
  constructor(
    private apiSender: ApiSenderType,
    private containerRegistry: ContainerProviderRegistry,
    private contributionManager: ContributionManager,
    private directories: Directories,
  ) {}

  async extractDockerDesktopFiles(
    tmpFolderPath: string,
    finalFolderPath: string,
    reportLog: (message: string) => void,
  ): Promise<void> {
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

    if (metadata.vm?.composefile) {
      files.push(metadata.vm.composefile);
    }

    // host binaries
    const hostFiles: string[] = [];
    if (metadata?.host?.binaries) {
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

      extract.on('finish', () => {
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
        containerFromImage
          .remove()
          .then(() => resolve(undefined))
          .catch((error: unknown) => {
            console.log('Unable to remove container', error);
          });
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
      (event: IpcMainEvent, imageName: string, logCallbackId: number): void => {
        this.handlePluginInstall(event, imageName, logCallbackId).catch((error: unknown) => {
          event.reply('docker-desktop-plugin:install-error', logCallbackId, error);
        });
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

    ipcMain.handle(
      'docker-desktop-adapter:extensionVMServiceRequest',
      async (_event: IpcMainInvokeEvent, port: string, config: RequestConfig): Promise<unknown> => {
        return this.handleExtensionVMServiceRequest(port, config);
      },
    );
  }

  // transform the method name to a got method
  protected isGotMethod(methodName: string): methodName is Method {
    const allMethods = [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'HEAD',
      'DELETE',
      'OPTIONS',
      'TRACE',
      'get',
      'post',
      'put',
      'patch',
      'head',
      'delete',
      'options',
      'trace',
    ];
    return allMethods.includes(methodName);
  }

  protected asGotMethod(methodName: string): Method {
    if (!this.isGotMethod(methodName)) {
      throw Error('Invalid method');
    }
    return methodName as Method;
  }

  protected async handleExtensionVMServiceRequest(port: string, config: RequestConfig): Promise<unknown> {
    // use got library
    try {
      const method: Method = this.asGotMethod(config.method);

      const options: OptionsOfTextResponseBody = {
        method,
      };

      if (config.data) {
        options.json = config.data;
      }

      options.headers = config.headers;

      const response = await got(`http://localhost:${port}${config.url}`, options);

      // try to see if response is json
      try {
        return JSON.parse(response.body);
      } catch (error) {
        // provides the body as is
        return response.body;
      }
    } catch (requestErr) {
      if (
        requestErr instanceof RequestError &&
        (requestErr.response?.statusCode === 401 || requestErr.response?.statusCode === 403)
      ) {
        throw Error('Unable to get access');
      } else if (requestErr instanceof Error) {
        throw Error(requestErr.message);
      } else {
        throw Error('Unknown error: ' + requestErr);
      }
    }
  }

  protected async handlePluginInstall(event: IpcMainEvent, imageName: string, logCallbackId: number): Promise<void> {
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
    const image = providerConnection.getImage(foundMatchingImage.Id);
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
    const finalFolderPath = path.join(this.directories.getContributionStorageDir(), imageNameWithoutSpecialChars);

    reportLog('Grabbing image content...');
    await this.exportContentOfContainer(providerConnection, foundMatchingImage.Id, tmpTarPath);

    // delete the image
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

    event.reply('docker-desktop-plugin:install-log', logCallbackId, 'Loading metadata...');
    // check metadata. If name is missing, add the one from the image
    const metadata = await this.contributionManager.loadMetadata(finalFolderPath);
    if (!metadata.name) {
      // need to add the title from the image
      metadata.name = titleLabel;
      await this.contributionManager.saveMetadata(finalFolderPath, metadata);
    }

    // if there is a VM, need to generate the updated compose file
    let enhancedComposeFile;
    if (metadata.vm) {
      // check compose presence
      event.reply('docker-desktop-plugin:install-log', logCallbackId, 'Check compose being setup...');
      const foundPath = await this.contributionManager.findComposeBinary();
      if (!foundPath) {
        event.reply('docker-desktop-plugin:install-error', logCallbackId, 'Compose binary not found.');
        return;
      } else {
        event.reply('docker-desktop-plugin:install-log', logCallbackId, `Compose binary found at ${foundPath}.`);
      }

      event.reply('docker-desktop-plugin:install-log', logCallbackId, 'Enhance compose file...');
      // need to update the compose file
      try {
        enhancedComposeFile = await this.contributionManager.enhanceComposeFile(finalFolderPath, imageName, metadata);
      } catch (error) {
        event.reply('docker-desktop-plugin:install-error', logCallbackId, error);
        return;
      }

      // try to start the VM
      event.reply('docker-desktop-plugin:install-log', logCallbackId, 'Starting compose project...');
      await this.contributionManager.startVM(metadata.name, enhancedComposeFile, true);
    }

    event.reply('docker-desktop-plugin:install-end', logCallbackId, 'Extension Successfully installed.');

    // refresh contributions
    try {
      await this.contributionManager.init();
    } catch (error) {
      event.reply('docker-desktop-plugin:install-error', logCallbackId, error);
      return;
    }
  }
}
