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

import * as fs from 'node:fs';
import * as path from 'node:path';

import type { RunResult } from '@podman-desktop/api';
import * as jsYaml from 'js-yaml';

import type { ContributionInfo } from '/@api/contribution-info.js';

import { isLinux, isMac, isWindows } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { Directories } from './directories.js';
import type { Exec } from './util/exec.js';
import { getFreePort } from './util/port.js';

export interface DockerExtensionMetadata {
  name: string;
  vm?: {
    composefile?: string;
    exposes?: {
      socket?: string;
    };
  };
}

interface ComposeObject {
  services: {
    [key: string]: {
      image?: string;
      entrypoint?: string;
      command?: string;
      volumes?: string[];
      ports?: string[];
      labels?: { [key: string]: string };
      deploy?: { restart_policy?: { condition?: string } };
      volumes_from?: string[];
    };
  };
}
/**
 * Contribution manager to provide the list of external OCI contributions
 */
export class ContributionManager {
  protected contributions: ContributionInfo[] = [];

  private static readonly VM_COMPOSE_FILE = 'vm-compose/docker-compose.yaml';
  private static readonly VM_PORTNUMBER_FILE = 'vm-compose/port-number';

  private static readonly GLOBAL_PORTS_FILE = 'ports-file';

  protected startedContributions = new Map<string, boolean>();

  //an empty svg icon <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>
  private readonly EMPTY_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=';

  constructor(
    private apiSender: ApiSenderType,
    private directories: Directories,
    private containerRegistry: ContainerProviderRegistry,
    private exec: Exec,
  ) {}

