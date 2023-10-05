/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { CliToolOptions, Disposable } from '@podman-desktop/api';
import type { CliToolInfo } from './api/cli-tool-info.js';
import type { ApiSenderType } from './api.js';
import type { Telemetry } from './telemetry/telemetry.js';

export class CliToolImpl implements Disposable {
  constructor(
    readonly internalId: number,
    private options: CliToolOptions,
  ) {}

  get name() {
    return this.options.name;
  }

  get displayName() {
    return this.options.displayName;
  }

  get description() {
    return this.options.description;
  }

  get images() {
    return Object.freeze(this.options.images);
  }

  dispose(): void {
    throw new Error('Method not implemented.');
  }
}

interface CliToolContext {
  extensionId: string;
  extensionName: string;
  cliTool: CliToolImpl;
}

class IdSequence {
  private counter = 0;

  get id(): number {
    return this.counter++;
  }

  get currentId() {
    return this.counter;
  }
}

export class CliToolRegistry {
  constructor(
    private apiSender: ApiSenderType,
    private telemetryService: Telemetry,
  ) {}

  private sequence = new IdSequence();

  private cliTools = new Map<number, CliToolContext>();

  createCliTool(extensionId: string, extensionName: string, options: CliToolOptions): Disposable {
    const cliTool = new CliToolImpl(this.sequence.id, options);
    this.cliTools.set(this.sequence.currentId, {
      extensionId,
      extensionName,
      cliTool,
    });
    this.apiSender.send('cli-tool-create', this.sequence.currentId);
    return cliTool;
  }

  getCliToolInfos(): CliToolInfo[] {
    return Array.from(this.cliTools.values()).map(context => ({
      id: context.cliTool.internalId,
      name: context.cliTool.name,
      displayName: context.cliTool.displayName,
      description: context.cliTool.description,
      state: 'unknown',
      images: context.cliTool.images,
    }));
  }
}
