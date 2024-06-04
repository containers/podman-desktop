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

import * as http from 'node:http';
import * as https from 'node:https';
import * as nodeurl from 'node:url';

import type { HttpProxyAgentOptions, HttpsProxyAgentOptions } from 'hpagent';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

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

function createProxyAgent(secure: boolean, proxyUrl: string): http.Agent | https.Agent {
  const options = {
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 256,
    maxFreeSockets: 256,
    scheduling: 'lifo',
    proxy: proxyUrl,
  };
  return secure
    ? new HttpsProxyAgent(options as HttpsProxyAgentOptions)
    : new HttpProxyAgent(options as HttpProxyAgentOptions);
}

export function getProxyUrl(proxy: Proxy, secure: boolean): string | undefined {
  if (proxy.isEnabled()) {
    return secure ? proxy.proxy?.httpsProxy : proxy.proxy?.httpProxy;
  }
}

type ProxyOptions = { agent?: http.Agent | https.Agent };

export function getOptions(proxy: Proxy, secure: boolean): ProxyOptions {
  const options: ProxyOptions = {};
  const proxyUrl = getProxyUrl(proxy, secure);
  if (proxyUrl) {
    options.agent = createProxyAgent(secure, proxyUrl);
  }
  return options;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createHttpPatch(originals: typeof http | typeof https, proxy: Proxy): any {
  return {
    get: patch(originals.get),
    request: patch(originals.request),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function patch(original: typeof http.get): any {
    function patched(
      url?: string | nodeurl.URL | null,
      options?: http.RequestOptions | null,
      callback?: (res: http.IncomingMessage) => void,
    ): http.ClientRequest {
      if (proxy?.isEnabled()) {
        if (typeof url !== 'string' && !url?.searchParams) {
          callback = <any>options; // eslint-disable-line @typescript-eslint/no-explicit-any
          options = url;
          url = undefined;
        }
        if (typeof options === 'function') {
          callback = options;
          options = undefined;
        }

        if (!options) {
          options = {};
        }

        if (options.socketPath) {
          return original(options, callback);
        }

        if (options.agent === true) {
          throw new Error('Unexpected agent option: true');
        }

        if (url) {
          const parsed = typeof url === 'string' ? new nodeurl.URL(url) : url;
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

        const host = options.hostname ?? options.host;
        const isLocalhost = !host || host === 'localhost' || host === '127.0.0.1';
        if (!isLocalhost) {
          options = Object.assign({}, options, getOptions(proxy, options.protocol === 'https:'));
        }

        return original(options, callback);
      }
      return original.apply(null, arguments as any); // eslint-disable-line
    }
    return patched;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createHttpPatchedModules(proxy: Proxy): any {
  const res = {
    http: Object.assign({}, http, createHttpPatch(http, proxy)),
    https: Object.assign({}, https, createHttpPatch(https, proxy)),
  };
  return { ...res, 'node:https': res.https, 'node:http': res.http };
}
