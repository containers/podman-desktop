/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type * as containerDesktopAPI from '@podman-desktop/api';
import { Disposable } from './types/disposable.js';
import type { ContainerAttachOptions } from 'dockerode';
import Dockerode from 'dockerode';
import StreamValues from 'stream-json/streamers/StreamValues.js';
import type {
  ContainerCreateOptions,
  ContainerInfo,
  ContainerPortInfo,
  SimpleContainerInfo,
  VolumeCreateOptions,
} from './api/container-info.js';
import type { ImageInfo } from './api/image-info.js';
import type { PodInfo, PodInspectInfo } from './api/pod-info.js';
import type { ImageInspectInfo } from './api/image-inspect-info.js';
import type { ProviderContainerConnectionInfo } from './api/provider-info.js';
import type { ImageRegistry } from './image-registry.js';
import type { PullEvent } from './api/pull-event.js';
import type { Telemetry } from './telemetry/telemetry.js';
import * as crypto from 'node:crypto';
import moment from 'moment';
const tar: { pack: (dir: string) => NodeJS.ReadableStream } = require('tar-fs');
import { EventEmitter } from 'node:events';
import type { ContainerInspectInfo } from './api/container-inspect-info.js';
import type { HistoryInfo } from './api/history-info.js';
import type {
  LibPod,
  PlayKubeInfo,
  PodCreateOptions,
  ContainerCreateOptions as PodmanContainerCreateOptions,
  PodInfo as LibpodPodInfo,
} from './dockerode/libpod-dockerode.js';
import { LibpodDockerode } from './dockerode/libpod-dockerode.js';
import type { ContainerStatsInfo } from './api/container-stats-info.js';
import type { VolumeInfo, VolumeInspectInfo, VolumeListInfo } from './api/volume-info.js';
import type { NetworkInspectInfo } from './api/network-info.js';
import type { Event } from './events/emitter.js';
import { Emitter } from './events/emitter.js';
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { ApiSenderType } from './api.js';
import { type Stream, Writable } from 'node:stream';
import datejs from 'date.js';
import { isWindows } from '../util.js';

export interface InternalContainerProvider {
  name: string;
  id: string;
  connection: containerDesktopAPI.ContainerProviderConnection;
  // api not there if status is stopped
  api?: Dockerode;
  libpodApi?: LibPod;
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
  private readonly _onEvent = new Emitter<JSONEvent>();
  readonly onEvent: Event<JSONEvent> = this._onEvent.event;

  constructor(
    private apiSender: ApiSenderType,
    private imageRegistry: ImageRegistry,
    private telemetryService: Telemetry,
  ) {
    const libPodDockerode = new LibpodDockerode();
    libPodDockerode.enhancePrototypeWithLibPod();

    // setup listeners
    this.setupListeners();
  }

  protected containerProviders: Map<string, containerDesktopAPI.ContainerProviderConnection> = new Map();
  protected internalProviders: Map<string, InternalContainerProvider> = new Map();

  // map of streams per container id
  protected streamsPerContainerId: Map<string, NodeJS.ReadWriteStream> = new Map();
  protected streamsOutputPerContainerId: Map<string, Buffer[]> = new Map();

