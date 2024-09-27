/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { ErrorCallback, KubernetesObject, ObjectCallback } from '@kubernetes/client-node';
import { vi } from 'vitest';

interface InformerEvent {
  delayMs: number;
  verb: string;
  object: KubernetesObject;
}

interface InformerErrorEvent {
  delayMs: number;
  verb: string;
  error: string;
}

export const informerStopMock = vi.fn();

export class TestInformer {
  private onCb: Map<string, ObjectCallback<KubernetesObject>>;
  private offCb: Map<string, ObjectCallback<KubernetesObject>>;
  private onErrorCb: Map<string, ErrorCallback>;

  constructor(
    private contextName: string,
    private path: string,
    private resourcesCount: number,
    private connectResponse: Error | undefined,
    private events: InformerEvent[],
    private errorEvents: InformerErrorEvent[],
  ) {
    this.onCb = new Map<string, ObjectCallback<KubernetesObject>>();
    this.offCb = new Map<string, ObjectCallback<KubernetesObject>>();
    this.onErrorCb = new Map<string, ErrorCallback>();
  }
  async start(): Promise<void> {
    this.onErrorCb.get('connect')?.();
    if (this.connectResponse) {
      this.onErrorCb.get('error')?.(this.connectResponse);
    }
    if (this.connectResponse === undefined) {
      for (let i = 0; i < this.resourcesCount; i++) {
        this.onCb.get('add')?.({});
      }
      this.events.forEach(event => {
        setTimeout(() => {
          this.onCb.get(event.verb)?.(event.object);
        }, event.delayMs);
      });
      this.errorEvents.forEach(event => {
        setTimeout(() => {
          this.onErrorCb.get(event.verb)?.(event.error);
        }, event.delayMs);
      });
    }
  }
  async stop(): Promise<void> {
    informerStopMock(this.contextName, this.path);
  }
  on(
    verb: 'change' | 'add' | 'update' | 'delete' | 'error' | 'connect',
    cb: ErrorCallback | ObjectCallback<KubernetesObject>,
  ): void {
    switch (verb) {
      case 'error':
      case 'connect':
        this.onErrorCb.set(verb, cb as ErrorCallback);
        break;
      default:
        this.onCb.set(verb, cb as ObjectCallback<KubernetesObject>);
    }
  }
  off(
    verb: 'change' | 'add' | 'update' | 'delete' | 'error' | 'connect',
    cb: ErrorCallback | ObjectCallback<KubernetesObject>,
  ): void {
    this.offCb.set(verb, cb);
  }
  get(): KubernetesObject {
    return {};
  }

  list(): KubernetesObject[] {
    return [];
  }
}
