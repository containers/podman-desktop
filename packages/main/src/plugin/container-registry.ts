/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import * as crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import type * as containerDesktopAPI from '@podman-desktop/api';
import datejs from 'date.js';
import type { ContainerAttachOptions, ImageBuildOptions } from 'dockerode';
import Dockerode from 'dockerode';
import moment from 'moment';
import StreamValues from 'stream-json/streamers/StreamValues.js';

import type { ProviderRegistry } from '/@/plugin/provider-registry.js';
import type {
  ContainerCreateOptions,
  ContainerExportOptions,
  ContainerImportOptions,
  ContainerInfo,
  ContainerPortInfo,
  ImageLoadOptions,
  ImagesSaveOptions,
  NetworkCreateOptions,
  NetworkCreateResult,
  SimpleContainerInfo,
  VolumeCreateOptions,
  VolumeCreateResponseInfo,
} from '/@api/container-info.js';
import type { ContainerInspectInfo } from '/@api/container-inspect-info.js';
import type { ContainerStatsInfo } from '/@api/container-stats-info.js';
import type { HistoryInfo } from '/@api/history-info.js';
import type { BuildImageOptions, ImageInfo, ListImagesOptions, PodmanListImagesOptions } from '/@api/image-info.js';
import type { ImageInspectInfo } from '/@api/image-inspect-info.js';
import type { ManifestCreateOptions, ManifestInspectInfo } from '/@api/manifest-info.js';
import type { NetworkInspectInfo } from '/@api/network-info.js';
import type { ProviderContainerConnectionInfo } from '/@api/provider-info.js';
import type { PullEvent } from '/@api/pull-event.js';
import type { VolumeInfo, VolumeInspectInfo, VolumeListInfo } from '/@api/volume-info.js';

