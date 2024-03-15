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
import type { CustomPick, CustomPickItem } from '@podman-desktop/api';

import type { ApiSenderType } from '../api.js';
import type { IDisposable } from '../types/disposable.js';
import { CustomPickImpl } from './custompick-impl.js';

export class CustomPickRegistry implements IDisposable {
  private callbackId = 0;
  private readonly entries: Map<number, CustomPickImpl<CustomPickItem>> = new Map();

  constructor(private apiSender: ApiSenderType) {}

  createCustomPick<T extends CustomPickItem>(): CustomPick<T> {
    this.callbackId++;
    const customPick = new CustomPickImpl<T>(this.callbackId, this, this.apiSender);
    this.entries.set(this.callbackId, customPick);
    return customPick;
  }

  // this method is called by the frontend when the user closes the dialog
  onClose(id: number): void {
    const customPick = this.entries.get(id);
    customPick?.hide();
  }

  // this method is called by the frontend when the user confirms the selection made
  onConfirmSelection(id: number, indexes: number[]): void {
    const customPick = this.entries.get(id);
    customPick?.confirmSelection(indexes);
  }

  removeEntry(id: number): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.dispose();
      this.entries.delete(id);
    }
  }

  dispose(): void {
    this.entries.forEach(entry => entry.dispose());
    this.entries.clear();
  }
}
