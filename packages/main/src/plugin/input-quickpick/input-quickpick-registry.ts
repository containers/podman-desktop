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

import type {
  CancellationToken,
  InputBoxOptions,
  InputBoxValidationMessage,
  QuickPickOptions,
} from '@podman-desktop/api';

import type { ApiSenderType } from '../api.js';
import { Deferred } from '../util/deferred.js';

export class InputQuickPickRegistry {
  private callbackId = 0;

  private callbacksInputBox = new Map<
    number,
    { deferred: Deferred<string | undefined>; options?: InputBoxOptions; token?: CancellationToken }
  >();

  private callbacksQuickPicks = new Map<
    number,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: readonly any[];
      deferred: Deferred<string[] | string | undefined>;
      options?: QuickPickOptions;
      token?: CancellationToken;
    }
  >();

  constructor(private apiSender: ApiSenderType) {}

  async showInputBox(options?: InputBoxOptions, token?: CancellationToken): Promise<string | undefined> {
    // keep track of this request
    this.callbackId++;

    // create a promise that will be resolved when the frontend sends the result
    const deferred = new Deferred<string | undefined>();

    // store the callback that will resolve the promise
    this.callbacksInputBox.set(this.callbackId, { deferred, options, token });

    let validate = false;
    if (options?.validateInput) {
      validate = true;
    }
    const data = {
      id: this.callbackId,
      value: options?.value,
      placeHolder: options?.placeHolder,
      title: options?.title,
      valueSelection: options?.valueSelection,
      prompt: options?.prompt,
      markdownDescription: options?.markdownDescription,
      multiline: options?.multiline,
      validate,
    };

    // need to send the options to the frontend
    this.apiSender.send('showInputBox:add', data);

    // if the token is cancelled, reject the promise
    token?.onCancellationRequested(() => {
      // ask to hide the input box
      this.apiSender.send('showInputBox:cancel', this.callbackId);

      // reject the promise
      deferred.reject('Input has been cancelled');
    });
    // return the promise
    return deferred.promise;
  }

  // this method is called by the frontend when the user has entered a value
  onInputBoxValueEntered(id: number, value: string | undefined, error?: string): void {
    // get the callback
    const callback = this.callbacksInputBox.get(id);

    // if there is a callback
    if (callback) {
      // if there is an error, reject the promise
      if (error) {
        callback.deferred.reject(error);
      } else {
        // resolve the promise
        callback.deferred.resolve(value);
      }

      // remove the callback
      this.callbacksInputBox.delete(id);
    }
  }

  // this method is called by the frontend when the user has selected a value in QuickPick
  onQuickPickValuesSelected(id: number, indexes: number[]): void {
    // get the callback
    const callback = this.callbacksQuickPicks.get(id);

    // if there is a callback
    if (callback) {
      if (callback.options?.canPickMany) {
        const allItems = indexes.map(index => callback.items[index]);
        // resolve the promise
        callback.deferred.resolve(allItems);
      } else {
        // grab item
        const item = callback.items[indexes[0]];

        // resolve the promise
        callback.deferred.resolve(item);
      }

      // remove the callback
      this.callbacksInputBox.delete(id);
    }
  }

  // this method is called by the frontend when the user has entered a value
  async validate(id: number, value: string): Promise<string | InputBoxValidationMessage | undefined | null> {
    // get the callback
    const callback = this.callbacksInputBox.get(id);

    // if there is a callback
    if (callback?.options?.validateInput) {
      return callback.options.validateInput(value);
    }
    return undefined;
  }

  // this method is called by the frontend when the user is selecting a quickPick item (focus)
  async onDidSelectQuickPickItem(id: number, index: number): Promise<void> {
    // get the callback
    const callback = this.callbacksQuickPicks.get(id);

    // if there is a callback
    if (callback?.options?.onDidSelectItem) {
      // grab item
      const item = callback.items[index];

      return callback.options.onDidSelectItem(item);
    }
    return undefined;
  }

  /**
   * Return a promise that resolves to the selected item (or undefined if cancelled)
   */
  async showQuickPick(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: readonly any[] | Promise<readonly any[]>,
    options?: QuickPickOptions,
    token?: CancellationToken,
  ): Promise<string[] | string | undefined> {
    // keep track of this request
    this.callbackId++;

    // create a promise that will be resolved when the frontend sends the result
    const deferred = new Deferred<string | string[] | undefined>();

    // check if the items are a promise
    if (items instanceof Promise) {
      // if so, wait for the promise to resolve
      items = await items;
    }

    // store the callback that will resolve the promise
    this.callbacksQuickPicks.set(this.callbackId, { items, deferred, options, token });

    let onSelectCallback = false;
    if (options?.onDidSelectItem) {
      onSelectCallback = true;
    }

    const data = {
      id: this.callbackId,
      placeHolder: options?.placeHolder,
      canPickMany: options?.canPickMany,
      title: options?.title,
      items: items,
      // need to callback to the frontend when selecting an item
      onSelectCallback,
    };

    // need to send the options to the frontend
    this.apiSender.send('showQuickPick:add', data);

    // if the token is cancelled, reject the promise
    token?.onCancellationRequested(() => {
      // ask to hide the input box
      this.apiSender.send('showQuickPick:cancel', this.callbackId);

      // reject the promise
      deferred.reject('QuickPick has been cancelled');
    });

    // return the promise
    return deferred.promise;
  }
}

/**
 * Impacts the behavior and appearance of the validation message.
 */
export enum InputBoxValidationSeverity {
  Info = 1,
  Warning = 2,
  Error = 3,
}

/**
 * The kind of {@link QuickPickItem quick pick item}.
 */
export enum QuickPickItemKind {
  /**
   * When a {@link QuickPickItem} has a kind of {@link Separator}, the item is just a visual separator and does not represent a real item.
   * The only property that applies is {@link QuickPickItem.label label }. All other properties on {@link QuickPickItem} will be ignored and have no effect.
   */
  Separator = -1,
  /**
   * The default {@link QuickPickItem.kind} is an item that can be selected in the quick pick.
   */
  Default = 0,
}
