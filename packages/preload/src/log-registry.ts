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

import type { LogHandler, LogProvider } from '@tmpwip/extension-api';

export class LogRegistry {

  private logs: Map<string, LogProvider> = new Map();
  private idCount = 0;

  addProvider(id: string, logProvider: LogProvider): void {
    this.logs.set(id, logProvider);
  }

  deleteProvider(providerId: string): void {
    this.logs.delete(providerId);
  }

  hasLogs(providerId: string): boolean {
    return this.logs.has(providerId);
  }

  stopLogs(providerId: string, internalId?: string): Promise<boolean> {
    if(!this.logs.has(providerId)){
      return Promise.reject(`Can't find log provider for ${providerId}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.logs.get(providerId)!.stopLogs(internalId);
  }

  startLogs(providerId: string, handler: LogHandler): Promise<boolean> {
    if(!this.logs.has(providerId)){
      return Promise.reject(`Can't find log provider for ${providerId}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.logs.get(providerId)!.startLogs(handler);
  }

}
