/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
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
