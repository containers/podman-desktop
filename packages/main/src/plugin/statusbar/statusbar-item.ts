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

import crypto from 'node:crypto';

import type { StatusBarAlignment, StatusBarItem } from '@podman-desktop/api';

import type { StatusBarRegistry } from './statusbar-registry.js';

export const StatusBarAlignLeft = 'LEFT';
export const StatusBarAlignRight = 'RIGHT';
export const StatusBarItemDefaultPriority = 0;

export class StatusBarItemImpl implements StatusBarItem {
  private readonly _id: string;
  private readonly _alignment: StatusBarAlignment;
  private readonly _priority: number;

  private _text: string | undefined;
  private _tooltip: string | undefined;
  private isVisible = false;
  private _iconClass: string | { active: string; inactive: string } | undefined;
  private _enabled = true;
  private _highlight = false;

  private _command: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _commandArgs: any[] | undefined;

  private registry: StatusBarRegistry;

  constructor(registry: StatusBarRegistry, alignment: StatusBarAlignment, priority = 0) {
    this.registry = registry;
    this._alignment = alignment;
    this._priority = priority;
    this._id = StatusBarItemImpl.nextId();
  }

  public get highlight(): boolean {
    return this._highlight;
  }

  public set highlight(highlight: boolean) {
    this._highlight = highlight;
    this.update();
  }

  public get alignment(): StatusBarAlignment {
    return this._alignment;
  }

  public get priority(): number {
    return this._priority;
  }

  public get text(): string | undefined {
    return this._text;
  }

  public set text(text: string | undefined) {
    this._text = text;
    this.update();
  }

  public get tooltip(): string | undefined {
    return this._tooltip;
  }

  public set tooltip(tooltip: string | undefined) {
    this._tooltip = tooltip;
    this.update();
  }

  public get iconClass(): string | { active: string; inactive: string } | undefined {
    return this._iconClass;
  }

  public set iconClass(iconClass: string | { active: string; inactive: string } | undefined) {
    this._iconClass = iconClass;
    this.update();
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(enabled: boolean) {
    this._enabled = enabled;
    this.update();
  }

  public get command(): string | undefined {
    return this._command;
  }

  public set command(command: string | undefined) {
    this._command = command;
    this.update();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get commandArgs(): any[] | undefined {
    return this._commandArgs;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public set commandArgs(commandArgs: any[] | undefined) {
    this._commandArgs = commandArgs;
    this.update();
  }

  hide(): void {
    this.registry.removeEntry(this._id);
  }

  dispose(): void {
    this.hide();
  }

  show(): void {
    this.isVisible = true;
    this.update();
  }

  private update(): void {
    if (!this.isVisible) {
      return;
    }

    this.registry.setEntry(
      this._id,
      this._alignment === 'LEFT',
      this._priority,
      this._text,
      this._tooltip,
      this._iconClass,
      this._enabled,
      this._command,
      this._commandArgs,
    );
  }

  static nextId(): string {
    const generatedId = crypto.randomUUID();
    return StatusBarItemImpl.ID_PREFIX + ':' + generatedId;
  }

  static ID_PREFIX = 'status-bar-item';
}