  // load the existing contributions
  async init(): Promise<void> {
    // create directory if not there
    const contributionsFolder = this.directories.getContributionStorageDir();
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

          // is there a compose-file that has been added ?
          const composeFile = path.join(directory, ContributionManager.VM_COMPOSE_FILE);
          let vmCustomizedComposeFile: string | undefined;
          let vmServicePort: number | undefined;
          if (fs.existsSync(composeFile)) {
            vmCustomizedComposeFile = composeFile;
            // do we have a port to use ?
            const portFile = path.join(directory, ContributionManager.VM_PORTNUMBER_FILE);
            if (fs.existsSync(portFile)) {
              // content is the port number
              vmServicePort = parseInt(fs.readFileSync(portFile, 'utf-8'));
            }
          }

          const contribution: ContributionInfo = {
            id: key,
            extensionId,
            description: metadata.description ?? '',
            displayName: uiMetadata.title,
            publisher: metadata.publisher ?? '',
            version: metadata.version ?? '',
            name: uiMetadata.title,
            type: 'docker',
            uiUri,
            icon,
            vmCustomizedComposeFile,
            vmServicePort,
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

    // start vm engine but do not hold before returning
    this.startVMs().catch((error: unknown) => {
      console.log('unable to start VMs', error);
    });
  }

  // search docker-compose binary
  async findComposeBinary(): Promise<string | undefined> {
    const binaries = [];
    if (isWindows()) {
      binaries.push('docker-compose.exe');
    } else if (isMac()) {
      binaries.push('/usr/local/bin/docker-compose');
      binaries.push('/opt/homebrew/bin/docker-compose');
    } else if (isLinux()) {
      binaries.push('/usr/bin/docker-compose');
      binaries.push('/usr/local/bin/docker-compose');
    }

    // ok, now check if one of them exists
    for (const binary of binaries) {
      // unix / mac check if file exists
      if (!isWindows() && !fs.existsSync(binary)) {
        continue;
      }

      // check if docker-compose can be executed
      try {
        await this.exec.exec(binary, ['--version']);
        // yes, return it
        return binary;
      } catch (error) {
        return undefined;
      }
    }
  }

  async startVM(extensionId: string, vmCustomizedComposeFile?: string, monitorVM?: boolean): Promise<void> {
    if (!vmCustomizedComposeFile) {
      console.log(`skip extensionId ${extensionId} start as there is no vmCustomizedComposeFile parameter`);
      return;
    }
    // is it started ? if yes do nothing
    if (this.startedContributions.get(extensionId)) {
      console.log(`skip already started VM for extension ${extensionId}`);
      return;
    }
    this.startedContributions.set(extensionId, true);

    // need to start the compose file using docker-compose

    // first, grab directory where to execute compose
    const composeDirectory = path.dirname(vmCustomizedComposeFile);

    const projectName = this.getComposeProjectNameFromId(extensionId);

    // then execute docker-compose in background
    const composeArgs = ['-p', projectName, 'up', '-d'];
    await this.execComposeCommand(composeDirectory, composeArgs);

    // if monitorVM is true, we need to monitor the VM

    if (monitorVM) {
      // wait that it's in running state (or timeout)
      await this.waitForRunningState(composeDirectory, projectName);
    }
  }

  async waitForAContainerConnection(): Promise<void> {
    let resolved = false;
    return new Promise<void>(resolve => {
      this.apiSender.receive('extensions-started', () => {
        if (resolved) {
          return;
        }
        // do we have
        try {
          this.containerRegistry.getFirstRunningConnection();
          resolve();
          resolved = true;
        } catch (error) {
          // no we don't, so we wait until we have extension started event

          this.apiSender.receive('provider-change', () => {
            if (resolved) {
              return;
            }
            try {
              this.containerRegistry.getFirstRunningConnection();
              resolve();
              resolved = true;
            } catch (error) {
              console.trace(
                'Wait for a running container engine to start. Was not able to grab a running engine. Will wait the next provider change',
                error,
              );
            }
          });
        }
      });
    });
  }

  // start the VMs of extensions supporting this flag
  async startVMs(): Promise<void> {
    // no contributions with vm, skip
    if (this.contributions.filter(contrib => contrib.vmCustomizedComposeFile).length === 0) {
      return;
    }

    // wait that we have a container connection (to execute compose stuff)
    await this.waitForAContainerConnection();

    for (const contribution of this.contributions) {
      // start if there is a compose file
      if (contribution.vmCustomizedComposeFile) {
        await this.startVM(contribution.extensionId, contribution.vmCustomizedComposeFile);
      }
    }
  }

  async isPodmanDesktopServiceAlive(composeDirectory: string, projectName: string): Promise<boolean> {
    const psCheck = ['-p', projectName, 'ps', '--format', 'json'];

    const result = await this.execComposeCommand(composeDirectory, psCheck);
    // parse the result
    let jsonResultPs;
    try {
      jsonResultPs = JSON.parse(result.stdout);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // handle syntax of docker-compose v2.21+ format
        // https://github.com/docker/compose/pull/10918
        try {
          const arrayResult = result.stdout.trim().split('\n');
          jsonResultPs = arrayResult.map(entry => JSON.parse(entry));
        } catch (error) {
          throw new Error(`unable to parse the result of the ps command ${result.stdout}. Error is ${error}`);
        }
      } else {
        throw new Error(`unable to parse the result of the ps command ${result.stdout}`);
      }
    }

    // check jsonResultPs is an array
    if (!Array.isArray(jsonResultPs)) {
      throw new Error(`unable to parse the result of the ps command ${result.stdout}. Expect array but it is not`);
    }

    // check we have the podman desktop service running
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const podmanDesktopService = jsonResultPs.find((item: any) => item.Service === 'podman-desktop-socket');

    if (!podmanDesktopService) {
      throw new Error(`unable to find the podman-desktop-socket service in the ps command ${result.stdout}`);
    }

    return podmanDesktopService.State === 'running';
  }

