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

import type * as extensionApi from '@podman-desktop/api';
import * as http from 'node:http';

interface Version {
  Version: string;
  ApiVersion: string;
  MinAPIVersion: string;
  GitCommit: string;
  GoVersion: string;
  Os: string;
  Arch: string;
  KernelVersion: string;
  BuildTime: string;
  Platform: Platform;
}

interface Platform {
  Name: string;
}

export class PodmanDiagnosticInfoProvider implements extensionApi.DiagnosticInfoProvider {
  title = 'Podman Information';
  private readonly socketPath: string;

  constructor(socketPath: string) {
    this.socketPath = socketPath;
  }

  async collectInfo(): Promise<string> {
    let output = '';

    const version = await this.getVersionInformation();

    output += `Version: ${version.Version}\n`;
    output += `ApiVersion: ${version.ApiVersion}\n`;
    output += `MinApiVersion: ${version.MinAPIVersion}\n`;
    output += `GitCommit: ${version.GitCommit}\n`;
    output += `GoVersion: ${version.GoVersion}\n`;
    output += `Os: ${version.Os}\n`;
    output += `Arch: ${version.Arch}\n`;
    output += `KernelVersion: ${version.KernelVersion}\n`;
    output += `BuildTime: ${version.BuildTime}\n`;
    output += `Platform: ${version.Platform.Name}\n\n\n`;

    return output;
  }

  private getVersionInformation(): Promise<Version> {
    const versionUrl = {
      path: '/version',
      socketPath: this.socketPath,
    };

    return new Promise<Version>((resolve, reject) => {
      const req = http.get(versionUrl, res => {
        const body = [];
        res.on('data', chunk => {
          body.push(chunk);
        });

        res.on('end', err => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(Buffer.concat(body).toString()) as Version);
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(err.message));
          }
        });
      });

      req.once('error', err => {
        reject(new Error(err.message));
      });
    });
  }
}
