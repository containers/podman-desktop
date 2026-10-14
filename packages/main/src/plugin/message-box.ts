/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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
  ButtonsType,
  DialogType,
  DropdownType,
  IconButtonType,
  MessageBoxOptions,
  MessageBoxReturnValue,
} from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { inject, injectable } from 'inversify';

interface MessageBoxCallback {
  deferred: PromiseWithResolvers<MessageBoxReturnValue>;
  buttons: ButtonsType[];
}

@injectable()
export class MessageBox {
  private callbackId = 0;

  private callbacksMessageBox = new Map<number, MessageBoxCallback>();

  constructor(@inject(ApiSenderType) private apiSender: ApiSenderType) {}

  async showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue> {
    this.callbackId++;

    const deferred = Promise.withResolvers<MessageBoxReturnValue>();

    this.callbacksMessageBox.set(this.callbackId, {
      deferred,
      buttons: options.buttons ?? [],
    });

    const data = {
      id: this.callbackId,
      title: options.title,
      message: options.message,
      detail: options.detail,
      buttons: options.buttons,
      type: options.type,
      defaultId: options.defaultId,
      cancelId: options.cancelId,
      footerMarkdownDescription: options.footerMarkdownDescription,
    };

    this.apiSender.send('showMessageBox:open', data);

    return deferred.promise;
  }

  isDropdownType(response?: ButtonsType): response is DropdownType {
    return (
      typeof response === 'object' &&
      response !== null &&
      'heading' in response &&
      'buttons' in response &&
      Array.isArray((response as DropdownType).buttons)
    );
  }

  private getButtonLabel(button: ButtonsType): string {
    if (typeof button === 'string') return button;
    if (button.type === 'dropdownButton') return (button as DropdownType).heading;
    if (button.type === 'iconButton') return (button as IconButtonType).label;
    return '';
  }

  async showDialog(
    type: DialogType,
    title: string,
    message: string,
    items: ButtonsType[],
  ): Promise<string | undefined> {
    const result = await this.showMessageBox({
      title: title,
      message: message,
      buttons: items,
      type: type,
    });

    if (result.response !== undefined) {
      if (result.dropdownIndex !== undefined && result.dropdownIndex >= 0) {
        const button = items.find(b => this.isDropdownType(b) && b.heading === result.response);
        if (button && this.isDropdownType(button)) return button.buttons[result.dropdownIndex];
      }
      return result.response;
    }

    return undefined;
  }

  async onDidSelectButton(id: number, selectedIndex?: number, dropdownIndex?: number): Promise<void> {
    const entry = this.callbacksMessageBox.get(id);

    if (entry) {
      let response: string | undefined;
      if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < entry.buttons.length) {
        const button = entry.buttons[selectedIndex];
        if (button !== undefined) {
          response = this.getButtonLabel(button);
        }
      }
      entry.deferred.resolve({ response, dropdownIndex });
    }

    this.callbacksMessageBox.delete(id);
  }
}
