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
import type { FormDialogInput } from '@podman-desktop/api';
import { Deferred } from './util/deferred.js';

export interface FormDialogOptions {
  title: string;
  inputs: FormDialogInput[];
}

export class FormDialog {
  private callbackId = 0;

  private callbacks = new Map<number, Deferred<string[]>>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private apiSender: any) {}

  async showFormDialog(options: FormDialogOptions): Promise<string[]> {
    // keep track of this request
    this.callbackId++;

    // create a promise that will be resolved when the frontend sends the result
    const deferred = new Deferred<string[]>();

    // store the callback that will resolve the promise
    this.callbacks.set(this.callbackId, deferred);

    const data = {
      id: this.callbackId,
      title: options.title,
      inputs: options.inputs,
    };

    // need to send the options to the frontend
    this.apiSender.send('showFormDialog:open', data);

    // return the promise
    return deferred.promise;
  }

  async showDialog(title: string, inputs: FormDialogInput[]): Promise<string[]> {
    return await this.showFormDialog({
      title,
      inputs,
    });
  }

  // this method is called by the frontend when the user selected a button
  async onDidOK(id: number, result: string[]) {
    // get the callback
    const callback = this.callbacks.get(id);
    // if there is a callback
    if (callback) {
      // grab item
      // resolve the promise
      callback.resolve(result);
    }
    // remove the callback
    this.callbacks.delete(id);
  }
}
