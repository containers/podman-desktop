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

import { Disposable } from './types/disposable';
import type * as containerDesktopAPI from '@tmpwip/extension-api';
import { Emitter } from './events/emitter';
import type * as Dockerode from 'dockerode';
import type { Telemetry } from './telemetry/telemetry';
import * as crypto from 'node:crypto';
import type { HttpsOptions, OptionsOfTextResponseBody } from 'got';
import got, { HTTPError } from 'got';
import { RequestError } from 'got';
import validator from 'validator';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import type { Certificates } from './certificates';
import type { Proxy } from './proxy';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
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
  }

  extractRegistryServerFromImage(imageName: string): string | undefined {
    // check if image is a valid identifier for dockerhub
    const splitParts = imageName.split('/');
    if (
      splitParts.length === 1 ||
      (!splitParts[0].includes('.') && !splitParts[0].includes(':') && splitParts[0] != 'localhost')
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
    let authconfig;
    if (registryServer) {
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
        authconfig = {
          username: matchingRegistry.username,
          password: matchingRegistry.secret,
          serveraddress,
        };
      }
    }
    return authconfig;
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

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return Disposable.create(() => {});
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
    );
    const registry = provider.create(registryCreateOptions);
    this.telemetryService.track('createRegistry', {
      serverUrlHash: this.getRegistryHash(registryCreateOptions),
      total: this.registries.length,
    });
    return this.registerRegistry(registry);
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
      await this.checkCredentials(matchingRegistry.serverUrl, registry.username, registry.secret);
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
      /(?<scheme>Bearer|Basic) realm="(?<realm>[^"]+)"(,service="(?<service>[^"]+)")?(,scope="(?<scope>[^"]+)")?/;

    const parsed = WWW_AUTH_REGEXP.exec(wwwAuthenticate);
    if (parsed && parsed.groups) {
      const { realm, service, scope, scheme } = parsed.groups;
      return { authUrl: realm, service, scope, scheme };
    }
    return undefined;
  }

  getOptions(): OptionsOfTextResponseBody {
    const httpsOptions: HttpsOptions = {};
    const options: OptionsOfTextResponseBody = {
      https: httpsOptions,
    };

    if (options.https) {
      options.https.certificateAuthority = this.certificates.getAllCertificates();
    }

    if (this.proxyEnabled) {
      // use proxy when performing got request
      const proxy = this.proxySettings;
      const httpProxyUrl = proxy && proxy.httpProxy;
      const httpsProxyUrl = proxy && proxy.httpsProxy;

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
          throw new Error(`Failed to create https proxy agent from ${httpProxyUrl}: ${error}`);
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

  async getAuthInfo(serviceUrl: string): Promise<{ authUrl: string | undefined; scheme: string }> {
    let registryUrl: string;

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
      await got.get(registryUrl, this.getOptions());
    } catch (requestErr) {
      if (requestErr instanceof HTTPError) {
        const wwwAuthenticate = requestErr.response?.headers['www-authenticate'];
        if (wwwAuthenticate) {
          const authInfo = this.extractAuthData(wwwAuthenticate);
          if (authInfo) {
            const url = new URL(authInfo.authUrl);
            scheme = authInfo.scheme?.toLowerCase();
            // in case of basic auth, we use directly the registry URL
            if (scheme === 'basic') {
              return { authUrl: registryUrl, scheme };
            }
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

  async checkCredentials(serviceUrl: string, username: string, password: string): Promise<void> {
    if (serviceUrl === undefined || !validator.isURL(serviceUrl)) {
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

    const { authUrl, scheme } = await this.getAuthInfo(serviceUrl);

    if (authUrl !== undefined) {
      await this.doCheckCredentials(scheme, authUrl, username, password);
    }
  }

  async doCheckCredentials(scheme: string, authUrl: string, username: string, password: string): Promise<void> {
    let rawResponse: string | undefined;
    // add credentials in the header
    // encode username:password in base64
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    const options = this.getOptions();
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
}
