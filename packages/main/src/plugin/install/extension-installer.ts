/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { cp } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import type { IpcMainEvent } from 'electron';
import { ipcMain } from 'electron';
import * as tarFs from 'tar-fs';

import type { Directories } from '/@/plugin/directories.js';

import type { ApiSenderType } from '../api.js';
import type { ContributionManager } from '../contribution-manager.js';
import { DockerDesktopContribution, DockerDesktopInstaller } from '../docker-extension/docker-desktop-installer.js';
import type { AnalyzedExtension, ExtensionLoader } from '../extension-loader.js';
import type { ExtensionsCatalog } from '../extensions-catalog/extensions-catalog.js';
import type { ImageRegistry } from '../image-registry.js';
import type { Telemetry } from '../telemetry/telemetry.js';

export class ExtensionInstaller {
  #dockerDesktopInstaller: DockerDesktopInstaller;

  constructor(
    private apiSender: ApiSenderType,
    private extensionLoader: ExtensionLoader,
    private imageRegistry: ImageRegistry,
    private extensionCatalog: ExtensionsCatalog,
    private telemetry: Telemetry,
    private directories: Directories,
    private contributionManager: ContributionManager,
  ) {
    this.#dockerDesktopInstaller = new DockerDesktopInstaller(contributionManager);
  }

