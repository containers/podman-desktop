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
import type { ProviderInfo } from './api/provider-info';
import type { TrayMenuRegistry } from './tray-menu-registry';

const tar: { pack: (dir: string) => NodeJS.ReadableStream } = require('tar-fs');

export interface InternalContainerProvider {
  name: string;
  connection: string;
  api: Dockerode;
}

export interface InternalContainerProviderLifecycle {
  internal: containerDesktopAPI.ContainerProviderLifecycle;
  status: string;
}

export class ContainerProviderRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private apiSender: any, private readonly trayMenuRegistry: TrayMenuRegistry) {}

  private providers: Map<string, containerDesktopAPI.ContainerProvider> = new Map();
  private providerLifecycles: Map<string, InternalContainerProviderLifecycle> = new Map();
  private internalProviders: Map<string, InternalContainerProvider> = new Map();

  async registerContainerProviderLifecycle(
    providerLifecycle: containerDesktopAPI.ContainerProviderLifecycle,
  ): Promise<Disposable> {
    const providerName = providerLifecycle.provideName();
    const internalProviderLifecycle = {
      internal: providerLifecycle,
      status: providerLifecycle.status(),
    };
    this.providerLifecycles.set(providerName, internalProviderLifecycle);
    this.trayMenuRegistry.addContainerProviderLifecycle(providerName, providerLifecycle);
    return Disposable.create(() => {
      this.internalProviders.delete(providerName);
      this.providers.delete(providerName);
      this.apiSender.send('provider-lifecycle-change', {});
      this.trayMenuRegistry.removeContainerProviderLifecycle(providerName);
    });
  }

  async registerContainerProvider(provider: containerDesktopAPI.ContainerProvider): Promise<Disposable> {
    const providerName = provider.provideName();
    const connection = await provider.provideConnection();

    this.providers.set(providerName, provider);

    const internalProvider: InternalContainerProvider = {
      name: providerName,
      connection,
      api: new Dockerode({ socketPath: connection }),
    };

    this.internalProviders.set(providerName, internalProvider);
    this.apiSender.send('provider-change', {});

    // listen to events
    internalProvider.api.getEvents((err, stream) => {
      console.log('error is', err);
      stream?.on('data', data => {
        const evt = JSON.parse(data.toString());
        console.log('event is', evt);
        if (evt.status === 'stop') {
          // need to notify that a container has been stopped
          this.apiSender.send('container-stopped-event', evt.id);
        } else if (evt.status === 'start') {
          // need to notify that a container has been started
          this.apiSender.send('container-started-event', evt.id);
        } else if (evt.status === 'destroy') {
          // need to notify that a container has been destroyed
          this.apiSender.send('container-stopped-event', evt.id);
        } else if (evt.status === 'remove' && evt?.Type === 'container') {
          this.apiSender.send('container-removed-event', evt.id);
        } else if (evt.status === 'pull' && evt?.Type === 'image') {
          // need to notify that image are being pulled
          this.apiSender.send('image-pull-event', evt.id);
        } else if (evt.status === 'remove' && evt?.Type === 'image') {
          // need to notify that image are being pulled
          this.apiSender.send('image-remove-event', evt.id);
        } else if (evt.status === 'build' && evt?.Type === 'image') {
          // need to notify that image are being pulled
          this.apiSender.send('image-build-event', evt.id);
        }
      });
    });

    return Disposable.create(() => {
      this.internalProviders.delete(providerName);
      this.providers.delete(providerName);
      this.apiSender.send('provider-change', {});
    });
  }

  async listContainers(): Promise<ContainerInfo[]> {
    const containers = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          const containers = await provider.api.listContainers({ all: true });
          return containers.map(container => {
            const containerInfo: ContainerInfo = { ...container, engine: provider.name };
            return containerInfo;
          });
        } catch (error) {
          console.log('error in engine', provider.name, error);
          return [];
        }
      }),
    );
    const flatttenedContainers = containers.flat();
    return flatttenedContainers;
  }

  async listImages(): Promise<ImageInfo[]> {
    const images = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          const images = await provider.api.listImages({ all: false });
          return images.map(image => {
            const imageInfo: ImageInfo = { ...image, engine: provider.name };
            return imageInfo;
          });
        } catch (error) {
          console.log('error in engine', provider.name, error);
          return [];
        }
      }),
    );
    const flatttenedImages = images.flat();
    return flatttenedImages;
  }

  async startProviderLifecycle(providerName: string): Promise<void> {
    // need to find the container engine of the container
    const providerLifecycle = this.providerLifecycles.get(providerName);
    if (!providerLifecycle) {
      throw new Error('no provider matching this providerName');
    }
    await providerLifecycle.internal.start();
    this.apiSender.send('provider-lifecycle-change', {});
  }

  async stopProviderLifecycle(providerName: string): Promise<void> {
    // need to find the container engine of the container
    const providerLifecycle = this.providerLifecycles.get(providerName);
    if (!providerLifecycle) {
      throw new Error('no provider matching this providerName');
    }
    await providerLifecycle.internal.stop();
    this.apiSender.send('provider-lifecycle-change', {});
  }

  async stopContainer(engineName: string, id: string): Promise<void> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineName);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    return engine.api.getContainer(id).stop();
  }

  async startContainer(engineName: string, id: string): Promise<void> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineName);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    return engine.api.getContainer(id).start();
  }

  async restartContainer(engineName: string, id: string): Promise<void> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineName);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    return engine.api.getContainer(id).restart();
  }

  async createAndStartContainer(engineName: string, options: ContainerCreateOptions): Promise<void> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineName);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    const container = await engine.api.createContainer(options);
    return container.start();
  }

  async getImageInspect(engineName: string, id: string): Promise<ImageInspectInfo> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineName);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    const imageObject = engine.api.getImage(id);
    const imageInspect = await imageObject.inspect();
    return {
      engine: engineName,
      ...imageInspect,
    };
  }

  async buildImage(
    rootDirectory: string,
    imageName: string,
    eventCollect: (eventName: string, data: string) => void,
  ): Promise<unknown> {
    console.log('building image', imageName, 'from rootDirectory', rootDirectory);
    const firstProvider = Array.from(this.internalProviders.values())[0];

    // const firstProvider = this.internalProviders.get('Lima')!;

    console.log('building using provider', firstProvider.name);

    const tarStream = tar.pack(rootDirectory);
    const streamingPromise = await firstProvider.api.buildImage(tarStream, { t: imageName });
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

    function onProgress(event: { stream?: string; status?: string; progress?: string }) {
      if (event.stream) {
        eventCollect('stream', event.stream);
      }
      // console.log('status=>',event.status);
      // console.log('progress=>',event.progress);
    }

    firstProvider.api.modem.followProgress(streamingPromise, onFinished, onProgress);
    return promise;
  }

  async getProviderInfos(): Promise<ProviderInfo[]> {
    // get unique keys
    const lifecycleKeys = Array.from(this.providerLifecycles.keys());
    const providerKeys = Array.from(this.providers.keys());

    // get unique set
    const uniqueKeys = Array.from(new Set([...lifecycleKeys, ...providerKeys]));

    return uniqueKeys.map(key => {
      // matching provider ?
      const internalProvider = this.internalProviders.get(key);
      const internalProviderLifecycle = this.providerLifecycles.get(key);

      let lifecycle;
      if (internalProviderLifecycle) {
        lifecycle = {
          status: internalProviderLifecycle.status,
        };
      }

      return {
        name: key,
        connection: internalProvider?.connection,
        lifecycle,
      };
    });
  }
}
