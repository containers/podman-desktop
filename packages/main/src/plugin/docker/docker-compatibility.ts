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

import { promises } from 'node:fs';

import Dockerode from 'dockerode';

import { getHostname, isLinux, isMac, isWindows } from '/@/util.js';
import type {
  DockerContextInfo,
  DockerSocketMappingStatusInfo,
  DockerSocketServerInfoType,
} from '/@api/docker-compatibility-info.js';
import { ExperimentalSettings } from '/@api/docker-compatibility-info.js';

import type { ConfigurationRegistry, IConfigurationNode } from '../configuration-registry.js';
import type { LibPod } from '../dockerode/libpod-dockerode.js';
import type { ProviderRegistry } from '../provider-registry.js';
import { DockerContextHandler } from './docker-context-handler.js';

export class DockerCompatibility {
  static readonly WINDOWS_NPIPE = '//./pipe/docker_engine';
  static readonly UNIX_SOCKET_PATH = '/var/run/docker.sock';

  static readonly ENABLED_FULL_KEY = `${ExperimentalSettings.SectionName}.${ExperimentalSettings.Enabled}`;

  #configurationRegistry: ConfigurationRegistry;

  #providerRegistry: ProviderRegistry;

  #dockerContextHandler: DockerContextHandler;

  constructor(configurationRegistry: ConfigurationRegistry, providerRegistry: ProviderRegistry) {
    this.#configurationRegistry = configurationRegistry;
    this.#providerRegistry = providerRegistry;
    this.#dockerContextHandler = new DockerContextHandler();
  }

  init(): void {
    const dockerCompatibilityConfiguration: IConfigurationNode = {
      id: 'preferences.experimental.dockerCompatibility',
      title: 'Experimental (Docker Compatibility)',
      type: 'object',
      properties: {
        [DockerCompatibility.ENABLED_FULL_KEY]: {
          description: 'Enable the section for Docker compatibility.',
          type: 'boolean',
          default: false,
        },
      },
    };

    this.#configurationRegistry.registerConfigurations([dockerCompatibilityConfiguration]);
  }

  protected getTypeFromServerInfo(
    info: { Name?: string; OperatingSystem?: string },
    podmanInfo?: unknown,
  ): DockerSocketServerInfoType {
    if (info.OperatingSystem === 'Docker Desktop') {
      return 'docker';
    } else if (info.OperatingSystem === 'podman' || podmanInfo) {
      // if podman info is available, then it is podman
      return 'podman';
    } else if (isLinux() && info.Name === getHostname()) {
      // Docker Engine
      return 'docker';
    }
    return 'unknown';
  }

  async resolveLinkIfAny(path: string): Promise<string> {
    // do not resolve on Windows
    if (isWindows()) {
      return path;
    }

    const lstat = await promises.lstat(path);
    if (lstat.isSymbolicLink()) {
      const resolved = await promises.readlink(path);
      return this.resolveLinkIfAny(resolved);
    }

    return path;
  }

  /**
   * Try to connect to the docker socket if on Linux or macOS or
   * to the named pipe if on Windows.
   * If the connection is successful, return the status as running.
   * Also return some extra information about the server.
   * If the socket path is an alias to a provider, return the connection information.
   * If the connection is not successful, return the status as unreachable.
   * @returns the status plus some extra information if the connection is successful
   */
  async getSystemDockerSocketMappingStatus(): Promise<DockerSocketMappingStatusInfo> {
    const socketPath = isWindows() ? DockerCompatibility.WINDOWS_NPIPE : DockerCompatibility.UNIX_SOCKET_PATH;

    const dockerode = new Dockerode({ socketPath });
    // check if we can also use a podman API
    const libpodDockerode = dockerode as unknown as LibPod;

    try {
      const compatInfo = await dockerode.info();
      let podmanInfo = undefined;

      let serverVersion = compatInfo.ServerVersion;
      try {
        podmanInfo = await libpodDockerode.podmanInfo();
        serverVersion = podmanInfo.version.Version;
      } catch (error: unknown) {
        // podman API is not available
      }

      const status: DockerSocketMappingStatusInfo = {
        status: 'running',
        serverInfo: {
          type: this.getTypeFromServerInfo(compatInfo, podmanInfo),
          serverVersion,
          operatingSystem: compatInfo.OperatingSystem,
          osType: compatInfo.OSType,
          architecture: compatInfo.Architecture,
        },
      };

      // now, try to see if the socket path is an alias to a podman machine
      if (isMac()) {
        // is UNIX_SOCKET_PATH a symbolic link ?
        const socketPath = await this.resolveLinkIfAny(DockerCompatibility.UNIX_SOCKET_PATH);

        // do we have a matching provider for the socket path ?
        const currentConnections = this.#providerRegistry.getContainerConnections();

        // search if we have a connection with the same socket path
        const foundConnection = currentConnections.find(c => c.connection.endpoint.socketPath === socketPath);

        // provider is the one that has the same id as the connection
        const allProviders = this.#providerRegistry.getProviderInfos();
        // search by provider id
        const provider = allProviders.find(p => p.id === foundConnection?.providerId);

        if (provider && foundConnection) {
          const link = `/preferences/container-connection/view/${provider.internalId}/${Buffer.from(
            foundConnection.connection.name,
          ).toString(
            'base64',
          )}/${Buffer.from(foundConnection.connection.endpoint.socketPath).toString('base64')}/summary`;

          // extra data to pass
          status.connectionInfo = {
            provider: {
              id: provider.id,
              name: provider.name,
            },
            link,
            name: foundConnection?.connection.name,
            displayName: foundConnection.connection.displayName ?? foundConnection.connection.name,
          };
        }
      }

      return status;
    } catch (error: unknown) {
      // unable to connect to the system socket
      // in that case, need to return the status as not reachable
      return { status: 'unreachable' };
    }
  }

  async listDockerContexts(): Promise<DockerContextInfo[]> {
    return this.#dockerContextHandler.listContexts();
  }

  async switchDockerContext(contextName: string): Promise<void> {
    return this.#dockerContextHandler.switchContext(contextName);
  }
}
