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

import type { IDisposable } from '@desktop-framework/api';
import type * as extensionApi from '@desktop-framework/extension-api';

import { Emitter } from './events/emitter.js';

const shortcutEvent: extensionApi.Event<unknown> = Object.freeze((callback, context?): IDisposable => {
  const handle = setTimeout(callback.bind(context), 0);
  return {
    dispose(): void {
      clearTimeout(handle);
    },
  };
});

export class CancellationTokenImpl implements extensionApi.CancellationToken {
  private _isCancellationRequested: boolean;
  private emitter: Emitter<unknown> | undefined;

  constructor() {
    this._isCancellationRequested = false;
  }

  public cancel(): void {
    if (!this._isCancellationRequested) {
      this._isCancellationRequested = true;
      if (this.emitter) {
        this.emitter.fire(undefined);
        this.dispose();
      }
    }
  }

  get isCancellationRequested(): boolean {
    return this._isCancellationRequested;
  }

  get onCancellationRequested(): extensionApi.Event<unknown> {
    if (this._isCancellationRequested) {
      return shortcutEvent;
    }
    this.emitter ??= new Emitter<unknown>();
    return this.emitter.event;
  }

  public dispose(): void {
    if (this.emitter) {
      this.emitter.dispose();
      this.emitter = undefined;
    }
  }
}

export class CancellationTokenSource {
  private _token?: CancellationTokenImpl = undefined;

  get token(): extensionApi.CancellationToken {
    // be lazy and create the token only when actually needed
    this._token ??= new CancellationTokenImpl();
    return this._token;
  }

  cancel(): void {
    if (this._token) {
      this._token?.cancel();
    }
  }

  dispose(cancel = false): void {
    if (cancel) {
      this.cancel();
    }
    if (this._token) {
      this._token.dispose();
    }
  }
}
