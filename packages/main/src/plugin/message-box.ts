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
import { Deferred } from './util/deferred';

type DialogType = 'none' | 'info' | 'error' | 'question' | 'warning';

/**
 * Options to configure the behavior of the message box UI.
 */
export interface MessageBoxOptions {
  /**
   * The title of the message box.
   */
  title: string;
  /**
   * The primary message.
   */
  message: string;
  /**
   * Text for buttons.
   */
  buttons: string[];
  /**
   * The (optional) type, one of 'none' | 'info' | 'error' | 'question' | 'warning'.
   */
  type?: string;
}

export interface MessageBoxReturnValue {
  response: number;
}

export class MessageBox {
  private callbackId = 0;

  private callbacksMessageBox = new Map<number, Deferred<MessageBoxReturnValue>>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private apiSender: any) {}

  async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
    // keep track of this request
    this.callbackId++;

    // create a promise that will be resolved when the frontend sends the result
    const deferred = new Deferred<MessageBoxReturnValue>();

    // store the callback that will resolve the promise
    this.callbacksMessageBox.set(this.callbackId, deferred);

    const data = {
      id: this.callbackId,
      title: options.title,
      message: options.message,
      buttons: options.buttons,
      type: options.type,
    };

    // need to send the options to the frontend
    this.apiSender.send('showMessageBox:open', data);

    // return the promise
    return deferred.promise;
  }

  async showDialog(type: DialogType, title: string, message: string, items: string[]): Promise<string | undefined> {
    const result = await this.showMessageBox({
      title: title,
      message: message,
      buttons: items,
      type: type,
    });

    if (result.response) {
      return items[result.response];
    }

    return undefined;
  }

  // this method is called by the frontend when the user selected a button
  async onDidSelectButton(id: number, selectedIndex: number) {
    // get the callback
    const callback = this.callbacksMessageBox.get(id);

    // if there is a callback
    if (callback) {
      // grab item
      const val: MessageBoxReturnValue = {
        response: selectedIndex,
      };
      // resolve the promise
      callback.resolve(val);
    }

    // remove the callback
    this.callbacksMessageBox.delete(id);
  }
}
