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
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { cp } from 'node:fs/promises';
import * as tarFs from 'tar-fs';
import type { ExtensionLoader } from '../extension-loader.js';
import type { ApiSenderType } from '../api.js';
import type { ImageRegistry } from '../image-registry.js';

export class ExtensionInstaller {
  constructor(
    private apiSender: ApiSenderType,
    private extensionLoader: ExtensionLoader,
    private imageRegistry: ImageRegistry,
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

      extract.on('finish', () => {
        resolve();
      });

      extract.on('error', error => {
        reject(error);
      });
    });
  }

  async installFromImage(
    sendLog: (message: string) => void,
    sendError: (message: string) => void,
    sendEnd: (message: string) => void,
    imageName: string,
  ): Promise<void> {
    imageName = imageName.trim();
    sendLog(`Analyzing image ${imageName}...`);
    let imageConfigLabels;
    try {
      imageConfigLabels = await this.imageRegistry.getImageConfigLabels(imageName);
    } catch (error) {
      sendError('Error while analyzing image: ' + error);
      return;
    }

    if (!imageConfigLabels) {
      sendError(`Image ${imageName} is not a Podman Desktop Extension. Unable to grab image config labels.`);
      return;
    }

    const titleLabel = imageConfigLabels['org.opencontainers.image.title'];
    const descriptionLabel = imageConfigLabels['org.opencontainers.image.description'];
    const vendorLabel = imageConfigLabels['org.opencontainers.image.vendor'];
    const apiVersion = imageConfigLabels['io.podman-desktop.api.version'];

    if (!titleLabel || !descriptionLabel || !vendorLabel || !apiVersion) {
      sendError(`Image ${imageName} is not a Podman Desktop Extension`);
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

    // final folder
    const finalFolderPath = path.join(this.extensionLoader.getPluginsDirectory(), imageNameWithoutSpecialChars);

    // grab all extensions
    const extensions = await this.extensionLoader.listExtensions();

    // check if the extension is already installed for that path
    const alreadyInstalledExtension = extensions.find(extension => extension.path === finalFolderPath);

    if (alreadyInstalledExtension) {
      sendError(`Extension ${alreadyInstalledExtension.name} is already installed`);
      return;
    }

    sendLog('Downloading and extract layers...');
    await this.imageRegistry.downloadAndExtractImage(imageName, tmpFolderPath, sendLog);

    sendLog('Filtering image content...');
    await this.extractExtensionFiles(tmpFolderPath, finalFolderPath, sendLog);

    // refresh contributions
    try {
      const analyzedExtension = await this.extensionLoader.analyzeExtension(finalFolderPath, true);
      if (analyzedExtension) {
        await this.extensionLoader.loadExtension(analyzedExtension);
      }
    } catch (error) {
      sendError('Error while loading the extension ' + error);
      return;
    }

    sendEnd('Extension Successfully installed.');
    this.apiSender.send('extension-started', {});
  }

  async init(): Promise<void> {
    ipcMain.on(
      'extension-installer:install-from-image',
      (event: IpcMainEvent, imageName: string, logCallbackId: number): void => {
        const sendLog = (message: string): void => {
          event.reply('extension-installer:install-from-image-log', logCallbackId, message);
        };

        const sendError = (message: string): void => {
          event.reply('extension-installer:install-from-image-error', logCallbackId, message);
        };

        const sendEnd = (message: string): void => {
          event.reply('extension-installer:install-from-image-end', logCallbackId, message);
        };

        this.installFromImage(sendLog, sendError, sendEnd, imageName).catch((error: unknown) => {
          reportError('' + error);
        });
      },
    );
  }
}
