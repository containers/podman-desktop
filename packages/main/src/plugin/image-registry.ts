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

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import { createWriteStream } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';

import type * as containerDesktopAPI from '@podman-desktop/api';
import type * as Dockerode from 'dockerode';
import * as fzstd from 'fzstd';
import type { HttpsOptions, OptionsOfTextResponseBody } from 'got';
import got, { HTTPError, RequestError } from 'got';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import * as nodeTar from 'tar';
import validator from 'validator';

import type { ImageSearchOptions, ImageSearchResult } from '/@api/image-registry.js';

import { isMac, isWindows } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { Certificates } from './certificates.js';
import { Emitter } from './events/emitter.js';
import type { Proxy } from './proxy.js';
import type { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';

export interface RegistryAuthInfo {
  authUrl: string;
  service?: string;
  scope?: string;
  scheme: string;
}

export class ImageRegistry {
  private registries: containerDesktopAPI.Registry[] = [];
  private suggestedRegistries: containerDesktopAPI.RegistrySuggestedProvider[] = [];
  private providers: Map<string, containerDesktopAPI.RegistryProvider> = new Map();

  private readonly _onDidRegisterRegistry = new Emitter<containerDesktopAPI.Registry>();
  private readonly _onDidUpdateRegistry = new Emitter<containerDesktopAPI.Registry>();
  private readonly _onDidUnregisterRegistry = new Emitter<containerDesktopAPI.Registry>();

  readonly onDidRegisterRegistry: containerDesktopAPI.Event<containerDesktopAPI.Registry> =
    this._onDidRegisterRegistry.event;
  readonly onDidUpdateRegistry: containerDesktopAPI.Event<containerDesktopAPI.Registry> =
    this._onDidUpdateRegistry.event;
  readonly onDidUnregisterRegistry: containerDesktopAPI.Event<containerDesktopAPI.Registry> =
    this._onDidUnregisterRegistry.event;

  private proxySettings: containerDesktopAPI.ProxySettings | undefined;
  private proxyEnabled: boolean;

  constructor(
    private apiSender: ApiSenderType,
    private telemetryService: Telemetry,
    private certificates: Certificates,
    private proxy: Proxy,
  ) {
    this.proxy.onDidUpdateProxy(settings => {
      this.proxySettings = settings;
    });

    this.proxy.onDidStateChange(state => {
      this.proxyEnabled = state;
    });

    this.proxyEnabled = this.proxy.isEnabled();
    if (this.proxyEnabled) {
      this.proxySettings = this.proxy.proxy;
    }
  }

  extractRegistryServerFromImage(imageName: string): string | undefined {
    // check if image is a valid identifier for dockerhub
    const splitParts = imageName.split('/');
    if (
      splitParts.length === 1 ||
      (!splitParts[0].includes('.') && !splitParts[0].includes(':') && splitParts[0] !== 'localhost')
    ) {
      return 'docker.io';
    } else {
      // if image name contains two /, we assume there is a registry at the beginning
      return splitParts[0];
    }
  }

  /**
   * Provides authentication information for the given image if any.
   */
  getAuthconfigForImage(imageName: string): Dockerode.AuthConfig | undefined {
    const registryServer = this.extractRegistryServerFromImage(imageName);
    if (registryServer) {
      return this.getAuthconfigForServer(registryServer);
    }
    return undefined;
  }

  getAuthconfigForServer(registryServer: string): Dockerode.AuthConfig | undefined {
    const matchingUrl = registryServer;
    // grab authentication data for this server
    const matchingRegistry = this.getRegistries().find(
      registry => registry.serverUrl.toLowerCase() === matchingUrl.toLowerCase(),
    );
    if (matchingRegistry) {
      let serveraddress = matchingRegistry.serverUrl.toLowerCase();
      if (serveraddress === 'docker.io') {
        serveraddress = 'https://index.docker.io/v2/';
      }
      return {
        username: matchingRegistry.username,
        password: matchingRegistry.secret,
        serveraddress,
      };
    }
  }

  /**
   * Provides authentication information from all registries.
   */
  getRegistryConfig(): Dockerode.RegistryConfig {
    const registryConfig: Dockerode.RegistryConfig = {};
    for (const registry of this.getRegistries()) {
      const serveraddress = registry.serverUrl.toLowerCase();
      registryConfig[serveraddress] = {
        username: registry.username,
        password: registry.secret,
      };
    }
    return registryConfig;
  }

  getRegistryHash(registry: { serverUrl: string }): string {
    return crypto.createHash('sha512').update(registry.serverUrl).digest('hex');
  }

  registerRegistry(registry: containerDesktopAPI.Registry): Disposable {
    const found = this.registries.find(
      reg =>
        reg.source === registry.source && reg.serverUrl === registry.serverUrl && reg.username === registry.username,
    );
    if (found) {
      // Ignore and don't register - extension may register registries every time it is restarted
      console.log('Registry already registered, skipping registration');
      return Disposable.noop();
    }
    this.registries = [...this.registries, registry];
    this.telemetryService.track('registerRegistry', {
      serverUrl: this.getRegistryHash(registry),
      total: this.registries.length,
    });
    this.apiSender.send('registry-register', registry);
    this._onDidRegisterRegistry.fire(Object.freeze({ ...registry }));
    return Disposable.create(() => {
      this.unregisterRegistry(registry);
    });
  }

  suggestRegistry(registry: containerDesktopAPI.RegistrySuggestedProvider): Disposable {
    // Do not add it to the list if it's already been suggested by name & URL (Quay, DockerHub, etc.).
    // this may have been done by another extension.
    if (this.suggestedRegistries.find(reg => reg.url === registry.url && reg.name === registry.name)) {
      // Ignore and don't register
      console.log(`Registry already registered: ${registry.url}`);
      return Disposable.noop();
    }

    this.suggestedRegistries.push(registry);
    this.apiSender.send('registry-update', registry);

    // Create a disposable to remove the registry from the list
    return Disposable.create(() => {
      this.unsuggestRegistry(registry);
    });
  }

  unsuggestRegistry(registry: containerDesktopAPI.RegistrySuggestedProvider): void {
    // Find the registry within this.suggestedRegistries[] and remove it
    const index = this.suggestedRegistries.findIndex(reg => reg.url === registry.url && reg.name === registry.name);
    if (index > -1) {
      this.suggestedRegistries.splice(index, 1);
    }

    // Fire an update to the UI to remove the suggested registry
    this.apiSender.send('registry-update', registry);
  }

  unregisterRegistry(registry: containerDesktopAPI.Registry): void {
    const filtered = this.registries.filter(
      registryItem => registryItem.serverUrl !== registry.serverUrl || registry.source !== registryItem.source,
    );
    if (filtered.length !== this.registries.length) {
      this._onDidUnregisterRegistry.fire(Object.freeze({ ...registry }));
      this.registries = filtered;
      this.apiSender.send('registry-unregister', registry);
    }
    this.telemetryService.track('unregisterRegistry', {
      serverUrl: this.getRegistryHash(registry),
      total: this.registries.length,
    });
  }

  getRegistries(): readonly containerDesktopAPI.Registry[] {
    return this.registries;
  }

  getSuggestedRegistries(): containerDesktopAPI.RegistrySuggestedProvider[] {
    return this.suggestedRegistries;
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  registerRegistryProvider(registerRegistryProvider: containerDesktopAPI.RegistryProvider): Disposable {
    this.providers.set(registerRegistryProvider.name, registerRegistryProvider);
    return Disposable.create(() => {
      this.providers.delete(registerRegistryProvider.name);
    });
  }

  async createRegistry(
    providerName: string,
    registryCreateOptions: containerDesktopAPI.RegistryCreateOptions,
  ): Promise<Disposable> {
    let telemetryOptions = {};
    try {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const exists = this.registries.find(
        registry => registry.serverUrl === registryCreateOptions.serverUrl && registry.source === providerName,
      );
      if (exists) {
        throw new Error(`Registry ${registryCreateOptions.serverUrl} already exists`);
      }

      await this.checkCredentials(
        registryCreateOptions.serverUrl,
        registryCreateOptions.username,
        registryCreateOptions.secret,
        registryCreateOptions.insecure,
      );
      const registry = provider.create(registryCreateOptions);
      return this.registerRegistry(registry);
    } catch (error) {
      telemetryOptions = { error: error };
      throw error;
    } finally {
      this.telemetryService.track(
        'createRegistry',
        Object.assign(
          {
            serverUrlHash: this.getRegistryHash(registryCreateOptions),
            total: this.registries.length,
          },
          telemetryOptions,
        ),
      );
    }
  }

  async updateRegistry(registry: containerDesktopAPI.Registry): Promise<void> {
    const matchingRegistry = this.registries.find(
      existingRegistry =>
        registry.serverUrl === existingRegistry.serverUrl && registry.source === existingRegistry.source,
    );
    if (!matchingRegistry) {
      throw new Error(`Registry ${registry.serverUrl} was not found`);
    }
    if (matchingRegistry.username !== registry.username || matchingRegistry.secret !== registry.secret) {
      await this.checkCredentials(matchingRegistry.serverUrl, registry.username, registry.secret, registry.insecure);
    }
    matchingRegistry.username = registry.username;
    matchingRegistry.secret = registry.secret;
    this.telemetryService.track('updateRegistry', {
      serverUrl: this.getRegistryHash(matchingRegistry),
      total: this.registries.length,
    });
    this.apiSender.send('registry-update', registry);
    this._onDidUpdateRegistry.fire(Object.freeze(registry));
  }

  // grab authentication data from the www-authenticate header
  // undefined if not able to grab data
  extractAuthData(wwwAuthenticate: string): RegistryAuthInfo | undefined {
    // example of www-authenticate header
    // Www-Authenticate: Bearer realm="https://auth.docker.io/token",service="registry.docker.io",scope="repository:samalba/my-app:pull,push"
    // need to extract realm, service and scope parameters with a regexp
    const WWW_AUTH_REGEXP =
      /(?<scheme>Bearer|Basic|BASIC) realm="(?<realm>[^"]+)"(,service="(?<service>[^"]+)")?(,scope="(?<scope>[^"]+)")?/;

    const parsed = WWW_AUTH_REGEXP.exec(wwwAuthenticate);
    if (parsed?.groups) {
      const { realm, service, scope, scheme } = parsed.groups;
      return { authUrl: realm, service, scope, scheme };
    }
    return undefined;
  }

  getOptions(insecure?: boolean): OptionsOfTextResponseBody {
    const httpsOptions: HttpsOptions = {};
    const options: OptionsOfTextResponseBody = {
      https: httpsOptions,
    };

    if (options.https) {
      options.https.certificateAuthority = this.certificates.getAllCertificates();
      if (insecure) {
        options.https.rejectUnauthorized = false;
      }
    }

    if (this.proxyEnabled) {
      // use proxy when performing got request
      const proxy = this.proxySettings;
      const httpProxyUrl = proxy?.httpProxy;
      const httpsProxyUrl = proxy?.httpsProxy;

      if (httpProxyUrl) {
        if (!options.agent) {
          options.agent = {};
        }
        try {
          options.agent.http = new HttpProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: httpProxyUrl,
          });
        } catch (error) {
          throw new Error(`Failed to create http proxy agent from ${httpProxyUrl}: ${error}`);
        }
      }
      if (httpsProxyUrl) {
        if (!options.agent) {
          options.agent = {};
        }
        try {
          options.agent.https = new HttpsProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: httpsProxyUrl,
          });
        } catch (error) {
          throw new Error(`Failed to create https proxy agent from ${httpsProxyUrl}: ${error}`);
        }
      }
    }
    return options;
  }

  // Adds the missing registry URL to the image name
  // examples:
  // httpd --> name library/httpd, tag latest, registryURL https://index.docker.io/v2/
  // ghcr.io/repo/image:1.2.3 -> name repo/image, tag 1.2.3, registryURL https://ghcr.io/v2/

  extractImageDataFromImageName(imageName: string): ImageRegistryNameTag {
    if (!imageName) {
      throw new Error('Image name is empty');
    }

    // check that there is no protocol prefix in the image name
    // like http:// or https://, etc.
    if (imageName.match(/^[a-zA-Z0-9+.-]+:\/\//)) {
      throw new Error(`Invalid image name: ${imageName}`);
    }

    // do we have a tag at the end with last
    let tag = 'latest';
    const lastColon = imageName.lastIndexOf(':');
    const lastSlash = imageName.lastIndexOf('/');
    if (lastColon !== -1 && lastColon > lastSlash) {
      tag = imageName.substring(lastColon + 1);
      imageName = imageName.substring(0, lastColon);
    }

    let registry = '';
    let name = '';

    const slashes = imageName.split('/');
    let valid = false;
    if (slashes.length === 1) {
      registry = 'index.docker.io';
      name = `library/${slashes[0]}`;
      valid = true;
    } else if (slashes.length === 2) {
      if (slashes[0].startsWith('localhost')) {
        registry = slashes[0];
        name = slashes[1];
      } else {
        registry = 'index.docker.io';
        name = `${slashes[0]}/${slashes[1]}`;
      }
      valid = true;
    } else if (slashes.length > 2) {
      registry = slashes[0];
      name = `${slashes[1]}/${slashes[2]}`;
      valid = true;
    }
    if (!valid) {
      throw new Error(`Invalid image Name: ${imageName}`);
    }
    const registryURL = `https://${registry}/v2`;
    return {
      registry,
      registryURL,
      name,
      tag,
    };
  }

  // Fetch the image Labels from the registry for a given image URL
  async getImageConfigLabels(imageName: string): Promise<{ [key: string]: unknown }> {
    const imageData = this.extractImageDataFromImageName(imageName);

    // grab auth info from the registry
    const authInfo = await this.getAuthInfo(imageData.registry);
    const token = await this.getToken(authInfo, imageData);
    if (authInfo.scheme.toLowerCase() !== 'bearer') {
      throw new Error(`Unsupported auth scheme: ${authInfo.scheme}`);
    }

    // now, grab manifest for the given image URL
    const manifest = await this.getManifest(imageData, token);

    // now, search a config manifest
    const configManifest = manifest.config;
    if (!configManifest) {
      throw new Error(`No config manifest found for ${imageName}`);
    }
    if (!configManifest.digest) {
      throw new Error(`No digest found for config manifest for ${imageName}`);
    }
    // check the media type
    if (
      configManifest.mediaType !== 'application/vnd.oci.image.config.v1+json' &&
      configManifest.mediaType !== 'application/vnd.docker.container.image.v1+json'
    ) {
      throw new Error(`Invalid media type for config manifest for ${imageName}`);
    }

    // now pull the blob from the registry
    const config = await this.fetchOciImageConfig(imageData, configManifest.digest, token);

    // get labels from the config
    return config?.config?.Labels;
  }

  async downloadAndExtractImage(
    imageName: string,
    destFolder: string,
    logger: (message: string) => void,
  ): Promise<void> {
    const imageData = this.extractImageDataFromImageName(imageName);

    // grab auth info from the registry
    const authInfo = await this.getAuthInfo(imageData.registry);
    const token = await this.getToken(authInfo, imageData);
    if (authInfo.scheme.toLowerCase() !== 'bearer') {
      throw new Error(`Unsupported auth scheme: ${authInfo.scheme}`);
    }

    // now, grab manifest for the given image URL
    const manifest = await this.getManifest(imageData, token);

    // now, get all layers 'application/vnd.oci.image.layer.v1.tar+gzip' and download and expand them
    const gzipLayers = manifest.layers.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer: any) =>
        layer.mediaType === 'application/vnd.oci.image.layer.v1.tar+gzip' ||
        layer.mediaType === 'application/vnd.docker.image.rootfs.diff.tar.gzip',
    );

    const zstdLayers = manifest.layers.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layer: any) => layer.mediaType === 'application/vnd.oci.image.layer.v1.tar+zstd',
    );

    let layers: { digest: string; size: number; mediaType: string }[] = [];
    if (zstdLayers.length > 0) {
      // using zstd layers
      layers = zstdLayers;
    } else if (gzipLayers.length > 0) {
      // using gzip layers
      layers = gzipLayers;
    } else {
      throw new Error(`No gzip or zstd layers found for the image ${imageName}`);
    }

    // total size of all layers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalSize = layers.reduce((acc: number, layer: any) => acc + layer.size, 0);

    // download each layer and extract it to the destination folder
    let currentDownloaded = 0;
    for (const layer of layers) {
      const layerDigest = layer.digest;
      let compressionType: 'gzip' | 'zstd' = 'gzip';
      if (layer.mediaType === 'application/vnd.oci.image.layer.v1.tar+zstd') {
        compressionType = 'zstd';
      }
      await this.fetchAndExtractLayer(
        imageData,
        layerDigest,
        compressionType,
        destFolder,
        token,
        currentDownloaded,
        totalSize,
        logger,
      );
      currentDownloaded += layer.size;
    }
  }

  protected async fetchAndExtractLayer(
    imageData: ImageRegistryNameTag,
    digest: string,
    compressionType: 'gzip' | 'zstd',
    destFolder: string,
    token: string,
    currentDownloaded: number,
    totalSize: number,
    logger: (message: string) => void,
  ): Promise<void> {
    const options = this.getOptions();
    options.headers = options.headers ?? {};

    // add the Bearer token
    options.headers.Authorization = `Bearer ${token}`;

    // replace all special characters with _ in digest
    const digestWithoutSpecialChars = digest.replace(/[^a-zA-Z0-9]/g, '_');

    if (!fs.existsSync(destFolder)) {
      await fs.promises.mkdir(destFolder, { recursive: true });
    }

    const suffix = compressionType === 'gzip' ? '.tar' : '.zst';
    const tmpFileName = path.resolve(os.tmpdir(), `${digestWithoutSpecialChars}${suffix}`);

    // ensure the folder exists
    const parentDir = path.dirname(tmpFileName);
    if (!fs.existsSync(parentDir)) {
      await fs.promises.mkdir(parentDir, { recursive: true });
    }

    const blobURL = `${imageData.registryURL}/${imageData.name}/blobs/${digest}`;

    const readStream = got.stream(blobURL, { ...options, isStream: true });

    readStream.on('downloadProgress', ({ transferred }) => {
      const globalPercentage = Math.round(((transferred + currentDownloaded) / totalSize) * 100);
      logger(
        `Downloading ${digest}${suffix} - ${globalPercentage}% - (${transferred + currentDownloaded}/${totalSize})`,
      );
    });
    await pipeline(readStream, createWriteStream(tmpFileName));
    // in case of zstd, we need to unpack the file first
    if (compressionType === 'zstd') {
      //use fstd library to extract the file
      const content = await fs.promises.readFile(tmpFileName);
      const decompressed = fzstd.decompress(content);
      const unpackedFileName = tmpFileName.replace('.zst', '.tar');
      await fs.promises.writeFile(unpackedFileName, decompressed);
      await nodeTar.extract({ file: unpackedFileName, cwd: destFolder });
      // remove the temporary file
      await fs.promises.rm(tmpFileName);
    } else {
      await nodeTar.extract({ file: tmpFileName, cwd: destFolder });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async fetchOciImageConfig(imageData: ImageRegistryNameTag, digest: string, token: string): Promise<any> {
    const options = this.getOptions();
    options.headers = options.headers ?? {};
    // add the Bearer token
    options.headers.Authorization = `Bearer ${token}`;

    // say we want to return JSON from got
    const blobURL = `${imageData.registryURL}/${imageData.name}/blobs/${digest}`;

    let jsonConfig: string | undefined;
    try {
      jsonConfig = await got.get(blobURL, options).json();
    } catch (requestErr) {
      if (
        requestErr instanceof RequestError &&
        (requestErr.response?.statusCode === 401 || requestErr.response?.statusCode === 403)
      ) {
        throw Error('Unable to get access');
      } else if (requestErr instanceof Error) {
        throw Error(requestErr.message);
      }
    }
    return jsonConfig;
  }

  // internal method that can loop to get the manifest specific to the arch/platform
  protected async getManifestFromURL(
    manifestURL: string,
    imageData: ImageRegistryNameTag,
    token: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const options = this.getOptions();
    options.headers = options.headers ?? {};

    // add the Bearer token
    options.headers.Authorization = `Bearer ${token}`;

    // add the manifest accept headers
    const acceptHeaders = [];
    if (options.headers.Accept) {
      if (typeof options.headers.Accept === 'string') {
        acceptHeaders.push(options.headers.Accept);
      } else if (Array.isArray(options.headers.Accept)) {
        acceptHeaders.push(...options.headers.Accept);
      }
    }
    acceptHeaders.push('application/vnd.oci.image.manifest.v1+json');
    acceptHeaders.push('application/vnd.docker.distribution.manifest.v2+json');
    acceptHeaders.push('application/vnd.docker.distribution.manifest.v1+prettyjws');
    acceptHeaders.push('application/vnd.docker.distribution.manifest.v1+json');
    acceptHeaders.push('application/vnd.docker.distribution.manifest.list.v2+json');
    acceptHeaders.push('application/vnd.oci.image.index.v1+json');

    options.headers.Accept = acceptHeaders;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedManifest: any;
    try {
      parsedManifest = await got.get(manifestURL, options).json();
    } catch (requestErr) {
      if (
        requestErr instanceof RequestError &&
        (requestErr.response?.statusCode === 401 || requestErr.response?.statusCode === 403)
      ) {
        throw Error('Unable to get access');
      } else if (requestErr instanceof Error) {
        throw Error(requestErr.message);
      }
    }

    // https://github.com/opencontainers/image-spec/blob/main/image-index.md
    // check schemaVersion and (mediaType of the manifest or if it contains manifests field being an array)
    if (
      parsedManifest.schemaVersion === 2 &&
      (parsedManifest.mediaType === 'application/vnd.oci.image.index.v1+json' ||
        parsedManifest.mediaType === 'application/vnd.docker.distribution.manifest.list.v2+json' ||
        Array.isArray(parsedManifest.manifests))
    ) {
      // need to grab correct manifest from the index corresponding to our platform
      let platformArch: 'amd64' | 'arm64' = 'amd64';
      const arch = os.arch();
      if (arch === 'x64') {
        // default to amd64
        platformArch = 'amd64';
      } else if (arch === 'arm64') {
        platformArch = 'arm64';
      }

      let platformOs: 'linux' | 'windows' | 'darwin' = 'linux';
      if (isMac()) {
        platformOs = 'darwin';
      } else if (isWindows()) {
        platformOs = 'windows';
      }
      // find the manifest corresponding to our platform
      const matchedManifest = this.getBestManifest(
        parsedManifest.manifests.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (m: any) =>
            m.mediaType === 'application/vnd.oci.image.manifest.v1+json' ||
            m.mediaType === 'application/vnd.docker.distribution.manifest.v2+json',
        ),
        platformArch,
        platformOs,
      );

      // need to grab that manifest
      if (matchedManifest) {
        const matchedManifestDigest = matchedManifest.digest;
        // now, grab the manifest corresponding to the digest
        const manifestURL = `${imageData.registryURL}/${imageData.name}/manifests/${matchedManifestDigest}`;
        return this.getManifestFromURL(manifestURL, imageData, token);
      }
      throw new Error(
        `Unable to find a manifest corresponding to the platform os/architecture ${platformOs}/${platformArch}`,
      );
    }
    return parsedManifest;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBestManifest(manifests: any[], wantedArch: string, wantedOs: string): any {
    // eslint-disable-next-line etc/no-commented-out-code
    // manifestsMap [os] [arch] = manifest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manifestsMap = new Map<string, Map<string, any>>();
    manifests.forEach(manifest => {
      const arch = manifest.platform.architecture;
      const os = manifest.platform.os;
      let manifestsForOs = manifestsMap.get(os);
      if (!manifestsForOs) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        manifestsForOs = new Map<string, any>();
      }
      manifestsForOs.set(arch, manifest);
      manifestsMap.set(os, manifestsForOs);
    });

    let wantedOses = manifestsMap.get(wantedOs);
    if (!wantedOses) {
      wantedOses = manifestsMap.get('linux');
    }
    if (!wantedOses) {
      return;
    }

    let wanted = wantedOses.get(wantedArch);
    if (!wanted) {
      if (wantedOses.size === 1) {
        wanted = wantedOses.get(wantedOses.keys().next().value);
      } else {
        wanted = wantedOses.get('amd64');
      }
    }
    return wanted;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getManifest(imageData: ImageRegistryNameTag, token: string): Promise<any> {
    const manifestURL = `${imageData.registryURL}/${imageData.name}/manifests/${imageData.tag}`;
    return this.getManifestFromURL(manifestURL, imageData, token);
  }

  async getAuthInfo(serviceUrl: string, insecure?: boolean): Promise<{ authUrl: string; scheme: string }> {
    let registryUrl: string;
    const options = this.getOptions(insecure);

    if (serviceUrl.includes('docker.io')) {
      registryUrl = 'https://index.docker.io/v2/';
    } else {
      registryUrl = `${serviceUrl}/v2/`;

      if (!registryUrl.startsWith('http')) {
        registryUrl = `https://${registryUrl}`;
      }
    }

    let authUrl: string | undefined;
    let scheme = '';

    try {
      await got.get(registryUrl, options);
    } catch (requestErr) {
      if (requestErr instanceof HTTPError) {
        const wwwAuthenticate = requestErr.response?.headers['www-authenticate'];
        if (wwwAuthenticate) {
          const authInfo = this.extractAuthData(wwwAuthenticate);
          if (authInfo) {
            scheme = authInfo.scheme?.toLowerCase();
            // in case of basic auth, we use directly the registry URL
            if (scheme === 'basic') {
              return { authUrl: registryUrl, scheme };
            }
            const url = new URL(authInfo.authUrl);
            if (authInfo.service) {
              url.searchParams.set('service', authInfo.service);
            }
            if (authInfo.scope) {
              url.searchParams.set('scope', authInfo.scope);
            }
            authUrl = url.toString();
          }
        } else {
          throw new Error(`Unable to find auth info for ${registryUrl}. Error: ${requestErr.message}`);
        }
      } else {
        throw new Error(`Unable to find auth info for ${registryUrl}. Error: ${requestErr}`);
      }
    }

    if (authUrl === undefined) {
      throw Error('Not a valid registry.');
    }

    return { authUrl, scheme };
  }

  async checkCredentials(serviceUrl: string, username: string, password: string, insecure?: boolean): Promise<void> {
    // When checking the validation of the URL, do not require a TLD (ex. .com, .org, etc.)
    // in case we are passing in a local test registry such as http://localhost:5000
    const urlOptions = {
      require_tld: false,
    };
    const isUrl = validator.default.isURL(serviceUrl, urlOptions);

    // Check if the URL is undefined or not a valid URL
    if (serviceUrl === undefined || !isUrl) {
      throw Error(
        'The format of the Registry Location is incorrect.\nPlease use the format "registry.location.com" and try again.',
      );
    }

    if (!username) {
      throw Error('Username should not be empty.');
    }

    if (!password) {
      throw Error('Password should not be empty.');
    }

    const { authUrl, scheme } = await this.getAuthInfo(serviceUrl, insecure);

    if (authUrl !== undefined) {
      await this.doCheckCredentials(scheme, authUrl, username, password, insecure);
    }
  }

  async getToken(authInfo: { authUrl: string; scheme: string }, imageData: ImageRegistryNameTag): Promise<string> {
    let rawResponse: string | undefined;
    const options = this.getOptions();

    // if we have auth for this registry, add basic auth to the headers
    const authServer = this.getAuthconfigForServer(imageData.registry);
    if (authServer) {
      options.headers = options.headers ?? {};
      const loginAndPassWord = `${authServer.username}:${authServer.password}`;
      options.headers.Authorization = `Basic ${Buffer.from(loginAndPassWord).toString('base64')}`;
    }
    // need to replace repository%3Auser with repository:user coming from imageData
    let tokenUrl = authInfo.authUrl.replace('user%2Fimage', imageData.name.replaceAll('/', '%2F'));

    // no scope ? we add it
    if (!tokenUrl.includes('scope')) {
      const url = new URL(tokenUrl);
      url.searchParams.set('scope', `repository:${imageData.name}:pull`);
      tokenUrl = url.toString();
    }
    try {
      const { body } = await got.get(tokenUrl, options);
      rawResponse = body;
    } catch (requestErr) {
      if (
        requestErr instanceof RequestError &&
        (requestErr.response?.statusCode === 401 || requestErr.response?.statusCode === 403)
      ) {
        throw Error('Required authentication. Not supported.');
      } else if (requestErr instanceof Error) {
        throw Error(requestErr.message);
      }
    }
    if (!rawResponse?.includes('token')) {
      throw Error('Unable to validate registry URL.');
    }
    const response = JSON.parse(rawResponse);
    return response.token;
  }

  async doCheckCredentials(
    scheme: string,
    authUrl: string,
    username: string,
    password: string,
    insecure?: boolean,
  ): Promise<void> {
    const options = this.getOptions(insecure);

    let rawResponse: string | undefined;
    // add credentials in the header
    // encode username:password in base64
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    options.headers = {
      Authorization: `Basic ${token}`,
    };
    try {
      const { body } = await got.get(authUrl, options);
      rawResponse = body;
    } catch (requestErr) {
      if (
        requestErr instanceof RequestError &&
        (requestErr.response?.statusCode === 401 || requestErr.response?.statusCode === 403)
      ) {
        throw Error('Wrong Username or Password.');
      } else if (requestErr instanceof Error) {
        throw Error(requestErr.message);
      }
    }

    // no error with basic scheme, it means it's a valid connection
    if (scheme === 'basic') {
      return;
    }
    if (!rawResponse?.includes('token')) {
      throw Error('Unable to validate provided credentials.');
    }
  }

  async searchImages(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    if (!options.registry) {
      options.registry = 'https://index.docker.io';
    }
    if (options.registry === 'docker.io') {
      options.registry = 'index.docker.io';
    }
    if (!options.registry.startsWith('http')) {
      options.registry = 'https://' + options.registry;
    }
    const resultJSON = await got.get(
      `${options.registry}/v1/search?q=${options.query}&n=${options.limit ?? 25}`,
      this.getOptions(),
    );
    return JSON.parse(resultJSON.body).results;
  }
}

interface ImageRegistryNameTag {
  // for example foo/bar for foo/bar
  name: string;
  // for example latest for docker.io/foo/bar:latest
  tag: string;
  // for example index.docker.io for docker.io/foo/bar:latest
  registry: string;
  // for example https://index.docker.io/v2 for foo/bar:latest
  registryURL: string;
}