import { isWindows } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { PodCreateOptions, PodInfo, PodInspectInfo } from './api/pod-info.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type {
  ContainerCreateMountOption,
  ContainerCreateNetNSOption,
  ContainerCreateOptions as PodmanContainerCreateOptions,
  ContainerCreatePortMappingOption,
  LibPod,
  PlayKubeInfo,
  PodInfo as LibpodPodInfo,
} from './dockerode/libpod-dockerode.js';
import { LibpodDockerode } from './dockerode/libpod-dockerode.js';
import { EnvfileParser } from './env-file-parser.js';
import type { Event } from './events/emitter.js';
import { Emitter } from './events/emitter.js';
import type { ImageRegistry } from './image-registry.js';
import { LibpodApiSettings } from './libpod-api-enable/libpod-api-settings.js';
import type { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';
import { guessIsManifest } from './util/manifest.js';

const tar: { pack: (dir: string) => NodeJS.ReadableStream } = require('tar-fs');

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

  // delay in ms before retrying to connect to the provider when /events connection fails
  protected retryDelayEvents: number = 5000;

  private envfileParser = new EnvfileParser();

  constructor(
    private apiSender: ApiSenderType,
    private configurationRegistry: ConfigurationRegistry,
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

  useLibpodApiForImageList(): boolean {
    return this.configurationRegistry
      .getConfiguration(LibpodApiSettings.SectionName)
      .get<boolean>(LibpodApiSettings.ForImageList, false);
  }

  handleEvents(api: Dockerode, errorCallback: (error: Error) => void): void {
    let nbEvents = 0;
    const startDate = performance.now();
    const eventEmitter = new EventEmitter();

    eventEmitter.on('event', (jsonEvent: JSONEvent) => {
      nbEvents++;
      console.log('event is', jsonEvent);
      this._onEvent.fire(jsonEvent);
      if (jsonEvent.status === 'stop' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been stopped
        this.apiSender.send('container-stopped-event', jsonEvent.id);
      } else if (jsonEvent.status === 'init' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been started
        this.apiSender.send('container-init-event', jsonEvent.id);
      } else if (jsonEvent.status === 'create' && jsonEvent?.Type === 'container') {
        // need to notify that a container has been created
        this.apiSender.send('container-created-event', jsonEvent.id);
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
      } else if (jsonEvent.status === 'loadfromarchive' && jsonEvent?.Type === 'image') {
        // need to notify that image are being pulled
        this.apiSender.send('image-loadfromarchive-event', jsonEvent.id);
      }
    });

    api.getEvents((err, stream) => {
      if (err) {
        console.log('error is', err);
        errorCallback(new Error('Error in handling events', err));
      }

      stream?.on('error', error => {
        console.error('/event stream received an error.', error);
        // log why it failed and after how many ms connection dropped
        this.telemetryService.track('handleContainerEventsFailure', {
          nbEvents,
          failureAfter: performance.now() - startDate,
          error,
        });
        // notify the error (do not throw as we're inside handlers/callbacks)
        errorCallback(new Error('Error in handling events', error));
      });

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

  setupListeners(): void {
    const cleanStreamMap = (containerId: unknown): void => {
      this.streamsPerContainerId.delete(String(containerId));
      this.streamsOutputPerContainerId.delete(String(containerId));
    };

    this.apiSender.receive('container-stopped-event', (containerId: unknown) => {
      cleanStreamMap(containerId);
    });

    this.apiSender.receive('container-die-event', (containerId: unknown) => {
      cleanStreamMap(containerId);
    });

    this.apiSender.receive('container-kill-event', (containerId: unknown) => {
      cleanStreamMap(containerId);
    });

    this.apiSender.receive('container-removed-event', (containerId: unknown) => {
      cleanStreamMap(containerId);
    });
  }

  reconnectContainerProviders(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const provider of this.internalProviders.values()) {
      if (provider.api) this.setupConnectionAPI(provider, provider.connection);
    }
  }

  setupConnectionAPI(
    internalProvider: InternalContainerProvider,
    containerProviderConnection: containerDesktopAPI.ContainerProviderConnection,
  ): void {
    // abort if connection is stopped
    if (containerProviderConnection.status() === 'stopped') {
      console.log('Aborting reconnect due to error as connection is now stopped');
      return;
    }

    // abort if connection has been removed
    if (containerProviderConnection.status() === undefined) {
      console.log('Aborting reconnect due to error as connection has been removed (probably machine has been removed)');
      return;
    }

    internalProvider.api = new Dockerode({ socketPath: containerProviderConnection.endpoint.socketPath });
    if (containerProviderConnection.type === 'podman') {
      internalProvider.libpodApi = internalProvider.api as unknown as LibPod;
    }

    // in case of errors reported during handling events like the connection is aborted, etc.
    // we need to reconnect the provider
    const errorHandler = (error: Error): void => {
      console.warn('Error when handling events', error, 'Will reconnect in 5s', error);
      internalProvider.api = undefined;
      internalProvider.libpodApi = undefined;

      // ok we had some errors so we need to reconnect the provider
      // delay the reconnection to avoid too many reconnections
      // retry in 5 seconds
      setTimeout(() => {
        this.setupConnectionAPI(internalProvider, containerProviderConnection);
      }, this.retryDelayEvents);
    };

    this.handleEvents(internalProvider.api, errorHandler);
    this.apiSender.send('provider-change', {});
  }

  registerContainerConnection(
    provider: containerDesktopAPI.Provider,
    containerProviderConnection: containerDesktopAPI.ContainerProviderConnection,
    providerRegistry: ProviderRegistry,
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

    providerRegistry.onBeforeDidUpdateContainerConnection(event => {
      if (event.providerId === provider.id && event.connection.name === containerProviderConnection.name) {
        const newStatus = event.status;
        if (newStatus === 'stopped') {
          internalProvider.api = undefined;
          internalProvider.libpodApi = undefined;
          this.apiSender.send('provider-change', {});
        }
        if (newStatus === 'started') {
          this.setupConnectionAPI(internalProvider, containerProviderConnection);
        }
      }
      previousStatus = event.status;
    });

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
  async listSimpleContainers(abortController?: AbortController): Promise<SimpleContainerInfo[]> {
    let telemetryOptions = {};
    const containers = await Promise.all(
      Array.from(this.internalProviders.values()).map(async provider => {
        try {
          const providerApi = provider.api;
          if (!providerApi) {
            return [];
          }

          const containers = await providerApi.listContainers({ all: true, abortSignal: abortController?.signal });
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
    const flattenedContainers = containers.flat();
    this.telemetryService.track(
      'listSimpleContainers',
      Object.assign({ total: flattenedContainers.length }, telemetryOptions),
    );

    return flattenedContainers;
  }

  // listSimpleContainers by matching label and key
  async listSimpleContainersByLabel(
    label: string,
    key: string,
    abortController?: AbortController,
  ): Promise<SimpleContainerInfo[]> {
    // Get all the containers using listSimpleContainers
    const containers = await this.listSimpleContainers(abortController);

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
                StartedAt: container.StartedAt ?? '',
                Status: container.Status,
                ImageBase64RepoTag: Buffer.from(container.Image, 'binary').toString('base64'),
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
    const flattenedContainers = containers.flat();
    this.telemetryService.track(
      'listContainers',
      Object.assign({ total: flattenedContainers.length }, telemetryOptions),
    );

    return flattenedContainers;
  }

  async listImages(options?: ListImagesOptions): Promise<ImageInfo[]> {
    let telemetryOptions = {};

    let providers: InternalContainerProvider[];
    if (options?.provider === undefined) {
      providers = Array.from(this.internalProviders.values());
    } else {
      providers = [this.getMatchingContainerProvider(options?.provider)];
    }

    const images = await Promise.all(
      Array.from(providers).map(async provider => {
        try {
          if (!provider.api) {
            return [];
          }
          const images = await provider.api.listImages({ all: false });
          return images.map(image => {
            const imageInfo: ImageInfo = {
              ...image,
              engineName: provider.name,
              engineId: provider.id,
              Digest: `sha256:${image.Id}`,
            };
            return imageInfo;
          });
        } catch (error) {
          console.log('error in engine', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flattenedImages = images.flat();
    this.telemetryService.track('listImages', Object.assign({ total: flattenedImages.length }, telemetryOptions));

    return flattenedImages;
  }

  // Podman list images will prefer to use libpod API of the provider
  // before falling back to using the regular API
  async podmanListImages(options?: PodmanListImagesOptions): Promise<ImageInfo[]> {
    const telemetryOptions = {};

    // This gets all the available providers if no provider has been specified
    let providers: InternalContainerProvider[];
    if (options?.provider === undefined) {
      providers = Array.from(this.internalProviders.values());
    } else {
      providers = [this.getMatchingContainerProvider(options?.provider)];
    }

    const images = await Promise.all(
      providers.map(async provider => {
        // Initialize an empty array for the case where neither API is available
        // ignore any warning as we are adding engineId and engineName to the image
        // and as one of the API uses Dockerode, the other ImageInfo
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fetchedImages: any[] = [];

        // If libpod API is available AND the configuration is set to use libpodApi, use podmanListImages API call.
        if (provider.libpodApi && this.useLibpodApiForImageList()) {
          fetchedImages = await provider.libpodApi.podmanListImages({
            all: options?.all,
            filters: options?.filters,
          });
        } else if (provider.api) {
          fetchedImages = await provider.api.listImages({ all: false });
        } else {
          console.log('Engine does not have an API or a libpod API, returning empty array', provider.name);
          return fetchedImages;
        }

        return Promise.all(
          Array.from(fetchedImages).map(async image => {
            const baseImage = {
              ...image,
              engineName: provider.name,
              engineId: provider.id,
              isManifest: guessIsManifest(image, provider.connection.type),
              Id: image.Digest ? `sha256:${image.Id}` : image.Id,
              Digest: image.Digest || `sha256:${image.Id}`,
            };

            // If the image is a manifest, inspect the manifest to get the digests of the images part of the manifest
            // however, we do not **ever** want this to block the UI / operation, so if this fails, output to console and continue
            if (baseImage.isManifest && provider.libpodApi) {
              try {
                const manifestInspectInfo = await provider.libpodApi.podmanInspectManifest(image.Id);
                if (manifestInspectInfo?.manifests) {
                  baseImage.manifests = manifestInspectInfo.manifests;
                }
              } catch (error) {
                console.error('Error while inspecting manifest', error);
              }
            }

            return baseImage;
          }),
        );
      }),
    );

    const flattenedImages = images.flat();
    this.telemetryService.track('podmanListImages', Object.assign({ total: flattenedImages.length }, telemetryOptions));

    return flattenedImages;
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
        await provider.libpodApi.pruneAllImages(true);
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
    const flattenedPods = pods.flat();
    this.telemetryService.track('listPods', Object.assign({ total: flattenedPods.length }, telemetryOptions));

    return flattenedPods;
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
            const networkInfo: NetworkInspectInfo = {
              ...network,
              engineName: provider.name,
              engineId: provider.id,
              engineType: provider.connection.type,
            };
            return networkInfo;
          });
        } catch (error) {
          console.log('error in engine when listing networks', provider.name, error);
          telemetryOptions = { error: error };
          return [];
        }
      }),
    );
    const flattenedNetworks = networks.flat();
    this.telemetryService.track('listNetworks', Object.assign({ total: flattenedNetworks.length }, telemetryOptions));

    return flattenedNetworks;
  }

  async createNetwork(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo | containerDesktopAPI.ContainerProviderConnection,
    options: NetworkCreateOptions,
  ): Promise<NetworkCreateResult> {
    let telemetryOptions = {};
    try {
      const matchingEngine = this.getMatchingEngineFromConnection(providerContainerConnectionInfo);
      const network = await matchingEngine.createNetwork(options);
      return { Id: network.id };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('createNetwork', telemetryOptions);
    }
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
    const flattenedVolumes: VolumeListInfo[] = volumes.flat();
    this.telemetryService.track('listVolumes', Object.assign({ total: flattenedVolumes.length }, telemetryOptions));

    return flattenedVolumes;
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

  // method like remove Volume but instead of taking engineId/engineName it's taking connection info
  async deleteVolume(
    volumeName: string,
    options?: { provider?: ProviderContainerConnectionInfo | containerDesktopAPI.ContainerProviderConnection },
  ): Promise<void> {
    let telemetryOptions = {};
    try {
      let matchingContainerProviderApi: Dockerode;
      if (options?.provider) {
        // grab all connections
        matchingContainerProviderApi = this.getMatchingEngineFromConnection(options.provider);
      } else {
        // Get the first running connection (preference for podman)
        matchingContainerProviderApi = this.getFirstRunningConnection()[1];
      }
      return matchingContainerProviderApi.getVolume(volumeName).remove();
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('removeVolume', telemetryOptions);
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

  protected getMatchingPodmanEngine(engineId: string): InternalContainerProvider {
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
    return engine;
  }

  protected getMatchingPodmanEngineLibPod(engineId: string): LibPod {
    // need to find the container engine of the container
    const engine = this.getMatchingPodmanEngine(engineId);
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

  /**
   * it finds a running podman provider by fetching all internalProviders.
   * It filters by checking the libpodApi
   * @returns a running podman provider
   * @throws if no running podman provider is found
   */
  public getFirstRunningPodmanContainerProvider(): InternalContainerProvider {
    // grab the first running podman provider
    const matchingPodmanContainerProvider = Array.from(this.internalProviders.values()).find(
      containerProvider => containerProvider.libpodApi,
    );
    if (!matchingPodmanContainerProvider) {
      throw new Error('No podman provider with a running engine');
    }

    return matchingPodmanContainerProvider;
  }

  protected getMatchingEngineFromConnection(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo | containerDesktopAPI.ContainerProviderConnection,
  ): Dockerode {
    // grab all connections
    const matchingContainerProvider = this.getMatchingContainerProvider(providerContainerConnectionInfo);
    if (!matchingContainerProvider?.api) {
      throw new Error('no running provider for the matching container');
    }
    return matchingContainerProvider.api;
  }

  protected getMatchingContainerProvider(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo | containerDesktopAPI.ContainerProviderConnection,
  ): InternalContainerProvider {
    // grab all connections
    const matchingContainerProvider = Array.from(this.internalProviders.values()).find(
      containerProvider =>
        containerProvider.connection.endpoint.socketPath === providerContainerConnectionInfo.endpoint.socketPath &&
        containerProvider.connection.name === providerContainerConnectionInfo.name,
    );
    if (!matchingContainerProvider?.api) {
      throw new Error('no running provider for the matching container');
    }
    return matchingContainerProvider;
  }

  protected getMatchingContainer(engineId: string, id: string): Dockerode.Container {
    return this.getMatchingEngine(engineId).getContainer(id);
  }

  protected getMatchingImage(engineId: string, imageId: string): Dockerode.Image {
    return this.getMatchingEngine(engineId).getImage(imageId);
  }

  async stopContainer(engineId: string, id: string, abortController?: AbortController): Promise<void> {
    let telemetryOptions = {};
    try {
      return this.getMatchingContainer(engineId, id).stop({ abortSignal: abortController?.signal });
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

  getImageName(inspectInfo: Dockerode.ImageInspectInfo): string {
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
    abortController?: AbortController,
  ): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.getMatchingEngine(engineId);
      const image = engine.getImage(imageTag);
      const authconfig = authInfo ?? this.imageRegistry.getAuthconfigForImage(imageTag);
      const pushStream = await image.push({
        authconfig,
        abortSignal: abortController?.signal,
      });
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
    providerContainerConnectionInfo: ProviderContainerConnectionInfo | containerDesktopAPI.ContainerProviderConnection,
    imageName: string,
    callback: (event: PullEvent) => void,
    abortController?: AbortController,
  ): Promise<void> {
    let telemetryOptions = {};
    try {
      const authconfig = this.imageRegistry.getAuthconfigForImage(imageName);
      const matchingEngine = this.getMatchingEngineFromConnection(providerContainerConnectionInfo);
      const pullStream = await matchingEngine.pull(imageName, {
        authconfig,
        abortSignal: abortController?.signal,
      });
      // eslint-disable-next-line @typescript-eslint/ban-types
      let resolve: () => void;
      let reject: (err: Error) => void;
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });

      // eslint-disable-next-line @typescript-eslint/ban-types
      const onFinished = (err: Error | null): void => {
        if (err) {
          return reject(err);
        }
        resolve();
      };

      const onProgress = (event: PullEvent): void => {
        callback(event);
      };
      matchingEngine.modem.followProgress(pullStream, onFinished, onProgress);

      return promise;
    } catch (error) {
      // Provides a better error message for 401, 403 and 500 errors
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (error as any)?.statusCode;
        if (statusCode === 403) {
          error.message = `access to image "${imageName}" is denied (403 error). Can also be that image does not exist.`;
        } else if (statusCode === 500 || statusCode === 401) {
          error.message = `access to image "${imageName}" is denied (${statusCode} error). Can also be that the registry requires authentication.`;
        }
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

  async deleteContainer(engineId: string, id: string, abortController?: AbortController): Promise<void> {
    let telemetryOptions = {};
    try {
      // use force to delete it even it is running
      return this.getMatchingContainer(engineId, id).remove({ force: true, abortSignal: abortController?.signal });
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('deleteContainer', telemetryOptions);
    }
  }

  async startContainer(engineId: string, id: string, abortController?: AbortController): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.internalProviders.get(engineId);
      const container = this.getMatchingContainer(engineId, id);

      if (engine) {
        await this.attachToContainer(engine, container);
      }
      return container.start({ abortSignal: abortController?.signal } as unknown as Dockerode.ContainerStartOptions);
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
      return this.getMatchingPodmanEngineLibPod(engineId).generateKube(names);
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
      return this.getMatchingPodmanEngineLibPod(engineId).startPod(podId);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('startPod', telemetryOptions);
    }
  }

  async createPod(podOptions: PodCreateOptions): Promise<{ engineId: string; Id: string }> {
    let telemetryOptions = {};
    try {
      let internalContainerProvider: InternalContainerProvider;
      if (podOptions.provider) {
        // grab connection
        internalContainerProvider = this.getMatchingContainerProvider(podOptions.provider);
      } else {
        // Get the first running podman connection
        internalContainerProvider = this.getFirstRunningPodmanContainerProvider();
      }
      if (!internalContainerProvider?.libpodApi) {
        throw new Error('No podman provider with a running engine');
      }
      const result = await internalContainerProvider.libpodApi.createPod(podOptions);
      return { Id: result.Id, engineId: internalContainerProvider.id };
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
      return this.getMatchingPodmanEngineLibPod(engineId).restartPod(podId);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('restartPod', telemetryOptions);
    }
  }

  async createManifest(manifestOptions: ManifestCreateOptions): Promise<{ engineId: string; Id: string }> {
    let telemetryOptions = {};
    try {
      let internalContainerProvider: InternalContainerProvider;
      if (manifestOptions.provider) {
        // grab connection
        internalContainerProvider = this.getMatchingContainerProvider(manifestOptions.provider);
      } else {
        // Get the first running podman connection
        internalContainerProvider = this.getFirstRunningPodmanContainerProvider();
      }

      // Check if the found provider does not support the libpod API
      if (!internalContainerProvider?.libpodApi) {
        throw new Error('The matching provider does not support the Podman API');
      }

      const result = await internalContainerProvider.libpodApi.podmanCreateManifest(manifestOptions);
      return { engineId: internalContainerProvider.id, Id: result.Id };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('createManifest', telemetryOptions);
    }
  }

  async inspectManifest(engineId: string, manifestId: string): Promise<ManifestInspectInfo> {
    let telemetryOptions = {};
    try {
      const libPod = this.getMatchingPodmanEngineLibPod(engineId);
      if (!libPod) {
        throw new Error('No podman provider with a running engine');
      }
      return await libPod.podmanInspectManifest(manifestId);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('inspectManifest', telemetryOptions);
    }
  }

  async removeManifest(engineId: string, manifestName: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const libPod = this.getMatchingPodmanEngineLibPod(engineId);
      if (!libPod) {
        throw new Error('No podman provider with a running engine');
      }
      return libPod.podmanRemoveManifest(manifestName);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('removeManifest', telemetryOptions);
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
      const libPod = this.getMatchingPodmanEngineLibPod(target.engineId);

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
        mounts: containerToReplicate.Mounts,
      };

      // add extra information
      const configuration: ContainerCreateOptions = {
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
      return this.getMatchingPodmanEngineLibPod(engineId).stopPod(podId);
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
      return this.getMatchingPodmanEngineLibPod(engineId).removePod(podId, { force: true });
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
      return this.getMatchingPodmanEngineLibPod(engineId).prunePods();
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

  async restartContainer(engineId: string, id: string, abortController?: AbortController): Promise<void> {
    let telemetryOptions = {};
    try {
      const engine = this.internalProviders.get(engineId);
      const container = this.getMatchingContainer(engineId, id);

      if (engine) {
        await this.attachToContainer(engine, container);
      }

      return container.restart({ abortSignal: abortController?.signal });
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
  async restartContainersByLabel(
    engineId: string,
    label: string,
    key: string,
    abortController?: AbortController,
  ): Promise<void> {
    let telemetryOptions = {};
    try {
      // Get all the containers using listSimpleContainers
      const containers = await this.listSimpleContainers(abortController);

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
  async stopContainersByLabel(
    engineId: string,
    label: string,
    key: string,
    abortController?: AbortController,
  ): Promise<void> {
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
      await Promise.all(containerIds.map(containerId => this.stopContainer(engineId, containerId, abortController)));
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('stopContainersByLabel', telemetryOptions);
    }
  }

  // Delete all containers that match a certain label and key
  async deleteContainersByLabel(
    engineId: string,
    label: string,
    key: string,
    abortController?: AbortController,
  ): Promise<void> {
    let telemetryOptions = {};
    try {
      // Get all the containers using listSimpleContainers
      const containers = await this.listSimpleContainers();

      // Find all the containers that are using projectLabel and match the projectName
      const containersMatchingProject = containers.filter(container => container.Labels?.[label] === key);

      // Get all the container ids in containersIds
      const containerIds = containersMatchingProject.map(container => container.Id);

      // Delete all the containers in containerIds
      await Promise.all(containerIds.map(containerId => this.deleteContainer(engineId, containerId, abortController)));
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('deleteContainersByLabel', telemetryOptions);
    }
  }

  async logsContainer(
    engineId: string,
    id: string,
    callback: (name: string, data: string) => void,
    abortController?: AbortController,
  ): Promise<void> {
    let telemetryOptions = {};
    let firstMessage = true;
    const container = this.getMatchingContainer(engineId, id);
    container
      .logs({
        follow: true,
        stdout: true,
        stderr: true,
        abortSignal: abortController?.signal,
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
    abortController?: AbortController,
  ): Promise<void> {
    const container = this.getMatchingContainer(engineId, id);

    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: false,
      Cmd: command,
      Tty: false,
    });

    const execStream = await exec.start({ hijack: true, stdin: false, abortSignal: abortController?.signal });

    const wrappedAsStream = (redirect: (data: Buffer) => void): Writable => {
      return new Writable({
        write: (chunk, _encoding, done): void => {
          redirect(chunk);
          done();
        },
      });
    };

    const stdoutEchoStream = wrappedAsStream(onStdout);
    const stderrEchoStream = wrappedAsStream(onStderr);

    container.modem.demuxStream(execStream, stdoutEchoStream, stderrEchoStream);

    return new Promise((resolve, reject) => {
      const check = async (): Promise<void> => {
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
  ): Promise<{ write: (param: string) => void; resize: (w: number, h: number) => void }> {
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

      return {
        write: (param: string): void => {
          execStream.write(param);
        },
        resize: (w: number, h: number): void => {
          exec.resize({ w, h }).catch((err: unknown) => {
            // the resize call sets the size correctly and returns status code 201, but dockerode
            // interprets it as an error
            if ((err as { statusCode: number }).statusCode !== 201) {
              // ignore status code 201
              throw err;
            }
          });
        },
      };
    } catch (error) {
      this.telemetryService.track('shellInContainer.error', error);
      throw error;
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

    const setupStream = (stream: NodeJS.ReadWriteStream): void => {
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

      const getAttachStream = async (): Promise<NodeJS.ReadWriteStream> => {
        // use either podman specific API or compat API
        try {
          const libpod = this.getMatchingPodmanEngineLibPod(engineId);
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

  async createContainer(engineId: string, options: ContainerCreateOptions): Promise<{ id: string; engineId: string }> {
    let telemetryOptions = {};
    try {
      let container: Dockerode.Container;
      if (options.pod) {
        container = await this.createContainerLibPod(engineId, options);
      } else {
        container = await this.createContainerDockerode(engineId, options);
      }

      const engine = this.internalProviders.get(engineId);
      if (engine && (options.start === true || options.start === undefined)) {
        await container.start();
        await this.attachToContainer(engine, container, options.Tty, options.OpenStdin);
      }
      return { id: container.id, engineId };
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('createContainer', telemetryOptions);
    }
  }

  private async createContainerDockerode(
    engineId: string,
    options: ContainerCreateOptions,
  ): Promise<Dockerode.Container> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineId);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    if (!engine.api) {
      throw new Error('no running provider for the matching container');
    }

    // handle EnvFile by adding to Env the other variables
    if (options.EnvFiles) {
      const envFiles = options.EnvFiles || [];
      const envFileContent = await this.getEnvFileParser().parseEnvFiles(envFiles);

      const env = options.Env ?? [];
      env.push(...envFileContent);
      options.Env = env;
      // remove EnvFiles from options
      delete options.EnvFiles;
    }

    return await engine.api.createContainer(options);
  }

  private async createContainerLibPod(engineId: string, options: ContainerCreateOptions): Promise<Dockerode.Container> {
    // will publish in the target engine
    const engine = this.getMatchingPodmanEngine(engineId);
    if (!engine.libpodApi || !engine.api) {
      throw new Error('no podman engine matching this engine');
    }

    // convert env from array of string to an object with key being the env name
    const updatedEnv = options.Env?.reduce((acc: { [key: string]: string }, env) => {
      const [key, value] = env.split('=');
      acc[key] = value;
      return acc;
    }, {});

    let updatedMounts: Array<ContainerCreateMountOption> | undefined;
    if (options.HostConfig?.Mounts || options.HostConfig?.Binds) {
      updatedMounts = [];
      for (const optionMount of options.HostConfig.Mounts ?? []) {
        updatedMounts.push({
          Destination: optionMount.Target,
          Source: optionMount.Source,
          Propagation: optionMount.BindOptions?.Propagation ?? '',
          RW: !optionMount.ReadOnly,
          Type: optionMount.Type,
          Options: optionMount.Mode ? [optionMount.Mode] : [],
        });
      }
      for (const bind of options.HostConfig?.Binds ?? []) {
        const options = this.getContainerCreateMountOptionFromBind(bind);
        if (options) {
          updatedMounts.push(options);
        }
      }
    }

    let netns: ContainerCreateNetNSOption | undefined;
    if (options.HostConfig?.NetworkMode) {
      netns = {
        nsmode: options.HostConfig?.NetworkMode,
      };
    }

    let seccomp_policy: string | undefined;
    let seccomp_profile_path: string | undefined;
    for (const secOpt of options.HostConfig?.SecurityOpt ?? []) {
      if (secOpt === 'empty' || secOpt === 'default' || secOpt === 'image') {
        seccomp_policy = secOpt;
      } else if (secOpt.startsWith('seccomp=')) {
        seccomp_profile_path = secOpt.substring(8).trim();
      }
    }

    let portmappings: Array<ContainerCreatePortMappingOption> | undefined;
    if (options.HostConfig?.PortBindings) {
      portmappings = [];
      for (const [key, value] of Object.entries(options.HostConfig?.PortBindings)) {
        const keyAsNumber = parseInt(key);
        if (Array.isArray(value) && 'HostPort' in value[0] && !isNaN(keyAsNumber)) {
          const valueAsNumber = parseInt(value[0].HostPort);
          if (!isNaN(valueAsNumber)) {
            portmappings.push({
              container_port: keyAsNumber,
              host_port: valueAsNumber,
            });
          }
        }
      }
    }

    let dns_server: Array<Array<number>> | undefined;
    if (options.HostConfig?.ExtraHosts) {
      dns_server = [];
      for (const host of options.HostConfig?.ExtraHosts ?? []) {
        const hostItems = host.split(':');
        if (hostItems.length !== 2) {
          continue;
        }
        dns_server.push(hostItems[1].split('.').map(v => parseInt(v)));
      }
    }

    const podmanOptions: PodmanContainerCreateOptions = {
      name: options.name,
      command: options.Cmd,
      entrypoint: options.Entrypoint,
      env: updatedEnv,
      pod: options.pod,
      hostname: options.Hostname,
      image: options.Image,
      mounts: updatedMounts,
      user: options.User,
      labels: options.Labels,
      work_dir: options.WorkingDir,
      portmappings: portmappings,
      stop_timeout: options.StopTimeout,
      healthconfig: options.HealthCheck,
      restart_policy: options.HostConfig?.RestartPolicy?.Name,
      restart_tries: options.HostConfig?.RestartPolicy?.MaximumRetryCount,
      remove: options.HostConfig?.AutoRemove,
      seccomp_policy: seccomp_policy,
      seccomp_profile_path: seccomp_profile_path,
      cap_add: options.HostConfig?.CapAdd,
      cap_drop: options.HostConfig?.CapDrop,
      privileged: options.HostConfig?.Privileged,
      netns: netns,
      read_only_filesystem: options.HostConfig?.ReadonlyRootfs,
      dns_server: dns_server,
      hostadd: options.HostConfig?.ExtraHosts,
      userns: options.HostConfig?.UsernsMode,
    };

    const container = await engine.libpodApi.createPodmanContainer(podmanOptions);
    return engine.api?.getContainer(container.Id);
  }

  getContainerCreateMountOptionFromBind(bind: string): ContainerCreateMountOption | undefined {
    const bindItems = bind.split(':');
    if (bindItems.length < 2) {
      return undefined;
    }
    const options = ['rbind'];
    let propagation = 'rprivate';
    if (bindItems.length === 3) {
      const flags = bindItems[2].split(',');
      for (const flag of flags) {
        switch (flag) {
          case 'Z':
          case 'z':
            options.push(flag);
            break;
          case 'private':
          case 'rprivate':
          case 'shared':
          case 'rshared':
          case 'slave':
          case 'rslave':
            propagation = flag;
            break;
        }
      }
    }

    return {
      Destination: bindItems[1],
      Source: bindItems[0],
      Propagation: propagation,
      Type: 'bind',
      RW: true,
      Options: options,
    };
  }

  async createVolume(
    selectedProvider?: ProviderContainerConnectionInfo | containerDesktopAPI.ContainerProviderConnection,
    options?: VolumeCreateOptions,
  ): Promise<VolumeCreateResponseInfo> {
    let telemetryOptions = {};
    try {
      let matchingContainerProviderApi: Dockerode;
      if (selectedProvider) {
        // grab all connections
        matchingContainerProviderApi = this.getMatchingEngineFromConnection(selectedProvider);
      } else {
        // Get the first running connection (preference for podman)
        matchingContainerProviderApi = this.getFirstRunningConnection()[1];
      }
      return matchingContainerProviderApi.createVolume(options);
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
      this.telemetryService.track('containerInspect.error', error);
      throw error;
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
    eventCollect: (eventName: 'stream' | 'error' | 'finish', data: string) => void,
    options?: BuildImageOptions,
  ): Promise<unknown> {
    let telemetryOptions = {};
    try {
      let matchingContainerProviderApi: Dockerode;
      if (options?.provider !== undefined) {
        // grab all connections
        matchingContainerProviderApi = this.getMatchingEngineFromConnection(options.provider);
      } else {
        // Get the first running connection (preference for podman)
        matchingContainerProviderApi = this.getFirstRunningConnection()[1];
      }

      // grab auth for all registries
      const registryconfig = this.imageRegistry.getRegistryConfig();
      eventCollect(
        'stream',
        `Uploading the build context from ${containerBuildContextDirectory}...Can take a while...\r\n`,
      );
      const tarStream = tar.pack(containerBuildContextDirectory);
      if (isWindows() && options?.containerFile !== undefined) {
        options.containerFile = options.containerFile.replace(/\\/g, '/');
      }

      let streamingPromise: NodeJS.ReadableStream;
      try {
        const buildOptions: ImageBuildOptions = {
          registryconfig,
          abortSignal: options?.abortController?.signal,
          dockerfile: options?.containerFile,
          t: options?.tag,
          platform: options?.platform,
          remote: options?.remote,
          q: options?.q,
          rm: options?.rm,
          forcerm: options?.forcerm,
          memory: options?.memory,
          memswap: options?.memswap,
          cpushares: options?.cpushares,
          cpusetcpus: options?.cpusetcpus,
          cpuperiod: options?.cpuperiod,
          cpuquota: options?.cpuquota,
          shmsize: options?.shmsize,
          squash: options?.squash,
          networkmode: options?.networkmode,
          target: options?.target,
          outputs: options?.outputs,
          nocache: options?.nocache,
        };
        if (options?.extrahosts) {
          buildOptions.extrahosts = options.extrahosts;
        }
        if (options?.cachefrom) {
          buildOptions.cachefrom = options.cachefrom;
        }
        if (options?.buildargs) {
          buildOptions.buildargs = options.buildargs;
        }
        if (options?.labels) {
          buildOptions.labels = options.labels;
        }
        if (options?.pull) {
          buildOptions.pull = options.pull;
        }
        streamingPromise = await matchingContainerProviderApi.buildImage(tarStream, buildOptions);
      } catch (error: unknown) {
        console.log('error in buildImage', error);
        const errorMessage = error instanceof Error ? error.message : '' + error;
        eventCollect('error', errorMessage);
        throw error;
      }
      eventCollect('stream', `Building ${options?.tag}...\r\n`);
      // eslint-disable-next-line @typescript-eslint/ban-types
      let resolve: (output: {}) => void;
      let reject: (err: Error) => void;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });

      // eslint-disable-next-line @typescript-eslint/ban-types
      const onFinished = (err: Error | null, output: {}): void => {
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
      }): void => {
        if (event.stream) {
          eventCollect('stream', event.stream);
        } else if (event.error) {
          eventCollect('error', event.error);
        }
      };

      matchingContainerProviderApi.modem.followProgress(streamingPromise, onFinished, onProgress);
      return promise;
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track('buildImage', telemetryOptions);
    }
  }

  getEnvFileParser(): EnvfileParser {
    return this.envfileParser;
  }

  async info(engineId: string): Promise<containerDesktopAPI.ContainerEngineInfo> {
    const provider = this.internalProviders.get(engineId);
    if (!provider) {
      throw new Error('no engine matching this container');
    }
    if (!provider.api) {
      throw new Error('no running provider for the matching container');
    }
    if (provider.libpodApi) {
      const podmanInfo = await provider.libpodApi.podmanInfo();
      return {
        engineId: provider.id,
        engineName: provider.name,
        engineType: provider.connection.type,
        cpus: podmanInfo.host.cpus,
        cpuIdle: podmanInfo.host.cpuUtilization.idlePercent,
        memory: podmanInfo.host.memTotal,
        memoryUsed: podmanInfo.host.memTotal - podmanInfo.host.memFree,
        diskSize: podmanInfo.store.graphRootAllocated,
        diskUsed: podmanInfo.store.graphRootUsed,
      };
    } else {
      const dockerInfo = await provider.api.info();
      return {
        engineId: provider.id,
        engineName: provider.name,
        engineType: provider.connection.type,
        cpus: dockerInfo.NCPU,
        memory: dockerInfo.MemTotal,
      };
    }
  }

  async listInfos(options?: containerDesktopAPI.ListInfosOptions): Promise<containerDesktopAPI.ContainerEngineInfo[]> {
    let providers: InternalContainerProvider[];
    if (!options?.provider) {
      providers = Array.from(this.internalProviders.values());
    } else {
      providers = [this.getMatchingContainerProvider(options?.provider)];
    }
    const infos = await Promise.all(
      Array.from(providers).map(async provider => {
        try {
          return await this.info(provider.id);
        } catch (error) {
          console.error('error getting info for engine', provider.name, error);
          return undefined;
        }
      }),
    );
    return infos.filter((item): item is containerDesktopAPI.ContainerEngineInfo => !!item);
  }

  async containerExist(id: string): Promise<boolean> {
    const containers = await this.listContainers();
    return containers.some(container => container.Id === id);
  }

  async imageExist(id: string, engineId: string, tag: string): Promise<boolean> {
    const images = await this.listImages();
    const imageInfo = images.find(c => c.Id === id && c.engineId === engineId);
    return imageInfo?.RepoTags?.some(repoTag => repoTag === tag) ?? false;
  }

  async volumeExist(name: string, engineId: string): Promise<boolean> {
    const volumes = await this.listVolumes();
    const allVolumes = volumes.map(volume => volume.Volumes).flat();
    return allVolumes.some(volume => volume.Name === name && volume.engineId === engineId);
  }
  async podExist(kind: string, name: string, engineId: string): Promise<boolean> {
    const pods = await this.listPods();
    return pods.some(
      podInPods => podInPods.Name === name && podInPods.engineId === engineId && kind === podInPods.kind,
    );
  }

  async exportContainer(engineId: string, options: ContainerExportOptions): Promise<void> {
    // need to find the container engine of the container
    const engine = this.internalProviders.get(engineId);
    if (!engine) {
      throw new Error('no engine matching this container');
    }
    if (!engine.api) {
      throw new Error('no running provider for the matching container');
    }

    // retrieve the container and export it by copying the content to the final destination
    const containerObject = engine.api.getContainer(options.id);
    const exportResult = await containerObject.export();
    const fileWriteStream = fs.createWriteStream(options.outputTarget, {
      flags: 'w',
    });

    return new Promise<void>((resolve, reject) => {
      exportResult.on('close', () => {
        fileWriteStream.close();
        resolve();
      });

      exportResult.on('data', chunk => {
        fileWriteStream.write(chunk);
      });

      exportResult.on('error', error => {
        reject(error);
      });
    });
  }

  async importContainer(options: ContainerImportOptions): Promise<void> {
    const matchingEngine = this.getMatchingEngineFromConnection(options.provider);
    if (!matchingEngine) {
      throw new Error('no running engine for the matching provider');
    }

    const repoTag = options.imageTag.split(':');
    await matchingEngine.importImage(options.archivePath, {
      repo: repoTag[0],
      tag: repoTag[1] ?? 'latest',
    });
  }

  async saveImages(options: ImagesSaveOptions): Promise<void> {
    // group the images by engineId
    const mapImages: Map<string, string[]> = options.images.reduce((map, img) => {
      const imgIds = map.get(img.engineId) ?? [];
      imgIds.push(img.id);
      map.set(img.engineId, imgIds);
      return map;
    }, new Map<string, string[]>());

    const isMultiProvider = mapImages.size > 1;
    let errors = '';

    for (const imageGroup of mapImages.entries()) {
      const engine = this.internalProviders.get(imageGroup[0]);
      if (!engine?.api) {
        errors += `Unable to save images ${imageGroup[1].join(', ')}. Error: No running provider for the matching images\n`;
        continue;
      }
      if ('getImages' in engine.api && typeof engine.api.getImages === 'function') {
        const imagesStream: NodeJS.ReadableStream = await engine.api.getImages({
          names: imageGroup[1],
        });

        try {
          let targetPath = options.outputTarget;
          if (isMultiProvider) {
            targetPath = path.join(
              options.outputTarget,
              `${imageGroup[0]}-images-${moment().format('YYYYMMDDHHmmss')}.tar`,
            );
          }
          await pipeline(imagesStream, fs.createWriteStream(targetPath));
        } catch (e) {
          errors += `Unable to save images ${imageGroup[1].join(', ')}. Error: ${String(e)}\n`;
        }
      }
    }

    if (errors !== '') {
      return Promise.reject(errors);
    }
  }

  async loadImages(options: ImageLoadOptions): Promise<void> {
    const matchingEngine = this.getMatchingEngineFromConnection(options.provider);
    if (!matchingEngine) {
      throw new Error('no running engine for the matching provider');
    }

    let errors = '';

    for (const archive of options.archives) {
      try {
        await matchingEngine.loadImage(archive);
      } catch (e) {
        errors += `Unable to load ${archive}. Error: ${String(e)}\n`;
      }
    }

    if (errors !== '') {
      return Promise.reject(errors);
    }
  }
}