  // wait for at least 30s and then abort
  async waitForRunningState(composeDirectory: string, projectName: string, maxWait?: number): Promise<void> {
    // compute current date
    const startDate = new Date();
    if (!maxWait) {
      maxWait = 30 * 1000; // 30s
    }

    const endDate = new Date(startDate.getTime() + maxWait).getTime();

    let alive = false;
    try {
      alive = await this.isPodmanDesktopServiceAlive(composeDirectory, projectName);
    } catch (error) {
      console.log('error while checking if podman-desktop-socket is alive', error);
    }

    // loop until we reach the max duration
    while (new Date().getTime() < endDate && !alive) {
      try {
        alive = await this.isPodmanDesktopServiceAlive(composeDirectory, projectName);
      } catch (error) {
        console.log('error appeared while checking if podman-desktop-socket is alive', error);
      }

      // wait 1second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!alive) {
      throw new Error(`The podman-desktop-socket service is not running after ${maxWait}ms`);
    }
  }

  // must consist only of lowercase alphanumeric characters, hyphens, and underscores as well as start with a letter or number"
  getComposeProjectNameFromId(extensionId: string): string {
    // add also a prefix to avoid collision with other compose files
    return `podman-desktop-ext-${extensionId.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
  }

  async execComposeCommand(cwd: string, args: string[]): Promise<RunResult> {
    const composeBinary = await this.findComposeBinary();
    if (!composeBinary) {
      throw new Error('Unable to find docker-compose binary');
    }

    // grab current connection
    const connection = this.containerRegistry.getFirstRunningConnection();
    const providerContainerConnectionInfo = connection[0];

    const socketPath = providerContainerConnectionInfo.endpoint.socketPath;
    let DOCKER_HOST = `unix://${socketPath}`;
    if (isWindows()) {
      DOCKER_HOST = socketPath.replace('\\\\.\\pipe\\', 'npipe:////./pipe/');
    }
    const env = {
      // add DOCKER_HOST
      DOCKER_HOST: DOCKER_HOST,
    };
    return this.exec.exec(composeBinary, args, { env, cwd });
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

    // need to remove all compose containers if any
    if (matching.vmCustomizedComposeFile) {
      // need to stop the compose file using docker-compose

      // first, grab directory where to execute compose
      const composeDirectory = path.dirname(matching.vmCustomizedComposeFile);

      // then execute docker-compose
      const composeArgs = ['-p', this.getComposeProjectNameFromId(matching.extensionId), 'down'];

      // execute the down command
      await this.execComposeCommand(composeDirectory, composeArgs);

      // flag as not started
      this.startedContributions.delete(matching.extensionId);
    }

    const extensionPath = matching.storagePath;
    // delete all this directory
    await fs.promises.rm(extensionPath, { recursive: true });

    // recompute
    await this.init();

    this.apiSender.send('contribution-unregister', matching);
  }

  listContributions(): ContributionInfo[] {
    return this.contributions;
  }

  async enhanceComposeFile(
    rootDirectory: string,
    ociImageName: string,
    metadata: DockerExtensionMetadata,
  ): Promise<string | undefined> {
    // if there is a VM file, generate it
    if (metadata?.vm?.composefile) {
      // read this file
      const composeFile = path.join(rootDirectory, metadata.vm.composefile);

      if (!fs.existsSync(composeFile)) {
        throw new Error(`The file ${composeFile} does not exists.`);
      }

      const content = await fs.promises.readFile(composeFile, 'utf-8');

      // parse it as yaml file
      const composeObject = jsYaml.load(content) as ComposeObject;

      // read port number from the global port file
      const globalPortsFile = path.join(rootDirectory, '..', ContributionManager.GLOBAL_PORTS_FILE);

      let initPortRange = 10000;
      // if does not exist, create it with 10000
      if (fs.existsSync(globalPortsFile)) {
        const portNumberString = await fs.promises.readFile(globalPortsFile, 'utf-8');
        // if not a number, throw an error
        if (isNaN(parseInt(portNumberString))) {
          throw new Error(
            `The file ${globalPortsFile} does not contains a valid port number. Found ${portNumberString}`,
          );
        }
        initPortRange = parseInt(portNumberString) + 1;
      }

      // get a free port number
      const extensionPortNumber = await getFreePort(initPortRange);

      // store the current new port in the global file
      await fs.promises.writeFile(globalPortsFile, extensionPortNumber.toString());

      // socket path to expose ?
      const socketPathExposure = metadata.vm.exposes?.socket;
      const afterTransformationCompose = await this.doEnhanceCompose(
        ociImageName,
        metadata.name,
        extensionPortNumber,
        composeObject,
        socketPathExposure,
      );

      // write it back to the custom VM_COMPOSE_FILE location
      const composeFilePath = path.join(rootDirectory, ContributionManager.VM_COMPOSE_FILE);

      // check that the directory exists
      const composeDirectory = path.dirname(composeFilePath);
      if (!fs.existsSync(composeDirectory)) {
        await fs.promises.mkdir(composeDirectory);
      }

      if (socketPathExposure) {
        // write the port in the file
        const portFile = path.join(rootDirectory, ContributionManager.VM_PORTNUMBER_FILE);
        // ensure parent directory exists

        await fs.promises.writeFile(portFile, extensionPortNumber.toString());
      }

      await fs.promises.writeFile(composeFilePath, jsYaml.dump(afterTransformationCompose, { lineWidth: 1000 }));
      return composeFilePath;
    }
  }