  handleEvents(api: Dockerode) {
    const eventEmitter = new EventEmitter();

    eventEmitter.on('event', (jsonEvent: JSONEvent) => {
      console.log('event is', jsonEvent);
      this._onEvent.fire(jsonEvent);
      if (jsonEvent.status === 'stop' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been stopped
        this.apiSender.send('container-stopped-event', jsonEvent.id);
      } else if (jsonEvent.status === 'init' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been started
        this.apiSender.send('container-init-event', jsonEvent.id);
      } else if (jsonEvent.status === 'start' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been started
        this.apiSender.send('container-started-event', jsonEvent.id);
      } else if (jsonEvent.status === 'destroy' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been destroyed
        this.apiSender.send('container-stopped-event', jsonEvent.id);
      } else if (jsonEvent.status === 'die' && jsonEvent?.Type === 'container') {
        this.apiSender.send('container-die-event', jsonEvent.id);
      } else if (jsonEvent.status === 'kill' && jsonEvent?.Type === 'container') {
        this.apiSender.send('container-kill-event', jsonEvent.id);
      } else if (jsonEvent?.Type === 'pod') {
        this.apiSender.send('pod-event');
      } else if (jsonEvent?.Type === 'volume') {
        this.apiSender.send('volume-event');
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
      } else if (jsonEvent.status === 'delete' && jsonEvent?.Type === 'image') {
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
      const pipeline = stream?.pipe(StreamValues.withParser());
      pipeline?.on('error', error => {
        console.error('Error while parsing events', error);
      });
      pipeline?.on('data', data => {
        if (data?.value !== undefined) {
          eventEmitter.emit('event', data.value);
        }
      });
    });
  }

  setupListeners() {
    const cleanStreamMap = (containerId: string) => {
      this.streamsPerContainerId.delete(containerId);
      this.streamsOutputPerContainerId.delete(containerId);
    };

    this.apiSender.receive('container-stopped-event', (containerId: string) => {
      cleanStreamMap(containerId);
    });

    this.apiSender.receive('container-die-event', (containerId: string) => {
      cleanStreamMap(containerId);
    });

    this.apiSender.receive('container-kill-event', (containerId: string) => {
      cleanStreamMap(containerId);
    });

    this.apiSender.receive('container-removed-event', (containerId: string) => {
      cleanStreamMap(containerId);
    });
  }

  reconnectContainerProviders() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const provider of this.internalProviders.values()) {
      if (provider.api) this.setupConnectionAPI(provider, provider.connection);
    }
  }

  setupConnectionAPI(
    internalProvider: InternalContainerProvider,
    containerProviderConnection: containerDesktopAPI.ContainerProviderConnection,
  ) {
    internalProvider.api = new Dockerode({ socketPath: containerProviderConnection.endpoint.socketPath });
    if (containerProviderConnection.type === 'podman') {
      internalProvider.libpodApi = internalProvider.api as unknown as LibPod;
    }
    this.handleEvents(internalProvider.api);
    this.apiSender.send('provider-change', {});
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
      this.setupConnectionAPI(internalProvider, containerProviderConnection);
    }

    // track the status of the provider
    const timer = setInterval(() => {
      const newStatus = containerProviderConnection.status();
      if (newStatus !== previousStatus) {
        if (newStatus === 'stopped') {
          internalProvider.api = undefined;
          internalProvider.libpodApi = undefined;
          this.apiSender.send('provider-change', {});
        }
        if (newStatus === 'started') {
          this.setupConnectionAPI(internalProvider, containerProviderConnection);
          this.internalProviders.set(id, internalProvider);
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

  // do not use inspect information
  async listSimpleContainers(): Promise<SimpleContainerInfo[]> {
    let telemetryOptions = {};
    const containers = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          const providerApi = provider.api;
          if (!providerApi) {
            return [];
          }

          const containers = await providerApi.listContainers({ all: true });
          return Promise.all(
            containers.map(async container => {
              const containerInfo: SimpleContainerInfo = {
                ...container,
                engineName: provider.name,
                engineId: provider.id,
                engineType: provider.connection.type,
              };
              return containerInfo;
            }),
          );
        } catch (error) {
          console.log('error in engine', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flatttenedContainers = containers.flat();
    this.telemetryService.track(
      'listSimpleContainers',
      Object.assign({ total: flatttenedContainers.length }, telemetryOptions),
    );

    return flatttenedContainers;
  }

  // listSimpleContainers by matching label and key
  async listSimpleContainersByLabel(label: string, key: string): Promise<SimpleContainerInfo[]> {
    // Get all the containers using listSimpleContainers
    const containers = await this.listSimpleContainers();

    // Find all the containers that match the label + key
    return containers.filter(container => {
      const labels = container.Labels;
      return labels && labels[label] === key;
    });
  }

  async listContainers(): Promise<ContainerInfo[]> {
    let telemetryOptions = {};
    const containers = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          const providerApi = provider.api;
          if (!providerApi) {
            return [];
          }

          // local type used to convert Podman containers to Dockerode containers
          interface CompatContainerInfo {
            Id: string;
            Names: string[];
            Image: string;
            ImageID: string;
            Command?: string;
            Created: number;
            Ports: ContainerPortInfo[];
            Labels: { [label: string]: string };
            State: string;
            StartedAt?: string;
            Status?: string;
          }

          // if we have a libpod API, grab containers using Podman API
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let containers: CompatContainerInfo[] = [];
          if (provider.libpodApi) {
            const podmanContainers = await provider.libpodApi.listPodmanContainers({ all: true });

            // convert Podman containers to Dockerode containers
            containers = podmanContainers.map(podmanContainer => {
              // get labels or nothing
              const Labels: { [label: string]: string } = {};
              if (podmanContainer.Labels) {
                // copy all labels
                for (const label of Object.keys(podmanContainer.Labels)) {
                  Labels[label] = podmanContainer.Labels[label];
                }
              }

              // get labels or nothing
              let Ports: ContainerPortInfo[] = [];

              if (podmanContainer.Ports) {
                Ports = podmanContainer.Ports.map(port => {
                  return {
                    PrivatePort: port.container_port,
                    PublicPort: port.host_port,
                    Type: port.protocol,
                    IP: port.host_ip,
                  };
                });
              }

              // convert StartedAt which is a unix timestamp to a iso8601 date
              const StartedAt = moment.unix(podmanContainer.StartedAt).toISOString();
              return {
                Id: podmanContainer.Id,
                Names: podmanContainer.Names.map(name => `/${name}`),
                ImageID: `sha256:${podmanContainer.ImageID}`,
                Image: podmanContainer.Image,
                // convert to unix timestamp
                Created: moment(podmanContainer.Created).unix(),
                State: podmanContainer.State,
                StartedAt,
                Command: podmanContainer.Command?.length > 0 ? podmanContainer.Command[0] : undefined,
                Labels,
                Ports,
              };
            });
          } else {
            containers = await providerApi.listContainers({ all: true });
            containers.forEach(container => {
              let StartedAt;
              if (container.State.toUpperCase() === 'RUNNING' && !container.StartedAt && container.Status) {
                // convert the Status like "Up 2 minutes" to a date
                // remove up from the status
                const status = container.Status.replace('Up ', '');
                // add ago at the end
                const statusWithAgo = status.concat(' ago');

                try {
                  StartedAt = new Date(datejs(statusWithAgo)).toISOString();
                } catch (error) {
                  StartedAt = '';
                  telemetryOptions = { error: error };
                }

                // update the StartedAt value
                container.StartedAt = StartedAt;
              }
            });
          }

          let pods: LibpodPodInfo[] = [];
          if (provider.libpodApi) {
            pods = await provider.libpodApi.listPods();
          }

          return Promise.all(
            containers.map(async container => {
              // do we have a matching pod for this container ?
              let pod;
              const matchingPod = pods.find(pod =>
                pod.Containers.find(containerOfPod => containerOfPod.Id === container.Id),
              );
              if (matchingPod) {
                pod = {
                  id: matchingPod.Id,
                  name: matchingPod.Name,
                  status: matchingPod.Status,
                  engineId: provider.id,
                };
              }
              const containerInfo: ContainerInfo = {
                ...container,
                pod,
                engineName: provider.name,
                engineId: provider.id,
                engineType: provider.connection.type,
                StartedAt: container.StartedAt || '',
                Status: container.Status,
              };
              return containerInfo;
            }),
          );
        } catch (error) {
          console.log('error in engine', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flatttenedContainers = containers.flat();
    this.telemetryService.track(
      'listContainers',
      Object.assign({ total: flatttenedContainers.length }, telemetryOptions),
    );

    return flatttenedContainers;
  }

  async listImages(): Promise<ImageInfo[]> {
    let telemetryOptions = {};
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
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flatttenedImages = images.flat();
    this.telemetryService.track('listImages', Object.assign({ total: flatttenedImages.length }, telemetryOptions));

    return flatttenedImages;
  }

  async pruneImages(engineId: string): Promise<void> {
    // We have to use two different API calls for pruning images, because the Podman API does not respect the 'dangling' filter
    // and instead uses 'all' and 'external'. See: https://github.com/containers/podman/issues/11576
    // so for Dockerode we'll have to call pruneImages with the 'dangling' filter, and for Podman we'll have to call pruneImages

    // PODMAN:
    // Have to use podman API directly for pruning images
    // TODO: Remove this once the Podman API respects the 'dangling' filter: https://github.com/containers/podman/issues/17614
    let telemetryOptions = {};
    try {
      const provider = this.internalProviders.get(engineId);
      if (provider?.libpodApi) {
        await this.getMatchingPodmanEngine(engineId).pruneAllImages(true);
        return;
      }

      // DOCKER:
      // Return Promise<void> for this call, because Dockerode does not return anything
      await this.getMatchingEngine(engineId).pruneImages({ filters: { dangling: { false: true } } });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('pruneImages', telemetryOptions);
    }
  }

  async listPods(): Promise<PodInfo[]> {
    let telemetryOptions = {};
    const pods = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          if (!provider.libpodApi) {
            return [];
          }
          const pods = await provider.libpodApi.listPods();
          return pods.map(pod => {
            const podInfo: PodInfo = { ...pod, engineName: provider.name, engineId: provider.id, kind: 'podman' };
            return podInfo;
          });
        } catch (error) {
          console.log('error in engine', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flatttenedPods = pods.flat();
    this.telemetryService.track('listPods', Object.assign({ total: flatttenedPods.length }, telemetryOptions));

    return flatttenedPods;
  }

  async listNetworks(): Promise<NetworkInspectInfo[]> {
    let telemetryOptions = {};
    const networks = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          if (!provider.api) {
            return [];
          }
          const networks = await provider.api.listNetworks();
          return networks.map(network => {
            const networkInfo: NetworkInspectInfo = { ...network, engineName: provider.name, engineId: provider.id };
            return networkInfo;
          });
        } catch (error) {
          console.log('error in engine when listing networks', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flatttenedNetworks = networks.flat();
    this.telemetryService.track('listNetworks', Object.assign({ total: flatttenedNetworks.length }, telemetryOptions));

    return flatttenedNetworks;
  }

  async listVolumes(fetchUsage = false): Promise<VolumeListInfo[]> {
    let telemetryOptions = {};
    const volumes = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          if (!provider.api) {
            return [];
          }

          // grab containers
          const containers = await provider.api.listContainers({ all: true });

          // any as there is a CreatedAt field missing in the type
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const volumeListInfo: any = await provider.api.listVolumes();

          let storageDefinition = {
            Volumes: [],
          };

          if (fetchUsage) {
            // grab the storage information
            storageDefinition = await provider.api.df();
          }

          const engineName = provider.name;
          const engineId = provider.id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const volumeInfos = volumeListInfo.Volumes.map((volumeList: any) => {
            const volumeInfo: VolumeInfo = { ...volumeList, engineName, engineId };

            // compute containers using this volume
            const containersUsingThisVolume = containers
              .filter(container => container.Mounts?.find(mount => mount.Name === volumeInfo.Name))
              .map(container => {
                return { id: container.Id, names: container.Names };
              });
            volumeInfo.containersUsage = containersUsingThisVolume;

            // no usage data, set to -1 for size and 0 for refCount
            if (!volumeInfo.UsageData) {
              volumeInfo.UsageData = {
                Size: -1,
                RefCount: 0,
              };
            }
            // defines the refCount
            volumeInfo.UsageData.RefCount = volumeInfo.containersUsage.length;

            // do we have a matching volume in storage definition ?
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const matchingVolume: any = (storageDefinition?.Volumes || []).find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (volumeStorage: any) => volumeStorage.Name === volumeInfo.Name,
            );
            // update the size if asked and then there is a matching volume
            if (matchingVolume) {
              volumeInfo.UsageData.Size = matchingVolume.UsageData.Size;
            }
            return volumeInfo;
          });
          return { Volumes: volumeInfos, Warnings: volumeListInfo.Warnings, engineName, engineId };
        } catch (error) {
          console.log('error in engine', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flatttenedVolumes: VolumeListInfo[] = volumes.flat();
    this.telemetryService.track('listVolumes', Object.assign({ total: flatttenedVolumes.length }, telemetryOptions));

    return flatttenedVolumes;
  }

  async getVolumeInspect(engineId: string, volumeName: string): Promise<VolumeInspectInfo> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const provider = this.internalProviders.get(engineId);
      if (!provider) {
        throw new Error('no engine matching this container');
      }
      if (!provider.api) {
        throw new Error('no running provider for the matching container');
      }
      const volumeObject = provider.api.getVolume(volumeName);
      const volumeInspect = await volumeObject.inspect();
      return {
        engineName: provider.name,
        engineId: provider.id,
        ...volumeInspect,
      };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('volumeInspect', telemetryOptions);
    }
  }

  async removeVolume(engineId: string, volumeName: string): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingEngine(engineId).getVolume(volumeName).remove();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('removeVolume', telemetryOptions);
    }
  }

  protected getMatchingEngine(engineId: string): Dockerode {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineId);
    if (!engine) {
      throw new Error('no engine matching this engine');
    }
    if (!engine.api) {
      throw new Error('no running provider for the matching engine');
    }
    return engine.api;
  }

  protected getMatchingPodmanEngine(engineId: string): LibPod {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineId);
    if (!engine) {
      throw new Error('no engine matching this engine');
    }
    if (!engine.api) {
      throw new Error('no running provider for the matching engine');
    }
    if (!engine.libpodApi) {
      throw new Error('LibPod is not supported by this engine');
    }
    return engine.libpodApi;
  }

  // prefer podman over docker
  public getFirstRunningConnection(): [ProviderContainerConnectionInfo, Dockerode] {
    // grab all connections
    const matchingContainerProviders = Array.from(this.internalProviders.entries()).filter(
      containerProvider => containerProvider[1].api,
    );
    if (!matchingContainerProviders || matchingContainerProviders.length === 0) {
      throw new Error('No provider with a running engine');
    }

    // prefer podman over other engines
    // sort by podman first as container type
    matchingContainerProviders.sort((a, b) => {
      if (a[1].connection.type === 'podman' && b[1].connection.type === 'podman') {
        return 0;
      } else if (a[1].connection.type === 'podman' && b[1].connection.type !== 'podman') {
        return -1;
      } else {
        return 1;
      }
    });

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
        containerProvider.connection.endpoint.socketPath === providerContainerConnectionInfo.endpoint.socketPath &&
        containerProvider.connection.name === providerContainerConnectionInfo.name,
    );
    if (!matchingContainerProvider?.api) {
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
    let telemetryOptions = {};
    try {
      return this.getMatchingContainer(engineId, id).stop();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('stopContainer', telemetryOptions);
    }
  }

  async deleteImage(engineId: string, id: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // use force to delete it even it is running
      return this.getMatchingImage(engineId, id).remove({ force: true });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('deleteImage', telemetryOptions);
    }
  }

  getImageName(inspectInfo: Dockerode.ImageInspectInfo) {
    const tags = inspectInfo.RepoTags;
    if (!tags) {
      throw new Error('Cannot push an image without a tag');
    }
    // take the first tag
    return tags[0];
  }

  async tagImage(engineId: string, imageTag: string, repo: string, tag?: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.getMatchingEngine(engineId);
      const image = engine.getImage(imageTag);
      await image.tag({ repo, tag });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track(
        'tagImage',
        Object.assign({ imageName: this.getImageHash(imageTag) }, telemetryOptions),
      );
    }
  }

  async pushImage(
    engineId: string,
    imageTag: string,
    callback: (name: string, data: string) => void,
    authInfo?: containerDesktopAPI.ContainerAuthInfo,
  ): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.getMatchingEngine(engineId);
      const image = engine.getImage(imageTag);
      const authconfig = authInfo || this.imageRegistry.getAuthconfigForImage(imageTag);
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
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track(
        'pushImage',
        Object.assign({ imageName: this.getImageHash(imageTag) }, telemetryOptions),
      );
    }
  }
  async pullImage(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
    imageName: string,
    callback: (event: PullEvent) => void,
  ): Promise<void> {
    let telemetryOptions = {};
    try {
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
      const onFinished = (err: Error | null) => {
        if (err) {
          return reject(err);
        }
        resolve();
      };

      const onProgress = (event: PullEvent) => {
        callback(event);
      };
      matchingEngine.modem.followProgress(pullStream, onFinished, onProgress);

      return promise;
    } catch (error) {
      // Provides a better error message for 403 errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (error instanceof Error && (error as any)?.statusCode === 403) {
        error.message = `access to image "${imageName}" is denied (403 error). Can also be that image does not exist.`;
      }
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track(
        'pullImage',
        Object.assign({ imageName: this.getImageHash(imageName) }, telemetryOptions),
      );
    }
  }

  getImageHash(imageName: string): string {
    return crypto.createHash('sha512').update(imageName).digest('hex');
  }

  async pingContainerEngine(providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<unknown> {
    let telemetryOptions = {};
    try {
      return this.getMatchingEngineFromConnection(providerContainerConnectionInfo).ping();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('pingContainerEngine', telemetryOptions);
    }
  }

  async listContainersFromEngine(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): Promise<{ Id: string; Names: string[] }[]> {
    let telemetryOptions = {};
    try {
      return this.getMatchingEngineFromConnection(providerContainerConnectionInfo).listContainers({ all: true });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('listContainersFromEngine', telemetryOptions);
    }
  }

  async deleteContainer(engineId: string, id: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // use force to delete it even it is running
      return this.getMatchingContainer(engineId, id).remove({ force: true });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('deleteContainer', telemetryOptions);
    }
  }

  async startContainer(engineId: string, id: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.internalProviders.get(engineId);
      const container = this.getMatchingContainer(engineId, id);

      if (engine) {
        await this.attachToContainer(engine, container);
      }

      return container.start();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('startContainer', telemetryOptions);
    }
  }

  async generatePodmanKube(engineId: string, names: string[]): Promise<string> {
    let telemetryOptions = {};
    try {
      return this.getMatchingPodmanEngine(engineId).generateKube(names);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('generatePodmanKube', telemetryOptions);
    }
  }

  async startPod(engineId: string, podId: string): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingPodmanEngine(engineId).startPod(podId);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('startPod', telemetryOptions);
    }
  }

  async createPod(
    selectedProvider: ProviderContainerConnectionInfo,
    podOptions: PodCreateOptions,
  ): Promise<{ engineId: string; Id: string }> {
    let telemetryOptions = {};
    try {
      // grab all connections
      const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
        containerProvider =>
          containerProvider.connection.endpoint.socketPath === selectedProvider.endpoint.socketPath &&
          containerProvider.connection.name === selectedProvider.name,
      );
      if (!matchingContainerProvider?.libpodApi) {
        throw new Error('No provider with a running engine');
      }
      const result = await matchingContainerProvider.libpodApi.createPod(podOptions);
      return { Id: result.Id, engineId: matchingContainerProvider.id };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('createPod', telemetryOptions);
    }
  }

  async restartPod(engineId: string, podId: string): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingPodmanEngine(engineId).restartPod(podId);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('restartPod', telemetryOptions);
    }
  }

  async replicatePodmanContainer(
    source: { engineId: string; id: string },
    target: { engineId: string },
    overrideParameters: PodmanContainerCreateOptions,
  ): Promise<{ Id: string; Warnings: string[] }> {
    let telemetryOptions = {};
    try {
      // will publish in the target engine
      const libPod = this.getMatchingPodmanEngine(target.engineId);

      // grab content of the current container to replicate
      const containerToReplicate = await this.getContainerInspect(source.engineId, source.id);

      // convert env from array of string to an object with key being the env name
      const updatedEnv = containerToReplicate.Config.Env.reduce((acc: { [key: string]: string }, env) => {
        const [key, value] = env.split('=');
        acc[key] = value;
        return acc;
      }, {});

      // build create container configuration
      const originalConfiguration = {
        command: containerToReplicate.Config.Cmd,
        entrypoint: containerToReplicate.Config.Entrypoint,
        env: updatedEnv,
        image: containerToReplicate.Config.Image,
      };

      // add extra information
      const configuration = {
        ...originalConfiguration,
        ...overrideParameters,
      };
      return libPod.createPodmanContainer(configuration);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('replicatePodmanContainer', telemetryOptions);
    }
  }

  async stopPod(engineId: string, podId: string): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingPodmanEngine(engineId).stopPod(podId);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('stopPod', telemetryOptions);
    }
  }

  async removePod(engineId: string, podId: string): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingPodmanEngine(engineId).removePod(podId, { force: true });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('removePod', telemetryOptions);
    }
  }

  async prunePods(engineId: string): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingPodmanEngine(engineId).prunePods();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('prunePods', telemetryOptions);
    }
  }

  async pruneContainers(engineId: string): Promise<Dockerode.PruneContainersInfo> {
    let telemetryOptions = {};
    try {
      return this.getMatchingEngine(engineId).pruneContainers();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('pruneContainers', telemetryOptions);
    }
  }

  async pruneVolumes(engineId: string): Promise<Dockerode.PruneVolumesInfo> {
    let telemetryOptions = {};
    try {
      return this.getMatchingEngine(engineId).pruneVolumes();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('pruneVolumes', telemetryOptions);
    }
  }

  async restartContainer(engineId: string, id: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.internalProviders.get(engineId);
      const container = this.getMatchingContainer(engineId, id);

      if (engine) {
        await this.attachToContainer(engine, container);
      }

      return container.restart();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('restartContainer', telemetryOptions);
    }
  }

  // Find all containers that match the against the given project name to
  // the label com.docker.compose.project (for example)
  // and then restart all the containers that have the following label AND key
  async restartContainersByLabel(engineId: string, label: string, key: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // Get all the containers using listSimpleContainers
      const containers = await this.listSimpleContainers();

      // Find all the containers that are using projectLabel and match the projectName
      const containersMatchingProject = containers.filter(container => {
        const labels = container.Labels;
        return labels && labels[label] === key;
      });

      // Get all the container ids in containersIds
      const containerIds = containersMatchingProject.map(container => container.Id);

      // Restart all the containers in containerIds
      await Promise.all(containerIds.map(containerId => this.restartContainer(engineId, containerId)));
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('restartContainersByLabel', telemetryOptions);
    }
  }

  // Start containers that match a label + key
  async startContainersByLabel(engineId: string, label: string, key: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // Get all the containers using listSimpleContainers
      const containers = await this.listSimpleContainers();

      // Find all the containers that are using projectLabel and match the projectName
      const containersMatchingProject = containers.filter(
        container => container.State !== 'running' && container.Labels?.[label] === key,
      );

      // Get all the container ids in containersIds
      const containerIds = containersMatchingProject.map(container => container.Id);

      // Start all the containers
      await Promise.all(containerIds.map(containerId => this.startContainer(engineId, containerId)));
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('startContainersByLabel', telemetryOptions);
    }
  }

  // Stop containers that match a label + key
  async stopContainersByLabel(engineId: string, label: string, key: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // Get all the containers using listSimpleContainers
      const containers = await this.listSimpleContainers();

      // Find all the containers that are using projectLabel and match the projectName
      const containersMatchingProject = containers.filter(
        container => container.State === 'running' && container.Labels?.[label] === key,
      );

      // Get all the container ids in containersIds
      const containerIds = containersMatchingProject.map(container => container.Id);

      // Stop all the containers
      await Promise.all(containerIds.map(containerId => this.stopContainer(engineId, containerId)));
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('stopContainersByLabel', telemetryOptions);
    }
  }

  // Delete all containers that match a certain label and key
  async deleteContainersByLabel(engineId: string, label: string, key: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // Get all the containers using listSimpleContainers
      const containers = await this.listSimpleContainers();

      // Find all the containers that are using projectLabel and match the projectName
      const containersMatchingProject = containers.filter(container => container.Labels?.[label] === key);

      // Get all the container ids in containersIds
      const containerIds = containersMatchingProject.map(container => container.Id);

      // Delete all the containers in containerIds
      await Promise.all(containerIds.map(containerId => this.deleteContainer(engineId, containerId)));
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('deleteContainersByLabel', telemetryOptions);
    }
  }

  async logsContainer(engineId: string, id: string, callback: (name: string, data: string) => void): Promise<void> {
    let telemetryOptions = {};
    let firstMessage = true;
    const container = this.getMatchingContainer(engineId, id);
    container
      .logs({
        follow: true,
        stdout: true,
        stderr: true,
      })
      .then(containerStream => {
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
      })
      .catch((error: unknown) => {
        telemetryOptions = { error: error };
        throw error;
      })
      .finally(() => this.telemetryService.track('logsContainer', telemetryOptions));
  }

  async execInContainer(
    engineId: string,
    id: string,
    command: string[],
    onStdout: (data: Buffer) => void,
    onStderr: (data: Buffer) => void,
  ): Promise<void> {
    const container = this.getMatchingContainer(engineId, id);

    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: false,
      Cmd: command,
      Tty: false,
    });

    const execStream = await exec.start({ hijack: true, stdin: false });

    const wrappedAsStream = (redirect: (data: Buffer) => void): Writable => {
      return new Writable({
        write: (chunk, _encoding, done) => {
          redirect(chunk);
          done();
        },
      });
    };

    const stdoutEchoStream = wrappedAsStream(onStdout);
    const stderrEchoStream = wrappedAsStream(onStderr);

    container.modem.demuxStream(execStream, stdoutEchoStream, stderrEchoStream);

    return new Promise((resolve, reject) => {
      const check = async () => {
        const r = await exec.inspect();

        if (!r.Running) {
          clearInterval(timer);
          execStream.destroy();
          resolve();
        }
      };

      // workaround if end callback is not called
      // it seems it happens sometimes on Windows
      const timer = setInterval(() => {
        check().catch((err: unknown) => {
          console.log('error in check', err);
        });
      }, 1000);

      execStream.on('end', () => {
        clearInterval(timer);
        resolve();
      });
      execStream.on('error', err => {
        clearInterval(timer);
        reject(err);
      });
    });
  }

  async shellInContainer(
    engineId: string,
    id: string,
    onData: (data: Buffer) => void,
    onError: (error: string) => void,
    onEnd: () => void,
  ): Promise<(param: string) => void> {
    let telemetryOptions = {};
    try {
      const exec = await this.getMatchingContainer(engineId, id).exec({
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Cmd: ['/bin/sh', '-c', 'if command -v bash >/dev/null 2>&1; then bash; else sh; fi'],
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

      execStream.on('error', err => {
        onError(err.toString());
      });

      execStream.on('end', () => {
        onEnd();
      });

      return (param: string) => {
        execStream.write(param);
      };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('shellInContainer', telemetryOptions);
    }
  }

  async attachContainer(
    engineId: string,
    containerId: string,
    onData: (data: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
  ): Promise<(param: string) => void> {
    // check if we have an existing stream
    let attachStream = this.streamsPerContainerId.get(containerId);

    const setupStream = (stream: NodeJS.ReadWriteStream) => {
      stream.on('data', chunk => {
        onData(chunk.toString('utf-8'));
      });

      stream.on('error', err => {
        onError(String(err));
      });

      stream.on('end', () => {
        onEnd();
      });

      // do we have previous data?
      const previousData = this.streamsOutputPerContainerId.get(containerId);
      if (previousData) {
        const concat = Buffer.concat(previousData);
        // replay
        onData(concat.toString('utf-8'));
      }
    };

    if (!attachStream) {
      // grab the container object
      const container = this.getMatchingContainer(engineId, containerId);

      const getAttachStream = async () => {
        // use either podman specific API or compat API
        try {
          const libpod = this.getMatchingPodmanEngine(engineId);
          return libpod.podmanAttach(container.id);
        } catch (error) {
          // run attach
          const compatAttachOptions: ContainerAttachOptions = {
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true,
            hijack: true,
          };
          return container.attach(compatAttachOptions);
        }
      };

      getAttachStream()
        .then(readWriteStream => {
          attachStream = readWriteStream;
          setupStream(attachStream);
        })
        .catch((err: unknown) => {
          console.log('error in attach', err);
        });
    } else {
      setupStream(attachStream);
    }

    this.telemetryService.track('attachContainer');

    return (param: string) => {
      attachStream?.write(param);
    };
  }

  // keep a reference to the input/output stream of a container
  // can be used before starting the container
  // it only keep data if tty is specified on the container
  async attachToContainer(
    engine: InternalContainerProvider,
    container: Dockerode.Container,
    hasTty?: boolean,
    openStdin?: boolean,
  ): Promise<void> {
    // if option is not specified, try to look if the container is using tty or not
    if (hasTty === undefined || openStdin === undefined) {
      const containerInspectInfo = await container.inspect();
      hasTty = containerInspectInfo.Config.Tty;
      openStdin = containerInspectInfo.Config.OpenStdin;
    }
    // no tty and no stdin, do not need to try to attach a terminal
    if (!hasTty || !openStdin) {
      return;
    }

    // if tty, attach a terminal using compat API or Podman API
    let attachStream;
    if (engine.libpodApi) {
      attachStream = await engine.libpodApi.podmanAttach(container.id);
    } else {
      const attachOptions: ContainerAttachOptions = {
        stdin: true,
        stream: true,
        stdout: true,
        stderr: true,
        hijack: true,
      };
      attachStream = await container.attach(attachOptions);
    }

    if (attachStream) {
      this.streamsPerContainerId.set(container.id, attachStream);

      // if stream is closed, cleanup
      attachStream.on('end', () => {
        this.streamsPerContainerId.delete(container.id);
        this.streamsOutputPerContainerId.delete(container.id);
      });

      const chunks: Buffer[] = [];
      // keep last chunks of the buffer to replay them later
      attachStream.on('data', (data: Buffer) => {
        chunks.push(data);
        if (chunks.length > 100) {
          chunks.shift();
        }
        this.streamsOutputPerContainerId.set(container.id, chunks);
      });
    }
  }

  async createAndStartContainer(engineId: string, options: ContainerCreateOptions): Promise<{ id: string }> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const engine = this.internalProviders.get(engineId);
      if (!engine) {
        throw new Error('no engine matching this container');
      }
      if (!engine.api) {
        throw new Error('no running provider for the matching container');
      }
      const container = await engine.api.createContainer(options);
      await this.attachToContainer(engine, container, options.Tty, options.OpenStdin);
      await container.start();
      return { id: container.id };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('createAndStartContainer', telemetryOptions);
    }
  }

  async createVolume(selectedProvider: ProviderContainerConnectionInfo, options: VolumeCreateOptions): Promise<void> {
    let telemetryOptions = {};
    try {
      // filter from connections
      const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
        containerProvider =>
          containerProvider.connection.endpoint.socketPath === selectedProvider.endpoint.socketPath &&
          containerProvider.connection.name === selectedProvider.name &&
          selectedProvider.status === 'started',
      );
      if (!matchingContainerProvider?.api) {
        throw new Error('No provider with a running engine');
      }

      await matchingContainerProvider.api.createVolume(options);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('createVolume', telemetryOptions);
    }
  }

  async getImageInspect(engineId: string, id: string): Promise<ImageInspectInfo> {
    let telemetryOptions = {};
    try {
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
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('imageInspect', telemetryOptions);
    }
  }

  async getImageHistory(engineId: string, id: string): Promise<HistoryInfo[]> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const provider = this.internalProviders.get(engineId);
      if (!provider) {
        throw new Error('no engine matching this container');
      }
      if (!provider.api) {
        throw new Error('no running provider for the matching container');
      }
      const imageObject = provider.api.getImage(id);
      return imageObject.history();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('imageHistory', telemetryOptions);
    }
  }

  async getContainerInspect(engineId: string, id: string): Promise<ContainerInspectInfo> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const provider = this.internalProviders.get(engineId);
      if (!provider) {
        throw new Error('no engine matching this container');
      }
      if (!provider.api) {
        throw new Error('no running provider for the matching container');
      }

      const containerObject = provider.api.getContainer(id);
      const containerInspect = await containerObject.inspect();
      return {
        engineName: provider.name,
        engineId: provider.id,
        ...containerInspect,
      };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('containerInspect', telemetryOptions);
    }
  }

  async saveImage(engineId: string, id: string, filename: string): Promise<void> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const provider = this.internalProviders.get(engineId);
      if (!provider) {
        throw new Error('no engine matching this container');
      }
      if (!provider.api) {
        throw new Error('no running provider for the matching container');
      }

      const imageObject = provider.api.getImage(id);
      if (imageObject) {
        const imageStream = await imageObject.get();
        return pipeline(imageStream, fs.createWriteStream(filename));
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('imageSave', telemetryOptions);
    }
  }

  async getPodInspect(engineId: string, id: string): Promise<PodInspectInfo> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const provider = this.internalProviders.get(engineId);
      if (!provider) {
        throw new Error('no engine matching this container');
      }
      if (!provider.libpodApi) {
        throw new Error('no running provider for the matching container');
      }

      const containerInspect = await provider.libpodApi.getPodInspect(id);
      return {
        engineName: provider.name,
        engineId: provider.id,
        ...containerInspect,
      };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('podInspect', telemetryOptions);
    }
  }

  private statsConsumerId = 0;
  private statsConsumer = new Map<number, NodeJS.ReadableStream>();

  async stopContainerStats(id: number): Promise<void> {
    const consumer = this.statsConsumer.get(id);
    if (consumer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (consumer as any).destroy();
      this.statsConsumer.delete(id);
    }
  }

  async getContainerStats(
    engineId: string,
    id: string,
    callback: (stats: ContainerStatsInfo) => void,
  ): Promise<number> {
    let telemetryOptions = {};
    try {
      // need to find the container engine of the container
      const provider = this.internalProviders.get(engineId);
      if (!provider) {
        throw new Error('no engine matching this container');
      }
      if (!provider.api) {
        throw new Error('no running provider for the matching container');
      }

      const containerObject = provider.api.getContainer(id);
      this.statsConsumerId++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let stream: any;
      try {
        stream = (await containerObject.stats({ stream: true })) as unknown as NodeJS.ReadableStream;
        this.statsConsumer.set(this.statsConsumerId, stream);

        const pipeline = stream?.pipe(StreamValues.withParser());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pipeline?.on('error', (error: any) => {
          console.error('Error while grabbing stats', error);
          try {
            stream?.destroy();
            this.statsConsumer.delete(this.statsConsumerId);
          } catch (error) {
            console.error('Error while destroying stream', error);
          }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pipeline?.on('data', (data: any) => {
          if (data?.value) {
            callback({
              engineName: provider.name,
              engineId: provider.id,
              ...data.value,
            });
          }
        });
      } catch (error) {
        // try to destroy the stream
        stream?.destroy();
        this.statsConsumer.delete(this.statsConsumerId);
      }

      return this.statsConsumerId;
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('containerStats', telemetryOptions);
    }
  }

  async playKube(
    kubernetesYamlFilePath: string,
    selectedProvider: ProviderContainerConnectionInfo,
  ): Promise<PlayKubeInfo> {
    let telemetryOptions = {};
    try {
      // grab all connections
      const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
        containerProvider =>
          containerProvider.connection.endpoint.socketPath === selectedProvider.endpoint.socketPath &&
          containerProvider.connection.name === selectedProvider.name,
      );
      if (!matchingContainerProvider?.libpodApi) {
        throw new Error('No provider with a running engine');
      }
      return matchingContainerProvider.libpodApi.playKube(kubernetesYamlFilePath);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('playKube', telemetryOptions);
    }
  }

  async buildImage(
    containerBuildContextDirectory: string,
    relativeContainerfilePath: string,
    imageName: string,
    selectedProvider: ProviderContainerConnectionInfo,
    eventCollect: (eventName: 'stream' | 'error' | 'finish', data: string) => void,
  ): Promise<unknown> {
    let telemetryOptions = {};
    try {
      // grab all connections
      const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
        containerProvider =>
          containerProvider.connection.endpoint.socketPath === selectedProvider.endpoint.socketPath &&
          containerProvider.connection.name === selectedProvider.name &&
          selectedProvider.status === 'started',
      );
      if (!matchingContainerProvider?.api) {
        throw new Error('No provider with a running engine');
      }

      // grab auth for all registries
      const registryconfig = this.imageRegistry.getRegistryConfig();
      eventCollect(
        'stream',
        `Uploading the build context from ${containerBuildContextDirectory}...Can take a while...\r\n`,
      );
      const tarStream = tar.pack(containerBuildContextDirectory);
      if (isWindows()) {
        relativeContainerfilePath = relativeContainerfilePath.replace(/\\/g, '/');
      }

      let streamingPromise: Stream;
      try {
        streamingPromise = (await matchingContainerProvider.api.buildImage(tarStream, {
          registryconfig,
          dockerfile: relativeContainerfilePath,
          t: imageName,
        })) as unknown as Stream;
      } catch (error: unknown) {
        console.log('error in buildImage', error);
        const errorMessage = error instanceof Error ? error.message : '' + error;
        eventCollect('error', errorMessage);
        throw error;
      }
      eventCollect('stream', `Building ${imageName}...\r\n`);
      // eslint-disable-next-line @typescript-eslint/ban-types
      let resolve: (output: {}) => void;
      let reject: (err: Error) => void;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      // eslint-disable-next-line @typescript-eslint/ban-types
      const onFinished = (err: Error | null, output: {}) => {
        if (err) {
          eventCollect('finish', err.message);
          return reject(err);
        }
        eventCollect('finish', '');
        resolve(output);
      };

      const onProgress = (event: {
        stream?: string;
        status?: string;
        progress?: string;
        error?: string;
        errorDetails?: { message?: string };
      }) => {
        if (event.stream) {
          eventCollect('stream', event.stream);
        } else if (event.error) {
          eventCollect('error', event.error);
        }
      };

      matchingContainerProvider.api.modem.followProgress(streamingPromise, onFinished, onProgress);
      return promise;
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('buildImage', telemetryOptions);
    }
  }
}
