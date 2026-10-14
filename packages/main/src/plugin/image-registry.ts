/**********************************************************************
 * Copyright (C) 2022-2025 Red Hat, Inc.
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

import type {
  ImageSearchOptions,
  ImageSearchResult,
  ImageTagsListOptions,
  ImageUpdateStatus,
} from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import type * as Dockerode from 'dockerode';
import { inject, injectable } from 'inversify';
import * as nodeTar from 'tar';
import { Agent, ProxyAgent } from 'undici';
import { isURL } from 'validator';

import { isMac, isWindows } from '/@/util.js';

import { Certificates } from './certificates.js';
import { Emitter } from './events/emitter.js';
import { Proxy } from './proxy.js';
import { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';
import { decompressZstd } from './util/zstd.js';

export interface RegistryAuthInfo {
  authUrl: string;
  service?: string;
  scope?: string;
  scheme: string;
}

@injectable()
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
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(Telemetry)
    private telemetryService: Telemetry,
    @inject(Certificates)
    private certificates: Certificates,
    @inject(Proxy)
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
      (!splitParts[0]?.includes('.') && !splitParts[0]?.includes(':') && splitParts[0] !== 'localhost')
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

  getAuthconfigForServer(registryServer: string): Dockerode.AuthConfigObject | undefined {
    let matchingUrl = registryServer;
    if (matchingUrl === 'index.docker.io') {
      matchingUrl = 'docker.io';
    }
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
    return undefined;
  }

  /**
   * Provides authentication information from all registries.
   */
  async getRegistryConfig(validateRegistries: boolean = true): Promise<Dockerode.RegistryConfig> {
    const registryConfig: Dockerode.RegistryConfig = {};
    await Promise.all(
      this.getRegistries().map(async registry => {
        let addRegistry = true;

        if (validateRegistries) {
          // before adding the registry, check if the registry information is valid
          await this.checkCredentials(registry.serverUrl, registry.username, registry.secret, registry.insecure).catch(
            () => {
              console.error(`Error while checking registry credentials ${registry.serverUrl}`);
              addRegistry = false;
            },
          );
        }

        if (addRegistry) {
          const serveraddress = registry.serverUrl.toLowerCase();
          registryConfig[serveraddress] = {
            username: registry.username,
            password: registry.secret,
          };
        }
      }),
    );

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
      this.telemetryService.track('createRegistry', {
        serverUrlHash: this.getRegistryHash(registryCreateOptions),
        total: this.registries.length,
        ...telemetryOptions,
      });
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
      if (realm && scheme) {
        return { authUrl: realm, service, scope, scheme };
      }
    }
    return undefined;
  }

  getOptions(options?: { url?: string; insecure?: boolean; headers?: Record<string, string> }): RequestInit {
    if (!options?.insecure) {
      return {
        headers: options?.headers,
      };
    }

    const ca = this.certificates.getAllCertificates();

    if (this.proxyEnabled) {
      // pick the proxy matching the target protocol, like the global fetch override does
      const secure = options.url ? new URL(options.url).protocol === 'https:' : true;
      const proxyUrl = secure ? this.proxySettings?.httpsProxy : this.proxySettings?.httpProxy;
      if (proxyUrl) {
        return {
          dispatcher: new ProxyAgent({
            uri: proxyUrl,
            requestTls: { ca, rejectUnauthorized: false },
            proxyTls: { ca },
          }),
          headers: options?.headers,
        } as RequestInit;
      }
    }

    return {
      dispatcher: new Agent({
        connect: { ca, rejectUnauthorized: false },
      }),
      headers: options?.headers,
    } as RequestInit;
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
    if (RegExp(/^[a-zA-Z0-9+.-]+:\/\//).exec(imageName)) {
      throw new Error(`Invalid image name: ${imageName}`);
    }

    // Check if image is referenced by digest (@sha256:hash) instead of tag
    // Format can be: name:tag, name@sha256:hash, or name:tag@sha256:hash
    let tag = 'latest';
    const atIndex = imageName.indexOf('@');
    const lastSlash = imageName.lastIndexOf('/');

    if (atIndex !== -1 && atIndex > lastSlash) {
      // Image uses digest format: name@sha256:hash or name:tag@sha256:hash
      // The digest is the authoritative reference
      tag = imageName.substring(atIndex + 1);
      imageName = imageName.substring(0, atIndex);

      // Remove any tag that might be present before the @ (e.g., :0.11.0 in name:0.11.0@sha256:...)
      const lastColon = imageName.lastIndexOf(':');
      if (lastColon !== -1 && lastColon > lastSlash) {
        imageName = imageName.substring(0, lastColon);
      }
    } else {
      // Check for tag format: name:tag
      const lastColon = imageName.lastIndexOf(':');
      if (lastColon !== -1 && lastColon > lastSlash) {
        tag = imageName.substring(lastColon + 1);
        imageName = imageName.substring(0, lastColon);
      }
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
      if (slashes[0]?.startsWith('localhost') && slashes[1]) {
        registry = slashes[0];
        name = slashes[1];
      } else {
        registry = 'index.docker.io';
        name = `${slashes[0]}/${slashes[1]}`;
      }
      valid = true;
    } else if (slashes.length > 2 && slashes[0]) {
      registry = slashes[0];
      // join all remaining parts as the image name
      name = slashes.slice(1).join('/');
      valid = true;
    }
    if (!valid) {
      throw new Error(`Invalid image Name: ${imageName}`);
    }

    // Docker Hub's API is at index.docker.io, not docker.io
    const registryHost = registry === 'docker.io' ? 'index.docker.io' : registry;
    const registryURL = `https://${registryHost}/v2`;

    return {
      registry,
      registryURL,
      name,
      tag,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getManifestFromImageName(imageName: string): Promise<any> {
    const imageData = this.extractImageDataFromImageName(imageName);

    // grab auth info from the registry
    const authInfo = await this.getAuthInfo(imageData.registry);
    const token = await this.getToken(authInfo, imageData);
    if (authInfo.scheme.toLowerCase() !== 'bearer') {
      throw new Error(`Unsupported auth scheme: ${authInfo.scheme}`);
    }

    // now, grab manifest for the given image URL
    return await this.getManifest(imageData, token);
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
    logger: (event: { message: string; progress: number }) => void,
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

    let layers: { digest: string; size: number; mediaType: string }[];
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
    logger: (event: { message: string; progress: number }) => void,
  ): Promise<void> {
    const options = this.getOptions({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

    const response = await fetch(blobURL, options);

    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch blob ${blobURL}: ${response.statusText}`);
    }

    const body = response.body;
    let transferred = 0;

    // in case of zstd, the downloaded file is decompressed to a separate tar file before being extracted
    const unpackedFileName = compressionType === 'zstd' ? tmpFileName.replace('.zst', '.tar') : undefined;

    try {
      // pipeline handles backpressure, error propagation and stream teardown
      await pipeline(async function* () {
        for await (const chunk of body) {
          transferred += chunk.byteLength;

          const downloaded = currentDownloaded + transferred;
          const progress = Math.round((downloaded / totalSize) * 100);

          logger({
            message: `Downloading ${digest}${suffix} - ${progress}% - (${downloaded}/${totalSize})`,
            progress,
          });

          yield chunk;
        }
      }, createWriteStream(tmpFileName));

      if (unpackedFileName) {
        await decompressZstd(tmpFileName, unpackedFileName);
        await nodeTar.extract({ file: unpackedFileName, cwd: destFolder });
      } else {
        await nodeTar.extract({ file: tmpFileName, cwd: destFolder });
      }
    } finally {
      // remove the temporary files, even if the download, the decompression or the extraction failed
      await fs.promises.rm(tmpFileName, { force: true });
      if (unpackedFileName) {
        await fs.promises.rm(unpackedFileName, { force: true });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async fetchOciImageConfig(imageData: ImageRegistryNameTag, digest: string, token: string): Promise<any> {
    const blobURL = `${imageData.registryURL}/${imageData.name}/blobs/${digest}`;

    const response = await fetch(blobURL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 || response.status === 403) {
      throw Error('Unable to get access');
    }

    if (!response.ok) {
      throw Error(response.statusText);
    }

    return response.json();
  }

  /**
   * Internal method to fetch and resolve manifests from a registry.
   * For multi-arch images, this recursively resolves to the platform-specific manifest.
   *
   * @returns An object containing:
   *   - manifest: The parsed manifest JSON
   *   - digest: The platform-specific manifest digest (from docker-content-digest header)
   *   - listDigest: The manifest list digest (only present for multi-arch images, undefined for single-arch)
   */
  protected async getManifestFromURL(
    manifestURL: string,
    imageData: ImageRegistryNameTag,
    token: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ manifest: unknown; digest: string | undefined; listDigest?: string }> {
    const acceptHeaders = [
      'application/vnd.oci.image.manifest.v1+json',
      'application/vnd.docker.distribution.manifest.v2+json',
      'application/vnd.docker.distribution.manifest.v1+prettyjws',
      'application/vnd.docker.distribution.manifest.v1+json',
      'application/vnd.docker.distribution.manifest.list.v2+json',
      'application/vnd.oci.image.index.v1+json',
    ];

    const response = await fetch(manifestURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: acceptHeaders.join(', '),
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw Error('Unable to get access');
    }

    if (!response.ok) {
      throw Error(response.statusText);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedManifest: any = await response.json();
    const digest = response.headers.get('docker-content-digest') ?? undefined;

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
      // only change arch if we are on arm64
      if (arch === 'arm64') {
        platformArch = 'arm64';
      }

      let platformOs: 'linux' | 'windows' | 'darwin' = 'linux';
      if (isMac()) {
        platformOs = 'darwin';
      } else if (isWindows()) {
        platformOs = 'windows';
      }
      // find the manifest corresponding to our platform
      const matchedManifest = this.findBestManifest(
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
        // Multi-arch image detected: preserve the manifest list digest before recursing
        // to the platform-specific manifest. This listDigest is needed for update comparison
        // because container runtimes store the list digest in RepoDigests for multi-arch images.
        const listDigest = digest;
        const matchedManifestDigest = matchedManifest.digest;
        // now, grab the manifest corresponding to the digest
        const platformManifestURL = `${imageData.registryURL}/${imageData.name}/manifests/${matchedManifestDigest}`;
        const { manifest, digest: platformDigest } = await this.getManifestFromURL(
          platformManifestURL,
          imageData,
          token,
        );
        return { manifest, digest: platformDigest, listDigest };
      }
      throw new Error(
        `Unable to find a manifest corresponding to the platform os/architecture ${platformOs}/${platformArch}`,
      );
    }
    // Single-arch image: return manifest and digest, no listDigest (undefined)
    return { manifest: parsedManifest, digest };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findBestManifest(manifests: any[], wantedArch: string, wantedOs: string): any | undefined {
    // manifestsMap [os] [arch] = manifest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manifestsMap = new Map<string, Map<string, any>>();
    manifests.forEach(manifest => {
      const arch = manifest.platform.architecture;
      const os = manifest.platform.os;
      let manifestsForOs = manifestsMap.get(os);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manifestsForOs ??= new Map<string, any>();
      manifestsForOs.set(arch, manifest);
      manifestsMap.set(os, manifestsForOs);
    });

    let wantedOses = manifestsMap.get(wantedOs);
    wantedOses ??= manifestsMap.get('linux');

    const keys = Array.from(wantedOses?.keys() ?? []);
    if (!wantedOses || !keys[0]) {
      return;
    }

    let wanted = wantedOses.get(wantedArch);
    if (!wanted) {
      if (wantedOses.size === 1) {
        wanted = wantedOses.get(keys[0]);
      } else {
        wanted = wantedOses.get('amd64');
      }
    }
    return wanted;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getManifest(imageData: ImageRegistryNameTag, token: string): Promise<any> {
    const manifestURL = `${imageData.registryURL}/${imageData.name}/manifests/${imageData.tag}`;
    const { manifest } = await this.getManifestFromURL(manifestURL, imageData, token);
    return manifest;
  }

  async getDigestFromImageName(imageName: string): Promise<{ digest: string; listDigest?: string }> {
    const imageData = this.extractImageDataFromImageName(imageName);

    // grab auth info from the registry
    const authInfo = await this.getAuthInfo(imageData.registry);
    const token = await this.getToken(authInfo, imageData);
    if (authInfo.scheme.toLowerCase() !== 'bearer') {
      throw new Error(`Unsupported auth scheme: ${authInfo.scheme}`);
    }

    const manifestURL = `${imageData.registryURL}/${imageData.name}/manifests/${imageData.tag}`;
    const { digest, listDigest } = await this.getManifestFromURL(manifestURL, imageData, token);

    if (!digest) {
      throw new Error(`Registry did not return a digest for ${imageName}`);
    }

    return { digest, listDigest };
  }

  /**
   * Check if an image can be updated from a remote registry.
   * This is a fast operation that only queries the registry for the manifest digest.
   *
   * @param imageReference - Full image reference (e.g., "docker.io/library/nginx:latest")
   * @param imageTag - The tag portion of the image reference
   * @param localDigests - Array of local digests from imageInfo.RepoDigests.
   *   Note: RepoDigests content varies by container runtime:
   *   - Docker: stores manifest list digest for multi-arch, platform digest for single-arch
   *   - Podman: stores both manifest list and platform digests for multi-arch, platform digest for single-arch
   * @returns ImageUpdateStatus indicating if update is available
   */
  async checkImageUpdateStatus(
    imageReference: string,
    imageTag: string,
    localDigests: string[],
  ): Promise<ImageUpdateStatus> {
    // Check for immutable digest-based references
    // 1. imageTag starting with 'sha256:' (e.g., 'sha256:abc123...')
    // 2. imageReference containing '@sha256:' (e.g., 'quay.io/image@sha256:abc123...')
    if (imageTag.startsWith('sha256:') || imageReference.includes('@sha256:')) {
      return {
        status: 'skipped',
        updateAvailable: false,
        message: 'Immutable digest-based image reference cannot be updated',
      };
    }

    // Check for dangling images (no name or tag)
    if (imageReference.includes('<none>') || imageTag === '<none>') {
      return {
        status: 'skipped',
        updateAvailable: false,
        message: 'Image is dangling and cannot be checked for updates',
      };
    }

    // Check for local-only images that cannot be updated from a remote registry
    // For Podman: images with localhost in the name are local (e.g., localhost/myimage:tag)
    // For Docker: images with "local" as the tag are local (e.g., myimage:local)
    // We dont know for sure if the image is local or not, so we still want to check for updates.
    const hasLocalTag =
      imageReference.startsWith('localhost/') || imageReference.startsWith('localhost:') || imageTag === 'local';

    // Query the remote registry to get the current manifest digest
    // For multi-arch images, we get both the platform-specific digest and the manifest list digest
    let remoteDigest: string;
    let listDigest: string | undefined;
    try {
      const result = await this.getDigestFromImageName(imageReference);
      remoteDigest = result.digest;
      listDigest = result.listDigest;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (hasLocalTag) {
        // since we attempted to get the digest from the remote registry the status is normal and no update is available
        return {
          status: 'normal',
          updateAvailable: false,
          message: 'Image is detected as local and cannot be updated from a remote registry',
        };
      } else {
        // Actual error from registry (auth failure, network issues, etc.)
        return {
          status: 'error',
          updateAvailable: false,
          message: errorMessage,
        };
      }
    }

    // Podman stores both manifest list and platform digests for multi-arch images
    // while Docker stores only the manifest list digest for multi-arch images.
    // Therefore, we need to compare the list digest for multi-arch images.
    const digestToCompare = listDigest ?? remoteDigest;
    const isAlreadyUpToDate = localDigests.some(localDigest => localDigest.endsWith(digestToCompare));

    if (isAlreadyUpToDate) {
      return {
        status: 'normal',
        updateAvailable: false,
        message: 'Image is already the latest version',
      };
    }

    // Update is available
    return {
      status: 'normal',
      updateAvailable: true,
      remoteDigest,
      message: 'A new version is available',
    };
  }

  async getAuthInfo(serviceUrl: string, insecure?: boolean): Promise<{ authUrl: string; scheme: string }> {
    let registryUrl: string;

    if (serviceUrl.includes('docker.io')) {
      registryUrl = 'https://index.docker.io/v2/';
    } else {
      registryUrl = `${serviceUrl}/v2/`;

      if (!registryUrl.startsWith('http')) {
        registryUrl = `https://${registryUrl}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(registryUrl, this.getOptions({ url: registryUrl, insecure }));
    } catch (error) {
      // fetch reports network failures as a generic `TypeError: fetch failed` and keeps the actual
      // reason (DNS, TLS, refused connection) in `cause`
      const reason = error instanceof Error ? (error.cause ?? error) : error;
      throw new Error(`Unable to find auth info for ${registryUrl}. Error: ${reason}`);
    }

    if (!response.ok) {
      const wwwAuthenticate = response.headers.get('www-authenticate');
      if (wwwAuthenticate) {
        const authInfo = this.extractAuthData(wwwAuthenticate);
        if (authInfo) {
          const scheme = authInfo.scheme?.toLowerCase();
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
          return { authUrl: url.toString(), scheme };
        }
      }
      throw new Error(`Unable to find auth info for ${registryUrl}. Error: ${response.statusText}`);
    }

    throw Error('Not a valid registry.');
  }

  async checkCredentials(serviceUrl: string, username: string, password: string, insecure?: boolean): Promise<void> {
    // When checking the validation of the URL, do not require a TLD (ex. .com, .org, etc.)
    // in case we are passing in a local test registry such as http://localhost:5000
    const urlOptions = {
      require_tld: false,
    };
    // Validate the URL
    const isUrl = isURL(serviceUrl, urlOptions);

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
    const headers: Record<string, string> = {};

    const authServer = this.getAuthconfigForServer(imageData.registry);
    if (authServer) {
      const loginAndPassWord = `${authServer.username}:${authServer.password}`;
      headers['Authorization'] = `Basic ${Buffer.from(loginAndPassWord).toString('base64')}`;
    }

    let tokenUrl = authInfo.authUrl.replace('user%2Fimage', imageData.name.replaceAll('/', '%2F'));

    if (!tokenUrl.includes('scope')) {
      const url = new URL(tokenUrl);
      url.searchParams.set('scope', `repository:${imageData.name}:pull`);
      tokenUrl = url.toString();
    }

    const response = await fetch(tokenUrl, { headers });

    if (response.status === 401 || response.status === 403) {
      throw Error('Required authentication. Not supported.');
    }

    if (!response.ok) {
      throw Error(response.statusText);
    }

    const rawResponse = await response.text();
    if (!rawResponse.includes('token')) {
      throw Error('Unable to validate registry URL.');
    }
    return JSON.parse(rawResponse).token;
  }

  async doCheckCredentials(
    scheme: string,
    authUrl: string,
    username: string,
    password: string,
    insecure?: boolean,
  ): Promise<void> {
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(
      authUrl,
      this.getOptions({
        url: authUrl,
        insecure,
        headers: {
          Authorization: `Basic ${token}`,
        },
      }),
    );

    if (response.status === 401 || response.status === 403) {
      throw Error('Wrong Username or Password.');
    }

    if (!response.ok) {
      throw Error(response.statusText);
    }

    if (scheme === 'basic') {
      return;
    }

    const rawResponse = await response.text();
    if (!rawResponse.includes('token')) {
      throw Error('Unable to validate provided credentials.');
    }
  }

  async searchImages(options: ImageSearchOptions): Promise<ImageSearchResult[]> {
    try {
      options.registry ??= 'https://index.docker.io';
      if (options.registry === 'docker.io') {
        options.registry = 'index.docker.io';
      }
      if (!options.registry.startsWith('http')) {
        options.registry = 'https://' + options.registry;
      }
      const response = await fetch(`${options.registry}/v1/search?q=${options.query}&n=${options.limit ?? 25}`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const result = await response.json();
      return result.results;
    } catch (e: unknown) {
      throw new Error(`searching images. ${String(e)}`);
    }
  }

  async listImageTags(options: ImageTagsListOptions): Promise<string[]> {
    const imageData = this.extractImageDataFromImageName(options.image);

    const authInfo = await this.getAuthInfo(imageData.registry);
    const token = await this.getToken(authInfo, imageData);
    if (authInfo.scheme.toLowerCase() !== 'bearer') {
      throw new Error(`Unsupported auth scheme: ${authInfo.scheme}`);
    }

    try {
      const response = await fetch(`${imageData.registryURL}/${imageData.name}/tags/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const result = await response.json();
      return result.tags;
    } catch (e: unknown) {
      throw new Error(`getting tags of image ${options.image}. ${String(e)}`);
    }
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
