/*---------------------------------------------------------------------------------------------
 *  Copyright (C) Microsoft Corporation. All rights reserved.
 *  Copyright (C) 2022 - 2023 Red Hat, Inc.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this
 *  software and associated documentation files (the "Software"), to deal in the Software
 *  without restriction, including without limitation the rights to use, copy, modify,
 *  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to the following
 *  conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies
 *  or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 *  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 *  OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *--------------------------------------------------------------------------------------------*/

import Logger from './logger';

export class Keychain {
  private memoryStore = new Map<string, string>();

  constructor(private serviceId: string) {}
  async setToken(token: string): Promise<void> {
    try {
      Logger.info(`Storing token for ${this.serviceId}`);
      this.memoryStore.set(this.serviceId, token);
    } catch (e: any) {
      // Ignore
      Logger.error(`Storing ${this.serviceId} token failed: ${e.message}`);
      const troubleshooting = 'Troubleshooting Guide';
      // const result = await vscode.window.showErrorMessage(`Writing login information to the keychain failed with error '${e.message}'.`, troubleshooting);
      // if (result === troubleshooting) {
      // 	vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/settings-sync#_troubleshooting-keychain-issues'));
      // }
    }
  }

  async getToken(): Promise<string | null | undefined> {
    try {
      return Promise.resolve(this.memoryStore.get(this.serviceId));
    } catch (e) {
      // Ignore
      Logger.error(`Getting ${this.serviceId} token failed: ${e}`);
      return Promise.resolve(undefined);
    }
  }

  async deleteToken(): Promise<void> {
    try {
      Logger.info(`Deleting token for ${this.serviceId}`);
      this.memoryStore.delete(this.serviceId);
    } catch (e) {
      // Ignore
      Logger.error(`Deleting ${this.serviceId} token failed: ${e}`);
    }
    return Promise.resolve(undefined);
  }
}
