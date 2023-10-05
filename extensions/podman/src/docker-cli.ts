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
import * as extensionApi from '@podman-desktop/api';
import { compareVersions } from 'compare-versions';
import { isWindows } from './util';

const DOCKER_VERSION_PATTERN = /^Docker version (\d+\.\d+\.\d+), build (\w+)$/;

const DOCKER_MINIMUM_VERSION_FOR_CONTEXT = '19.03.0';

export async function getDockerCli(): Promise<DockerCli | undefined> {
  try {
    const result = await extensionApi.process.exec('docker', ['-v']);
    const match = DOCKER_VERSION_PATTERN.exec(result.stdout);
    if (match) {
      return new DockerCli(match[1]);
    }
  } catch (err) {
    return undefined;
  }
  return undefined;
}

export class DockerCli {
  constructor(private version: string) {}

  public isContextSupported(): boolean {
    return compareVersions(this.version, DOCKER_MINIMUM_VERSION_FOR_CONTEXT) >= 0;
  }

  private async checkPodmanContext(name: string): Promise<boolean> {
    const result = await extensionApi.process.exec('docker', ['context', 'list', '--format', 'json']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contexts = JSON.parse(result.stdout) as any[];
    return contexts.find(c => c.Name === name);
  }

  public async registerMachine(name: string, socketPath: string, useAsDefault: boolean) {
    const exists = await this.checkPodmanContext(name);
    if (isWindows()) {
      socketPath = `npipe://${socketPath.replace(/\\/g, '/')}`;
    } else {
      socketPath = `unix:/${socketPath}`;
    }
    if (exists) {
      await extensionApi.process.exec('docker', [
        'context',
        'update',
        name,
        '--docker',
        `host=${socketPath}`,
        '--description',
        `Podman machine ${name}`,
      ]);
    } else {
      await extensionApi.process.exec('docker', [
        'context',
        'create',
        name,
        '--docker',
        `host=${socketPath}`,
        '--description',
        `Podman machine ${name}`,
      ]);
    }
    if (useAsDefault) {
      await this.setAsDefaultContext(name);
    }
  }

  public async unregisterMachine(name: string) {
    await extensionApi.process.exec('docker', ['context', 'rm', '-f', name]);
  }

  public async setAsDefaultContext(name: string) {
    await extensionApi.process.exec('docker', ['context', 'use', name]);
  }

  private extractSocketPath(endpoint: string): string {
    endpoint = endpoint.substring(endpoint.lastIndexOf(':') + 1);
    if (isWindows()) {
      endpoint = endpoint.substring(2).replace(/\//g, '\\');
    } else {
      endpoint = endpoint.substring(1);
    }
    return endpoint;
  }

  public async getDefaultSocketPath(): Promise<string | undefined> {
    const result = await extensionApi.process.exec('docker', ['context', 'list', '--format', 'json']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contexts = JSON.parse(result.stdout) as any[];
    const defaultContext = contexts.find(c => c.Current);
    if (defaultContext) {
      return this.extractSocketPath(defaultContext.DockerEndpoint);
    }
    return undefined;
  }
}
