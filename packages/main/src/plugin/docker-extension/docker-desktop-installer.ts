/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { cp, readFile } from 'node:fs/promises';
import * as path from 'node:path';

import type { ContributionManager } from '/@/plugin/contribution-manager.js';

export class DockerDesktopContribution {
  readonly #title: string;
  readonly #extensionPath: string;
  readonly #metadata: unknown;

  constructor(title: string, extensionPath: string, metadata: unknown) {
    this.#title = title;
    this.#extensionPath = extensionPath;
    this.#metadata = metadata;
  }

  get title(): string {
    return this.#title;
  }

  get extensionPath(): string {
    return this.#extensionPath;
  }

  get metadata(): unknown {
    return this.#metadata;
  }
}

export class DockerDesktopInstaller {
  readonly #contributionManager: ContributionManager;

  constructor(contributionManager: ContributionManager) {
    this.#contributionManager = contributionManager;
  }

  async extractExtensionFiles(
    sourceFolderPath: string,
    destFolderPath: string,
    reportLog: (message: string) => void,
  ): Promise<void> {
    // ok now, we need to copy files that we're interested in by looking at the metadata.json file
    const metadataFile = await readFile(`${sourceFolderPath}/metadata.json`, 'utf8');
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
        metadata.host.binaries.forEach((binary: { [key: string]: { path: string }[] }) => {
          binary[platform].forEach(binaryPlatform => {
            hostFiles.push(binaryPlatform.path);
          });
        });
      }
    }

    // copy all files
    await Promise.all(
      files.map(async (file: string) => {
        return cp(path.join(sourceFolderPath, file), path.join(destFolderPath, file), { recursive: true });
      }),
    );
    // copy all host files
    await Promise.all(
      hostFiles.map(async (file: string) => {
        const sourceFile = path.join(sourceFolderPath, file);
        // get only the filename from the path
        const destFile = path.basename(sourceFile);
        reportLog(`Copying host file ${destFile}.`);
        return cp(sourceFile, path.join(destFolderPath, 'host', destFile), { recursive: true });
      }),
    );
  }

  async setupContribution(
    title: string,
    imageName: string,
    destFolderPath: string,
    sendLog: (message: string) => void,
    sendError: (message: string) => void,
  ): Promise<DockerDesktopContribution | undefined> {
    // check metadata. If name is missing, add the one from the image
    const metadata = await this.#contributionManager.loadMetadata(destFolderPath);
    if (!metadata.name) {
      // need to add the title from the image
      metadata.name = title;
      await this.#contributionManager.saveMetadata(destFolderPath, metadata);
    }

    // if there is a VM, need to generate the updated compose file
    let enhancedComposeFile;
    if (metadata.vm) {
      // check compose presence
      sendLog('Check compose being setup...');
      const foundPath = await this.#contributionManager.findComposeBinary();
      if (!foundPath) {
        sendError('Compose binary not found.');
        return;
      } else {
        sendLog(`Compose binary found at ${foundPath}.`);
      }

      sendLog('Enhance compose file...');
      // need to update the compose file
      try {
        enhancedComposeFile = await this.#contributionManager.enhanceComposeFile(destFolderPath, imageName, metadata);
      } catch (error) {
        sendError(String(error));
        return;
      }

      // try to start the VM
      sendLog('Starting compose project...');
      await this.#contributionManager.startVM(metadata.name, enhancedComposeFile, true);
    }

    sendLog('Extension Successfully installed.');

    // refresh contributions
    try {
      await this.#contributionManager.init();
    } catch (error) {
      sendError(String(error));
      return;
    }
    return new DockerDesktopContribution(title, destFolderPath, metadata);
  }
}
