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

import * as http from 'http';
import * as https from 'https';
import * as nodeurl from 'url';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import type { HttpsOptions, OptionsOfTextResponseBody } from 'got';
import { Certificates } from './certificates';
import type { Proxy } from './proxy';

const certificates = new Certificates()
const certificatesLoaded = false;

export function getOptions(proxy: Proxy): OptionsOfTextResponseBody {
  const httpsOptions: HttpsOptions = {};
  const options: OptionsOfTextResponseBody = {
    https: httpsOptions,
  };

  if (options.https) {
    if (!certificatesLoaded) {
      certificates.init();
    }
    options.https.certificateAuthority = certificates.getAllCertificates();
  }

  if (proxy.isEnabled()) {
    // use proxy when performing got request
    const httpProxyUrl = proxy.proxy?.httpProxy;
    const httpsProxyUrl = proxy.proxy?.httpsProxy;

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

export function createHttpPatch(originals: typeof http | typeof https, proxy: Proxy) {
	return {
		get: patch(originals.get),
		request: patch(originals.request)
	};

	function patch(original: typeof http.get) {
		function patched(url?: string | nodeurl.URL | null, options?: http.RequestOptions | null, callback?: (res: http.IncomingMessage) => void): http.ClientRequest {
			
      console.log("patched!");
      if (typeof url !== 'string' && !(url && (<any>url).searchParams)) {
				callback = <any>options;
				options = url;
				url = null;
			}
			if (typeof options === 'function') {
				callback = options;
				options = null;
			}
			options = options || {};

			if (options.socketPath) {
				return original.apply(null, arguments as any);
			}

			const originalAgent = options.agent;
			if (originalAgent === true) {
				throw new Error('Unexpected agent option: true');
			}

			if (proxy?.isEnabled()) {
				if (url) {
					const parsed = typeof url === 'string' ? new nodeurl.URL(url) : url;
					const urlOptions = {
						protocol: parsed.protocol,
						hostname: parsed.hostname.lastIndexOf('[', 0) === 0 ? parsed.hostname.slice(1, -1) : parsed.hostname,
						port: parsed.port,
						path: `${parsed.pathname}${parsed.search}`
					};
					if (parsed.username || parsed.password) {
						options.auth = `${parsed.username}:${parsed.password}`;
					}
					options = { ...urlOptions, ...options };
				} else {
					options = { ...options };
				}

				const host = options.hostname || options.host;
				const isLocalhost = !host || host === 'localhost' || host === '127.0.0.1'; // Avoiding https://github.com/microsoft/vscode/issues/120354
				if (!isLocalhost) {
          options = Object.assign({}, options, getOptions(proxy))
        }
        
				return original(options, callback);
			}

			return original.apply(null, arguments as any);
		}
		return patched;
	}
}

export function createPatchedModules(proxy: Proxy) {
	return {
		http: Object.assign({}, http, createHttpPatch(http, proxy)),
		https: Object.assign({}, https, createHttpPatch(https, proxy)),
	};
}
