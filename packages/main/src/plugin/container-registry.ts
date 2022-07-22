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

import type * as containerDesktopAPI from '@tmpwip/extension-api';
import { Disposable } from './types/disposable';
import Dockerode from 'dockerode';
import type { ContainerCreateOptions, ContainerInfo } from './api/container-info';
import type { ImageInfo } from './api/image-info';
import type { ImageInspectInfo } from './api/image-inspect-info';
import type { ProviderContainerConnectionInfo } from './api/provider-info';
import type { ImageRegistry } from './image-registry';
import type { PullEvent } from './api/pull-event';
import type { Telemetry } from './telemetry/telemetry';
import * as crypto from 'node:crypto';
const tar: { pack: (dir: string) => NodeJS.ReadableStream } = require('tar-fs');
import { EventEmitter } from 'node:events';
export interface InternalContainerProvider {
  name: string;
  id: string;
  connection: containerDesktopAPI.ContainerProviderConnection;
  // api not there if status is stopped
  api?: Dockerode;
}

export interface InternalContainerProviderLifecycle {
  internal: containerDesktopAPI.ProviderLifecycle;
  status: string;
}

interface JSONEvent {
  type: string;
  status: string;
  id: string;
  Type?: string;
}

export class ContainerProviderRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private apiSender: any, private imageRegistry: ImageRegistry, private telemetryService: Telemetry) {}

  private containerProviders: Map<string, containerDesktopAPI.ContainerProviderConnection> = new Map();
  private internalProviders: Map<string, InternalContainerProvider> = new Map();

  handleEvents(api: Dockerode) {
    const eventEmitter = new EventEmitter();

    eventEmitter.on('event', (jsonEvent: JSONEvent) => {
      console.log('event is', jsonEvent);
      if (jsonEvent.status === 'stop') {
        // need to notify that a container has been stopped
        this.apiSender.send('container-stopped-event', jsonEvent.id);
      } else if (jsonEvent.status === 'start') {
        // need to notify that a container has been started
        this.apiSender.send('container-started-event', jsonEvent.id);
      } else if (jsonEvent.status === 'destroy') {
        // need to notify that a container has been destroyed
        this.apiSender.send('container-stopped-event', jsonEvent.id);
      } else if (jsonEvent.status === 'remove' && jsonEvent?.Type === 'container') {
        this.apiSender.send('container-removed-event', jsonEvent.id);
      } else if (jsonEvent.status === 'pull' && jsonEvent?.Type === 'image') {
        // need to notify that image are being pulled
        this.apiSender.send('image-pull-event', jsonEvent.id);
      } else if (jsonEvent.status === 'tag' && jsonEvent?.Type === 'image') {
        // need to notify that image are being tagged
        this.apiSender.send('image-tag-event', jsonEvent.id);
      } else if (jsonEvent.status === 'untag' && jsonEvent?.Type === 'image') {
        // need to notify that image are being untagged
        this.apiSender.send('image-untag-event', jsonEvent.id);
      } else if (jsonEvent.status === 'remove' && jsonEvent?.Type === 'image') {
        // need to notify that image are being pulled
        this.apiSender.send('image-remove-event', jsonEvent.id);
      } else if (jsonEvent.status === 'build' && jsonEvent?.Type === 'image') {
        // need to notify that image are being pulled
        this.apiSender.send('image-build-event', jsonEvent.id);
      }
    });

    api.getEvents((err, stream) => {
      if (err) {
        console.log('error is', err);
      }
      let content = '';
      stream?.on('data', data => {
        const jsonObjects = (content + data).toString().split('\n');
        for (let i = 0; i < jsonObjects.length - 1; ++i) {
          try {
            const event = JSON.parse(jsonObjects[i]);
            eventEmitter.emit('event', event);
          } catch (err) {
            console.error('Unable to parse event', err);
            console.error('current data is', data.toString());
            console.error('previous content is', content);
          }
          content = '';
        }
        // keep latest partial json object
        content += jsonObjects[jsonObjects.length - 1];
      });
    });
  }

  registerContainerConnection(
    provider: containerDesktopAPI.Provider,
    containerProviderConnection: containerDesktopAPI.ContainerProviderConnection,
  ): Disposable {
    const providerName = containerProviderConnection.name;
    const id = `${provider.id}.${providerName}`;
    this.containerProviders.set(id, containerProviderConnection);
    this.telemetryService.track('registerContainerProviderConnection', {
      name: containerProviderConnection.name,
      type: containerProviderConnection.type,
      total: this.containerProviders.size,
    });

    const internalProvider: InternalContainerProvider = {
      id,
      name: provider.name,
      connection: containerProviderConnection,
    };
    let previousStatus = containerProviderConnection.status();

    if (containerProviderConnection.status() === 'started') {
      internalProvider.api = new Dockerode({ socketPath: containerProviderConnection.endpoint.socketPath });
      this.handleEvents(internalProvider.api);
    }

    // track the status of the provider
    const timer = setInterval(async () => {
      const newStatus = containerProviderConnection.status();
      if (newStatus !== previousStatus) {
        if (newStatus === 'stopped') {
          internalProvider.api = undefined;
          this.apiSender.send('provider-change', {});
        }
        if (newStatus === 'started') {
          internalProvider.api = new Dockerode({ socketPath: containerProviderConnection.endpoint.socketPath });
          this.handleEvents(internalProvider.api);
          this.internalProviders.set(id, internalProvider);
          this.apiSender.send('provider-change', {});
        }
        previousStatus = newStatus;
      }
    }, 2000);

    this.internalProviders.set(id, internalProvider);
    this.apiSender.send('provider-change', {});

    // listen to events

    return Disposable.create(() => {
      clearInterval(timer);
      this.internalProviders.delete(id);
      this.containerProviders.delete(id);
      this.apiSender.send('provider-change', {});
    });
  }

  async listContainers(): Promise<ContainerInfo[]> {
    const containers = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          if (!provider.api) {
            return [];
          }
          const containers = await provider.api.listContainers({ all: true });
          return containers.map(container => {
            const containerInfo: ContainerInfo = { ...container, engineName: provider.name, engineId: provider.id };
            return containerInfo;
          });
        } catch (error) {
          console.log('error in engine', provider.name, error);
          return [];
        }
      }),
    );
    const flatttenedContainers = containers.flat();
    this.telemetryService.track('listContainers', { total: flatttenedContainers.length });
    return flatttenedContainers;
  }

  async listImages(): Promise<ImageInfo[]> {
    const images = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          if (!provider.api) {
            return [];
          }
          const images = await provider.api.listImages({ all: false });
          return images.map(image => {
            const imageInfo: ImageInfo = { ...image, engineName: provider.name, engineId: provider.id };
            return imageInfo;
          });
        } catch (error) {
          console.log('error in engine', provider.name, error);
          return [];
        }
      }),
    );
    const flatttenedImages = images.flat();
    this.telemetryService.track('listImages', { total: flatttenedImages.length });

    return flatttenedImages;
  }

  protected getMatchingEngine(engineId: string): Dockerode {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineId);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    if (!engine.api) {
      throw new Error('no running provider for the matching container');
    }
    return engine.api;
  }

  public getFirstRunningConnection(): [ProviderContainerConnectionInfo, Dockerode] {
    // grab all connections
    const matchingContainerProviders = Array.from(this.internalProviders.entries()).filter(
      containerProvider => containerProvider[1].api,
    );
    if (!matchingContainerProviders || matchingContainerProviders.length === 0) {
      throw new Error('No provider with a running engine');
    }

    const matchingConnection = matchingContainerProviders[0];
    if (!matchingConnection[1].api) {
      throw new Error('No provider with a running engine');
    }

    const matchingConnectionName = matchingConnection[0];
    const matchingConnectionObject = this.containerProviders.get(matchingConnectionName);
    if (!matchingConnectionObject) {
      throw new Error('Unable to find a running engine');
    }

    return [
      {
        name: matchingConnectionObject.name,
        endpoint: {
          socketPath: matchingConnectionObject.endpoint.socketPath,
        },
      } as ProviderContainerConnectionInfo,
      matchingConnection[1].api,
    ];
  }

  protected getMatchingEngineFromConnection(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): Dockerode {
    // grab all connections
    const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
      containerProvider =>
        containerProvider.connection.endpoint.socketPath === providerContainerConnectionInfo.endpoint.socketPath,
    );
    if (!matchingContainerProvider || !matchingContainerProvider.api) {
      throw new Error('No provider with a running engine');
    }
    if (!matchingContainerProvider.api) {
      throw new Error('no running provider for the matching container');
    }
    return matchingContainerProvider.api;
  }

  protected getMatchingContainer(engineId: string, id: string): Dockerode.Container {
    return this.getMatchingEngine(engineId).getContainer(id);
  }

  protected getMatchingImage(engineId: string, imageId: string): Dockerode.Image {
    return this.getMatchingEngine(engineId).getImage(imageId);
  }

  async stopContainer(engineId: string, id: string): Promise<void> {
    this.telemetryService.track('stopContainer');
    return this.getMatchingContainer(engineId, id).stop();
  }

  async deleteImage(engineId: string, id: string): Promise<void> {
    this.telemetryService.track('deleteImage');
    // use force to delete it even it is running
    return this.getMatchingImage(engineId, id).remove();
  }

  getImageName(inspectInfo: Dockerode.ImageInspectInfo) {
    const tags = inspectInfo.RepoTags;
    if (!tags) {
      throw new Error('Cannot push an image without a tag');
    }
    // take the first tag
    return tags[0];
  }

  async pushImage(engineId: string, imageTag: string, callback: (name: string, data: string) => void): Promise<void> {
    const engine = this.getMatchingEngine(engineId);
    const image = await engine.getImage(imageTag);
    this.telemetryService.track('pushImage', { imageName: this.getImageHash(imageTag) });
    const authconfig = this.imageRegistry.getAuthconfigForImage(imageTag);
    const pushStream = await image.push({ authconfig });
    pushStream.on('end', () => {
      callback('end', '');
    });
    let firstMessage = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pushStream.on('data', (chunk: any) => {
      if (firstMessage) {
        firstMessage = false;
        callback('first-message', '');
      }
      callback('data', chunk.toString('utf-8'));
    });
  }
  async pullImage(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
    imageName: string,
    callback: (event: PullEvent) => void,
  ): Promise<void> {
    this.telemetryService.track('pullImage', { imageName: this.getImageHash(imageName) });
    const authconfig = this.imageRegistry.getAuthconfigForImage(imageName);
    const matchingEngine = this.getMatchingEngineFromConnection(providerContainerConnectionInfo);
    const pullStream = await matchingEngine.pull(imageName, {
      authconfig,
    });
    // eslint-disable-next-line @typescript-eslint/ban-types
    let resolve: () => void;
    let reject: (err: Error) => void;
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // eslint-disable-next-line @typescript-eslint/ban-types
    function onFinished(err: Error | null) {
      if (err) {
        return reject(err);
      }
      resolve();
    }

    function onProgress(event: PullEvent) {
      callback(event);
    }
    matchingEngine.modem.followProgress(pullStream, onFinished, onProgress);

    return promise;
  }

  getImageHash(imageName: string): string {
    return crypto.createHash('sha512').update(imageName).digest('hex');
  }

  async deleteContainer(engineId: string, id: string): Promise<void> {
    this.telemetryService.track('deleteContainer');
    // use force to delete it even it is running
    return this.getMatchingContainer(engineId, id).remove({ force: true });
  }

  async startContainer(engineId: string, id: string): Promise<void> {
    this.telemetryService.track('startContainer');
    return this.getMatchingContainer(engineId, id).start();
  }

  async restartContainer(engineId: string, id: string): Promise<void> {
    this.telemetryService.track('restartContainer');
    return this.getMatchingContainer(engineId, id).restart();
  }

  async logsContainer(engineId: string, id: string, callback: (name: string, data: string) => void): Promise<void> {
    this.telemetryService.track('logsContainer');
    let firstMessage = true;
    const container = this.getMatchingContainer(engineId, id);
    const containerStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    containerStream.on('end', () => {
      callback('end', '');
    });

    containerStream.on('data', chunk => {
      if (firstMessage) {
        firstMessage = false;
        callback('first-message', '');
      }
      callback('data', chunk.toString('utf-8'));
    });
  }

  async shellInContainer(
    engineId: string,
    id: string,
    onData: (data: Buffer) => void,
  ): Promise<(param: string) => void> {
    this.telemetryService.track('shellInContainer');
    const exec = await this.getMatchingContainer(engineId, id).exec({
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['/bin/sh'],
      Tty: true,
    });

    const execStream = await exec.start({
      Tty: true,
      stdin: true,
      hijack: true,
    });

    execStream.on('data', chunk => {
      onData(chunk.toString('utf-8'));
    });

    const writeFunction = (param: string) => {
      execStream.write(param);
    };

    return writeFunction;
  }

  async createAndStartContainer(engineId: string, options: ContainerCreateOptions): Promise<void> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineId);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    if (!engine.api) {
      throw new Error('no running provider for the matching container');
    }
    this.telemetryService.track('createAndStartContainer');
    const container = await engine.api.createContainer(options);
    return container.start();
  }

  async getImageInspect(engineId: string, id: string): Promise<ImageInspectInfo> {
    // need to find the container engine of the container
    const provider = this.internalProviders.get(engineId);
    if (!provider) {
      throw new Error('no engine matching this container');
    }
    if (!provider.api) {
      throw new Error('no running provider for the matching container');
    }
    const imageObject = provider.api.getImage(id);
    const imageInspect = await imageObject.inspect();
    return {
      engineName: provider.name,
      engineId: provider.id,
      ...imageInspect,
    };
  }

  async buildImage(
    containerBuildContextDirectory: string,
    relativeContainerfilePath: string,
    imageName: string,
    selectedProvider: ProviderContainerConnectionInfo,
    eventCollect: (eventName: 'stream' | 'error', data: string) => void,
  ): Promise<unknown> {
    this.telemetryService.track('buildImage');
    // grab all connections
    const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
      containerProvider => containerProvider.connection.endpoint.socketPath === selectedProvider.endpoint.socketPath,
    );
    if (!matchingContainerProvider || !matchingContainerProvider.api) {
      throw new Error('No provider with a running engine');
    }
    const tarStream = tar.pack(containerBuildContextDirectory);
    let streamingPromise;
    try {
      streamingPromise = await matchingContainerProvider.api.buildImage(tarStream, {
        dockerfile: relativeContainerfilePath,
        t: imageName,
      });
    } catch (error) {
      console.log('error in buildImage', error);
      throw error;
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    let resolve: (output: {}) => void;
    let reject: (err: Error) => void;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // eslint-disable-next-line @typescript-eslint/ban-types
    function onFinished(err: Error | null, output: {}) {
      if (err) {
        return reject(err);
      }
      resolve(output);
    }

    function onProgress(event: {
      stream?: string;
      status?: string;
      progress?: string;
      error?: string;
      errorDetails?: { message?: string };
    }) {
      if (event.stream) {
        eventCollect('stream', event.stream);
      } else if (event.error) {
        eventCollect('error', event.error);
      }
    }

    matchingContainerProvider.api.modem.followProgress(streamingPromise, onFinished, onProgress);
    return promise;
  }
}
