/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

import * as http from 'node:http';
import * as https from 'node:https';
import * as nodeurl from 'node:url';

import type { HttpProxyAgentOptions, HttpsProxyAgentOptions } from 'hpagent';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

import type { Certificates } from './certificates.js';
import type { Proxy } from './proxy.js';

// Agents usage table
// ------------------------------------
// | Type            | Proxy | Server |
// ------------------------------------
// | HttpProxyAgent  | HTTP  | HTTP   |
// ------------------------------------
// | HttpProxyAgent  | HTTPS | HTTP   |
// ------------------------------------
// | HttpsProxyAgent | HTTP  | HTTPS  |
// ------------------------------------
// | HttpsProxyAgent | HTTPS | HTTPS  |
// ------------------------------------
// Source - https://github.com/delvedor/hpagent/tree/main#usage

function createProxyAgent(secure: boolean, proxyUrl: string, certificates: Certificates): http.Agent | https.Agent {
  const options = {
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 256,
    maxFreeSockets: 256,
    scheduling: 'lifo',
    proxy: proxyUrl,
    ca: certificates.getAllCertificates(),
  };
  return secure
    ? new HttpsProxyAgent(options as HttpsProxyAgentOptions)
    : new HttpProxyAgent(options as HttpProxyAgentOptions);
}

export function getProxyUrl(proxy: Proxy, secure: boolean, hostname?: string, port?: string): string | undefined {
  if (proxy.isEnabled()) {
    const effectivePort = (port === '' ? undefined : port) ?? (secure ? '443' : '80');
    if (proxy.isNoProxyMatch(hostname, effectivePort)) {
      return undefined;
    }
    return secure ? proxy.proxy?.httpsProxy : proxy.proxy?.httpProxy;
  }
  return undefined;
}

type ProxyOptions = { agent?: http.Agent | https.Agent };

export function getOptions(
  proxy: Proxy,
  secure: boolean,
  certificates: Certificates,
  hostname?: string,
  port?: string,
): ProxyOptions {
  const options: ProxyOptions = {};
  const proxyUrl = getProxyUrl(proxy, secure, hostname, port);
  if (proxyUrl) {
    options.agent = createProxyAgent(secure, proxyUrl, certificates);
  } else if (secure) {
    options.agent = new https.Agent({
      ca: certificates.getAllCertificates(),
    });
  }
  return options;
}

function createHttpPatch(
  originals: typeof http | typeof https,
  proxy: Proxy,
  certificates: Certificates,
): { get: typeof http.get; request: typeof http.get } {
  return {
    get: patch(originals.get, certificates),
    request: patch(originals.request, certificates),
  };

  function patch(original: typeof http.get, certificates: Certificates): typeof http.get {
    function patched(
      url?: string | nodeurl.URL | http.RequestOptions,
      options?: http.RequestOptions | ((res: http.IncomingMessage) => void),
      callback?: (res: http.IncomingMessage) => void,
    ): http.ClientRequest {
      if (proxy?.isEnabled()) {
        if (
          (url instanceof nodeurl.URL && !url?.searchParams) ||
          (typeof url !== 'string' && typeof url === 'object' && !(url instanceof nodeurl.URL))
        ) {
          callback = options as (res: http.IncomingMessage) => void;
          options = url;
          url = undefined;
        }
        if (typeof options === 'function') {
          callback = options;
          options = undefined;
        }

        options ??= {};

        if (options.socketPath) {
          return original(options, callback);
        }

        if (options.agent === true) {
          throw new Error('Unexpected agent option: true');
        }

        if (url) {
          const parsed = typeof url === 'object' && url instanceof nodeurl.URL ? url : new nodeurl.URL(url);
          const urlOptions = {
            protocol: parsed.protocol,
            hostname: parsed.hostname.lastIndexOf('[', 0) === 0 ? parsed.hostname.slice(1, -1) : parsed.hostname,
            port: parsed.port,
            path: `${parsed.pathname}${parsed.search}`,
          };
          if (parsed.username || parsed.password) {
            options.auth = `${parsed.username}:${parsed.password}`;
          }
          options = { ...urlOptions, ...options };
        } else {
          options = { ...options };
        }

        const host = options.hostname ?? options.host ?? 'localhost';
        const port = options.port?.toString();
        options = { ...options, ...getOptions(proxy, options.protocol === 'https:', certificates, host, port) };

        return original(options, callback);
      }
      return original.apply(null, arguments as any); // eslint-disable-line
    }
    return patched;
  }
}

export function createHttpPatchedModules(
  proxy: Proxy,
  certificates: Certificates,
): { http: typeof http; https: typeof https; 'node:http': typeof http; 'node:https': typeof https } {
  const res = {
    http: { ...http, ...createHttpPatch(http, proxy, certificates) },
    https: { ...https, ...createHttpPatch(https, proxy, certificates) },
  };
  return { ...res, 'node:https': res.https, 'node:http': res.http };
}