  // enhance the compose file with different things like:
  // - replace ${DESKTOP_PLUGIN_IMAGE} by the ociImageName
  // - add a service to expose the socket
  // - add a volume to expose the socket
  // - add custom labels on top of extensions
  async doEnhanceCompose(
    ociImageName: string,
    extensionName: string,
    listeningPortNumber: number,
    composeObject: ComposeObject,
    socketPath?: string,
  ): Promise<ComposeObject> {
    // ok, first, we need to replace the constant of the image by the image name
    // need to replace ${DESKTOP_PLUGIN_IMAGE} in the images field by the ociImageName
    const services = composeObject?.services || {};

    const PODMAN_DESKTOP_SOCKET_SERVICE = 'podman-desktop-socket';

    const GUEST_SERVICES_DIRECTORY = '/run/guest-services';

    let command = `-c "chmod -R 777 ${GUEST_SERVICES_DIRECTORY}`;
    let ports;
    let exposureCommand = '';
    if (socketPath) {
      exposureCommand = ` && socat TCP-LISTEN:${listeningPortNumber},reuseaddr,fork UNIX-CLIENT:${GUEST_SERVICES_DIRECTORY}/${socketPath}`;
      ports = [`${listeningPortNumber}:${listeningPortNumber}`];
    }
    // add  sleep instruction
    command = `${command}${exposureCommand} && sleep infinity"`;

    // add a 'podman-desktop-socket' to expose the service
    services[PODMAN_DESKTOP_SOCKET_SERVICE] = {
      image: 'alpine/socat',
      entrypoint: '/bin/sh',
      command,
      volumes: ['/run/guest-services'],
      ports,
    };

    for (const serviceKey of Object.keys(services)) {
      const service = services[serviceKey];

      // add custom labels
      service.labels = service.labels ?? {};
      service.labels['io.podman_desktop.PodmanDesktop.extension'] = 'true';
      service.labels['io.podman_desktop.PodmanDesktop.extensionName'] = extensionName;

      // then for compatibility
      service.labels['com.docker.desktop.extension'] = 'true';
      service.labels['com.docker.desktop.extension.name'] = extensionName;

      if (service?.image === '${DESKTOP_PLUGIN_IMAGE}') {
        service.image = ociImageName;

        // flag this container as being the VM service label
        service.labels['io.podman_desktop.PodmanDesktop.vm-service'] = 'true';
      }

      // apply restart policy if not specified
      service.deploy = service.deploy ?? {};
      service.deploy.restart_policy = service.deploy.restart_policy ?? {};
      if (!service.deploy.restart_policy.condition) {
        service.deploy.restart_policy.condition = 'always';
      }

      // add the volume from the podman-desktop-socket (only if not inside the service itself)
      if (serviceKey !== PODMAN_DESKTOP_SOCKET_SERVICE) {
        service.volumes_from = service.volumes_from ?? [];
        service.volumes_from.push(PODMAN_DESKTOP_SOCKET_SERVICE);
      }
    }
    return composeObject;
  }
}