  async extractExtensionFiles(
    tmpFolderPath: string,
    finalFolderPath: string,
    reportLog: (message: string) => void,
  ): Promise<void> {
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

  async analyzeFromImage(
    sendLog: (message: string) => void,
    sendError: (message: string) => void,
    imageName: string,
  ): Promise<AnalyzedExtension | DockerDesktopContribution | undefined> {
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

    const titleLabel = imageConfigLabels['org.opencontainers.image.title'] as string | undefined;
    const descriptionLabel = imageConfigLabels['org.opencontainers.image.description'];
    const vendorLabel = imageConfigLabels['org.opencontainers.image.vendor'];
    const apiVersion = imageConfigLabels['io.podman-desktop.api.version'];
    const apiDDVersion = imageConfigLabels['com.docker.desktop.extension.api.version'];

    if (!titleLabel || !descriptionLabel || !vendorLabel || (!apiVersion && !apiDDVersion)) {
      sendError(`Image ${imageName} is not a Podman Desktop Extension`);
      return;
    }

    const isDDExtension = apiDDVersion ? true : false;
    const isPDExtension = apiVersion ? true : false;

    let unpackedFolder;
    // where to unpack the extension
    if (isPDExtension) {
      unpackedFolder = this.directories.getPluginsDirectory();
    } else {
      unpackedFolder = this.directories.getContributionStorageDir();
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
    const finalFolderPath = path.join(unpackedFolder, imageNameWithoutSpecialChars);

    // grab all extensions
    if (isPDExtension) {
      const extensions = await this.extensionLoader.listExtensions();

      // check if the extension is already installed for that path
      const alreadyInstalledExtension = extensions.find(extension => extension.path === finalFolderPath);

      if (alreadyInstalledExtension) {
        sendError(`Extension ${alreadyInstalledExtension.name} is already installed`);
        return;
      }
    }

    sendLog('Downloading and extract layers...');
    await this.imageRegistry.downloadAndExtractImage(imageName, tmpFolderPath, sendLog);

    sendLog('Filtering image content...');
    if (isPDExtension) {
      await this.extractExtensionFiles(tmpFolderPath, finalFolderPath, sendLog);
    } else if (isDDExtension) {
      await this.#dockerDesktopInstaller.extractExtensionFiles(tmpFolderPath, finalFolderPath, sendLog);
    }

    // delete the tmp folder
    fs.rmSync(tmpFolderPath, { recursive: true });

    if (isPDExtension) {
      let analyzedExtension: AnalyzedExtension | undefined;
      try {
        analyzedExtension = await this.extensionLoader.analyzeExtension(finalFolderPath, true);
      } catch (error) {
        sendError('Error while analyzing extension: ' + error);
      }
      if (analyzedExtension?.error) {
        sendError('Could not load extension: ' + analyzedExtension?.error);
        return;
      }
      return analyzedExtension;
    } else if (isDDExtension) {
      return this.#dockerDesktopInstaller.setupContribution(titleLabel, imageName, finalFolderPath, sendLog, sendError);
    }
  }

  async analyzeTransitiveDependencies(
    analyzedExtension: AnalyzedExtension | undefined,
    analyzedExtensions: AnalyzedExtension[],
    errors: string[],
    sendLog: (message: string) => void,
    sendError: (message: string) => void,
  ): Promise<boolean> {
    if (!analyzedExtension) {
      return false;
    }

    analyzedExtensions.push(analyzedExtension);

    const dependencyExtensionIds: string[] = [];

    // do we have extensionPack or extension dependencies
    if (analyzedExtension?.manifest?.extensionPack) {
      dependencyExtensionIds.push(...analyzedExtension.manifest.extensionPack);
    }
    if (analyzedExtension?.manifest?.extensionDependencies) {
      dependencyExtensionIds.push(...analyzedExtension.manifest.extensionDependencies);
    }

    // if we have dependencies, we need to analyze them first if not yet installed
    if (dependencyExtensionIds.length > 0) {
      const fetchableExtensions = await this.extensionCatalog.getFetchableExtensions();
      const alreadyInstalledExtensionIds = (await this.extensionLoader.listExtensions()).map(extension => extension.id);

      // need to analyze extensions that are in dependency minus the one installed or already analyzed
      const extensionsToAnalyze = dependencyExtensionIds.filter(
        dependency =>
          !alreadyInstalledExtensionIds.includes(dependency) ||
          !analyzedExtensions.find(extension => extension.id === dependency),
      );

      // check if all dependencies are in the catalog
      const missingDependencies = extensionsToAnalyze.filter(
        dependency => !fetchableExtensions.find(extension => extension.extensionId === dependency),
      );
      if (missingDependencies.length > 0) {
        errors.push(
          `Extension ${
            analyzedExtension.manifest.name
          } has missing installable dependencies: ${missingDependencies.join(', ')} from extensionPack attribute.`,
        );
        return false;
      }

      // first, grab name of the OCI image for each extension
      const imagesOfExtensionsToAnalyze = extensionsToAnalyze.reduce<string[]>((prev, id) => {
        const ext = fetchableExtensions.find(extension => extension.extensionId === id);
        if (ext) prev.push(ext.link);
        return prev;
      }, []);

      // now analyze all these dependencies
      for (const imageNameToAnalyze of imagesOfExtensionsToAnalyze) {
        try {
          const imageToAnalyze = await this.analyzeFromImage(sendLog, sendError, imageNameToAnalyze);

          if (!imageToAnalyze || imageToAnalyze instanceof DockerDesktopContribution) {
            return false;
          }
          await this.analyzeTransitiveDependencies(imageToAnalyze, analyzedExtensions, errors, sendLog, sendError);
        } catch (error) {
          errors.push(`Error while analyzing extension ${imageNameToAnalyze}: ${error}`);
        }
      }
    }
    return true;
  }

  async installFromImage(
    sendLog: (message: string) => void,
    sendError: (message: string) => void,
    sendEnd: (message: string) => void,
    imageName: string,
    extensionAnalyzed?: (extension: AnalyzedExtension) => void,
  ): Promise<void> {
    // now collect all transitive dependencies
    const analyzedExtensions: AnalyzedExtension[] = [];
    const errors: string[] = [];
    const analyzedExtension = await this.analyzeFromImage(sendLog, sendError, imageName);
    if (analyzedExtension instanceof DockerDesktopContribution) {
      sendEnd('Docker Desktop Extension Successfully installed.');
      return;
    }

    if (analyzedExtension) extensionAnalyzed?.(analyzedExtension);

    const analyzeSuccessful = await this.analyzeTransitiveDependencies(
      analyzedExtension,
      analyzedExtensions,
      errors,
      sendLog,
      sendError,
    );

    // if we have some undefined objects, it is an error, cleanup extensions
    if (errors.length > 0) {
      analyzedExtensions
        .filter(extension => extension !== undefined)
        .forEach(extension => {
          extension?.path && fs.rmdirSync(extension.path, { recursive: true });
        });
      sendError(`Error while installing extension ${imageName}: ${errors.join('\n')}`);
      return;
    }

    if (!analyzeSuccessful) {
      return;
    }

    // load all extensions
    await this.extensionLoader.loadExtensions(analyzedExtensions);

    sendEnd('Extension Successfully installed.');
    this.apiSender.send('extension-started', {});
  }

  async init(): Promise<void> {
    ipcMain.on(
      'extension-installer:install-from-image',
      (event: IpcMainEvent, imageName: string, logCallbackId: number): void => {
        const telemetryData: {
          extensionId?: string;
          error?: string;
        } = {};

        const sendLog = (message: string): void => {
          event.reply('extension-installer:install-from-image-log', logCallbackId, message);
        };

        const sendError = (message: string): void => {
          telemetryData.error = message;
          event.reply('extension-installer:install-from-image-error', logCallbackId, message);
        };

        const sendEnd = (message: string): void => {
          event.reply('extension-installer:install-from-image-end', logCallbackId, message);
        };

        const extAnalyzed = (extension: AnalyzedExtension): void => {
          if (extension) {
            telemetryData.extensionId = extension.id;
          }
        };

        this.installFromImage(sendLog, sendError, sendEnd, imageName, extAnalyzed)
          .catch((error: unknown) => {
            sendError('' + error);
            telemetryData.error = `${error}`;
          })
          .finally(() => {
            this.telemetry.track('installedExtension', telemetryData);
          });
      },
    );
  }
}
