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

import { readFile } from 'node:fs/promises';

import type { ContainerfileInfo } from '@desktop-framework/api';
import { inject, injectable } from 'inversify';

import { IPCHandle } from './api.js';

@injectable()
export class ContainerfileParser {
  constructor(
    @inject(IPCHandle)
    private readonly ipcHandle: IPCHandle,
  ) {}
  init(): void {
    this.ipcHandle('containerfile:getInfo', async (_listener, path: string): Promise<ContainerfileInfo> => {
      return this.parseContainerFile(path);
    });
  }

  async parseContainerFile(containerfilePath: string): Promise<ContainerfileInfo> {
    const content = await readFile(containerfilePath, 'utf-8');
    return this.parseContent(content);
  }

  async parseContent(content: string): Promise<ContainerfileInfo> {
    const lines = content.split('\n');
    const targets: string[] = [];

    const fromAsRegex = /FROM\s+\S+(?:\s+\S+)*\s+AS\s+(\S+)/i;

    for (const line of lines) {
      const match = fromAsRegex.exec(line);
      if (match?.[1]) {
        targets.push(match[1]);
      }
    }
    return { targets };
  }
}
