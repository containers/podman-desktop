/**********************************************************************
 * Copyright (C) 2022 - 2023 Red Hat, Inc.
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

import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';
import { ServerConfig, AuthConfig } from './configuration';

interface Deferred<T> {
  resolve: (result: T | Promise<T>) => void;
  reject: (reason: any) => void;
}

export function createServer(config: AuthConfig, nonce: string) {
  type RedirectResult =
    | { req: http.IncomingMessage; res: http.ServerResponse }
    | { err: any; res: http.ServerResponse };
  let deferredRedirect: Deferred<RedirectResult>;
  const redirectPromise = new Promise<RedirectResult>((resolve, reject) => (deferredRedirect = { resolve, reject }));

  let deferredCallback: Deferred<RedirectResult>;
  const callbackPromise = new Promise<RedirectResult>((resolve, reject) => (deferredCallback = { resolve, reject }));

  const server = http.createServer(function (req, res) {
    const reqUrl = url.parse(req.url!, /* parseQueryString */ true);
    console.log(`Received ${reqUrl.pathname}`);
    switch (reqUrl.pathname) {
      case '/signin':
        // eslint-disable-next-line no-case-declarations
        const receivedNonce = ((reqUrl.query.nonce as string) || '').replace(/ /g, '+');
        if (receivedNonce === nonce) {
          deferredRedirect.resolve({ req, res });
        } else {
          const err = new Error('Nonce does not match.');
          deferredRedirect.resolve({ err, res });
        }
        break;
      case '/':
        sendFile(res, path.join(__dirname, '../www/success.html'), 'text/html; charset=utf-8');
        break;
      case '/auth.css':
        sendFile(res, path.join(__dirname, '../www/auth.css'), 'text/css; charset=utf-8');
        break;
      case '/favicon.ico':
        sendFile(res, path.join(__dirname, '../www/favicon.ico'), 'image/vnd.microsoft.icon');
        break;
      case `/${config.serverConfig.callbackPath}`:
        deferredCallback.resolve({ req, res });
        break;
      default:
        res.writeHead(404);
        res.end();
        break;
    }
  });
  return { server, redirectPromise, callbackPromise };
}

export async function startServer(config: ServerConfig, server: http.Server): Promise<string> {
  let portTimer: NodeJS.Timer;

  function cancelPortTimer() {
    clearTimeout(portTimer);
  }

  const port = new Promise<string>((resolve, reject) => {
    portTimer = setTimeout(() => {
      reject(new Error('Timeout waiting for port'));
    }, 5000);

    server.on('listening', () => {
      const address = server.address();
      if (typeof address === 'undefined' || address === null) {
        reject(new Error('adress is null or undefined'));
      } else if (typeof address === 'string') {
        resolve(address);
      } else {
        resolve(address.port.toString());
      }
    });

    server.on('error', _ => {
      reject(new Error('Error listening to server'));
    });

    server.on('close', () => {
      reject(new Error('Closed'));
    });

    server.listen(config.port);
  });

  port.then(cancelPortTimer, cancelPortTimer);
  return port;
}

function sendFile(res: http.ServerResponse, filepath: string, contentType: string) {
  fs.readFile(filepath, (err, body) => {
    if (err) {
      console.error(err);
      res.writeHead(404);
      res.end();
    } else {
      res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': contentType,
      });
      res.end(body);
    }
  });
}
