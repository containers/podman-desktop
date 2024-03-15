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
import type { CustomPick, CustomPickItem, Event } from '@podman-desktop/api';

import type { ApiSenderType } from '../api.js';
import { Emitter } from '../events/emitter.js';
import type { IDisposable } from '../types/disposable.js';
import type { CustomPickRegistry } from './custompick-registry.js';

export class CustomPickImpl<T extends CustomPickItem> implements CustomPick<T>, IDisposable {
  private _title: string | undefined;
  private _description: string | undefined;
  private _icon: string | { light: string; dark: string } | undefined;
  private _items: T[] = [];
  private _canSelectMany = false;
  private _hideItemSections = false;
  private _minHeight: string | undefined;
  private readonly _onDidConfirmSelection = new Emitter<number[]>();
  private readonly _onDidHide = new Emitter<void>();

  constructor(
    private id: number,
    private registry: CustomPickRegistry,
    private apiSender: ApiSenderType,
  ) {}

  readonly onDidConfirmSelection: Event<number[]> = this._onDidConfirmSelection.event;
  readonly onDidHide: Event<void> = this._onDidHide.event;

  get title(): string | undefined {
    return this._title;
  }

  set title(title: string | undefined) {
    this._title = title;
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(description: string | undefined) {
    this._description = description;
  }

  get icon(): string | { light: string; dark: string } | undefined {
    return this._icon;
  }

  set icon(icon: string | { light: string; dark: string } | undefined) {
    this._icon = icon;
  }

  get items(): T[] {
    return this._items;
  }

  set items(items: T[]) {
    this._items = items;
  }

  get canSelectMany(): boolean {
    return this._canSelectMany;
  }

  set canSelectMany(canSelectMany: boolean) {
    this._canSelectMany = canSelectMany;
  }

  get hideItemSections(): boolean {
    return this._hideItemSections;
  }

  set hideItemSections(hideItemSections: boolean) {
    this._hideItemSections = hideItemSections;
  }

  get minHeight(): string | undefined {
    return this._minHeight;
  }

  set minHeight(minHeight: string) {
    this._minHeight = minHeight;
  }

  show(): void {
    const data = {
      id: this.id,
      title: this._title,
      description: this._description,
      icon: this._icon,
      items: this._items,
      canSelectMany: this._canSelectMany,
      hideItemSections: this._hideItemSections,
      minHeight: this.minHeight,
    };

    // need to send the options to the frontend
    this.apiSender.send('showCustomPick:add', data);
  }

  hide(): void {
    this._onDidHide.fire();
    this.registry.removeEntry(this.id);
  }

  dispose(): void {
    this._onDidConfirmSelection.dispose();
    this._onDidHide.dispose();
  }

  confirmSelection(indexes: number[]): void {
    this._onDidConfirmSelection.fire(indexes);
  }
}
