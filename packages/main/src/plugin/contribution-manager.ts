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

import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import type { ContributionInfo } from './api/contribution-info';

/**
 * Contribution manager to provide the list of external OCI contributions
 */
export class ContributionManager {
  private contributions: ContributionInfo[] = [];

  //an empty svg icon <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>
  private readonly EMPTY_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private apiSender: any) {}

  // load the existing contributions
  async init(): Promise<void> {
    // create directory if not there
    const contributionsFolder = this.getContributionStorageDir();
    if (!fs.existsSync(contributionsFolder)) {
      fs.mkdirSync(contributionsFolder);
    }

    // load the existing contributions
    const foldersList = await fs.promises.readdir(contributionsFolder, { withFileTypes: true });
    const matchingDirectories = foldersList
      .filter(entry => entry.isDirectory())
      .map(directory => path.join(contributionsFolder, directory.name));
    const allContribs = await Promise.all(
      matchingDirectories.map(async directory => {
        const metadata = await this.loadMetadata(directory);
        const extensionId = metadata.name;
        // grab only UI contributions for now
        if (!metadata.ui) {
          return [];
        }

        const icon = await this.loadBase64Icon(directory, metadata);

        // grab all UI keys
        const uiKeys = Object.keys(metadata.ui);
        return uiKeys.map(key => {
          const uiMetadata = metadata.ui[key];

          const uiUri = `file://${path.join(directory, uiMetadata.root, uiMetadata.src)}`;

          const contribution: ContributionInfo = {
            id: key,
            extensionId,
            name: uiMetadata.title,
            type: 'docker',
            uiUri,
            icon,
            hostEnvPath: path.join(directory, 'host'),
            storagePath: directory,
          };
          return contribution;
        });
      }),
    );

    // flatten
    this.contributions = allContribs.flat();
    this.apiSender.send('contribution-register', this.contributions);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadBase64Icon(rootDirectory: string, metadata: any): Promise<string> {
    if (!metadata.icon) {
      return this.EMPTY_ICON;
    }
    const iconPath = path.join(rootDirectory, metadata.icon);
    if (!fs.existsSync(iconPath)) {
      throw new Error('Invalid icon path : ' + iconPath);
    }
    return fs.promises
      .readFile(iconPath, 'utf-8')
      .then(data => 'data:image/svg+xml;base64,' + Buffer.from(data).toString('base64'));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadMetadata(rootDirectory: string): Promise<any> {
    const manifestPath = path.join(rootDirectory, 'metadata.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Invalid path : ' + manifestPath);
    }
    return new Promise((resolve, reject) => {
      fs.readFile(manifestPath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  async saveMetadata(rootDirectory: string, metadata: unknown): Promise<void> {
    const manifestPath = path.join(rootDirectory, 'metadata.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Invalid path : ' + manifestPath);
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(
        manifestPath,
        JSON.stringify(metadata, undefined, 2),
        { encoding: 'utf-8' },
        (err: NodeJS.ErrnoException | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  public getContributionStorageDir(): string {
    return path.resolve(os.homedir(), '.local/share/containers/podman-desktop/contributions');
  }

  getExtensionPath(extensionId: string): string | undefined {
    const matching = this.contributions.find(contribution => contribution.extensionId === extensionId);
    if (matching) {
      return matching.hostEnvPath;
    } else {
      return undefined;
    }
  }

  async deleteExtension(extensionId: string): Promise<void> {
    const matching = this.contributions.find(contribution => contribution.extensionId === extensionId);
    if (!matching) {
      throw new Error('Unable to find the extension' + extensionId);
    }

    const extensionPath = matching.storagePath;
    // delete all this directory
    console.log('deleting', extensionPath);
    await fs.promises.rm(extensionPath, { recursive: true });

    // recompute
    console.log('recompute', extensionPath);
    await this.init();

    console.log('send event', extensionPath);
    this.apiSender.send('contribution-unregister', matching);
  }

  listContributions(): ContributionInfo[] {
    return this.contributions;
  }
}
