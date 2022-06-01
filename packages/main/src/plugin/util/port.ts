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

import * as net from 'net';

/**
 * Find a free port starting from the given port
 */
export function getFreePort(port = 0): Promise<number> {
  if (port < 1024) {
    port = 9000;
  }
  const server = net.createServer();
  return new Promise((resolve, reject) =>
    server
      .on('error', (error: NodeJS.ErrnoException) =>
        error.code === 'EADDRINUSE' ? server.listen(++port) : reject(error),
      )
      .on('listening', () => server.close(() => resolve(port)))
      .listen(port),
  );
}
