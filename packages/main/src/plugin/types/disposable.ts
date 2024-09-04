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

import type { IDisposable } from '/@api/disposable.js';

export class Disposable implements IDisposable {
  private disposable: undefined | (() => void);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static from(...disposables: { dispose(): any }[]): Disposable {
    return new Disposable(() => {
      if (disposables) {
        for (const disposable of disposables) {
          if (disposable && typeof disposable.dispose === 'function') {
            disposable.dispose();
          }
        }
      }
    });
  }

  constructor(func: () => void) {
    this.disposable = func;
  }
  /**
   * Dispose this object.
   */
  dispose(): void {
    if (this.disposable) {
      this.disposable();
      this.disposable = undefined;
    }
  }

  static create(func: () => void): Disposable {
    return new Disposable(func);
  }

  static noop(): Disposable {
    return Disposable.from();
  }
}
