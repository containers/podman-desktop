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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '/@/plugin/api.js';

import { Uri } from '../types/uri.js';
import type { WebviewImpl } from './webview-impl.js';
import { WebviewPanelImpl } from './webview-panel-impl.js';
import type { WebviewRegistry } from './webview-registry.js';

let webviewPanelImpl: WebviewPanelImpl;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const webviewImpl: WebviewImpl = {
  dispose: vi.fn(),
} as unknown as WebviewImpl;

const webviewRegistry: WebviewRegistry = {
  disposeWebviewPanel: vi.fn(),
} as unknown as WebviewRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  webviewPanelImpl = new WebviewPanelImpl('internalId0', webviewRegistry, apiSender, webviewImpl, {
    title: 'title',
    viewType: 'customViewType',
  });
});

test('check internalId', async () => {
  // expect internalId is correct
  expect(webviewPanelImpl.internalId).toBe('internalId0');
});

test('check viewType', async () => {
  // expect viewType is correct
  expect(webviewPanelImpl.viewType).toBe('customViewType');
});

test('check viewType if disposed', async () => {
  webviewPanelImpl.dispose();

  // expect viewType is impossible to get
  expect(() => webviewPanelImpl.viewType).toThrow('The webview panel customViewType/title has been disposed');
});

test('allow to update title', async () => {
  // expect initial title is title
  expect(webviewPanelImpl.title).toBe('title');

  webviewPanelImpl.title = 'newTitle';

  // expect title has been updated
  expect(webviewPanelImpl.title).toBe('newTitle');

  // expect apiSender.send has been called with correct parameters
  expect(apiSender.send).toHaveBeenCalledWith('webview-panel-update:title', {
    id: webviewPanelImpl.internalId,
    title: 'newTitle',
  });
});

test('unable to update title if disposed', async () => {
  // dispose the webview
  webviewPanelImpl.dispose();

  // expect update will fail
  expect(() => (webviewPanelImpl.title = 'newTitle')).toThrow(
    'The webview panel customViewType/title has been disposed',
  );

  // expect apiSender.send not called
  expect(apiSender.send).not.toBeCalled();
});

test('check visible', async () => {
  // expect visible is correct
  expect(webviewPanelImpl.visible).toBeFalsy();
});

test('check visible if disposed', async () => {
  webviewPanelImpl.dispose();

  // expect visible is impossible to get
  expect(() => webviewPanelImpl.visible).toThrow('The webview panel customViewType/title has been disposed');
});

test('check active', async () => {
  // expect active is correct
  expect(webviewPanelImpl.active).toBeFalsy();
});

test('check active if disposed', async () => {
  webviewPanelImpl.dispose();

  // expect active is impossible to get
  expect(() => webviewPanelImpl.active).toThrow('The webview panel customViewType/title has been disposed');
});

test('check webview', async () => {
  // expect webview is correct
  expect(webviewPanelImpl.webview).toStrictEqual(webviewImpl);
});

test('check iconPath', async () => {
  expect(webviewPanelImpl.iconPath).toBeUndefined();
});

test('check set simple iconPath', async () => {
  webviewPanelImpl.iconPath = Uri.parse('https://www.podman-desktop.io/icon.png');

  // expect iconPath is correct
  expect(webviewPanelImpl.iconPath).toBeDefined();

  // check apiSender called
  expect(apiSender.send).toHaveBeenCalledWith('webview-update');
});

test('check set complex iconPath', async () => {
  webviewPanelImpl.iconPath = {
    light: Uri.parse('https://www.podman-desktop.io/light'),
    dark: Uri.parse('https://www.podman-desktop.io/dark'),
  };

  // expect iconPath is correct
  expect(webviewPanelImpl.iconPath).toBeDefined();

  // check light and dark
  expect((webviewPanelImpl.iconPath as any)?.light).toStrictEqual(Uri.parse('https://www.podman-desktop.io/light'));
  expect((webviewPanelImpl.iconPath as any).dark).toStrictEqual(Uri.parse('https://www.podman-desktop.io/dark'));

  // check apiSender called
  expect(apiSender.send).toHaveBeenCalledWith('webview-update');
});

test('check updateViewState', async () => {
  let called = false;
  webviewPanelImpl.onDidChangeViewState(() => {
    called = true;
  });

  // check active and visible are false
  expect(webviewPanelImpl.active).toBeFalsy();
  expect(webviewPanelImpl.visible).toBeFalsy();

  // update view state
  webviewPanelImpl.updateViewState(true, true);

  // check active and visible are true
  expect(webviewPanelImpl.active).toBeTruthy();
  expect(webviewPanelImpl.visible).toBeTruthy();

  // check onDidChangeViewState has been called
  expect(called).toBeTruthy();
});

test('check partial updateViewState', async () => {
  let called = false;
  webviewPanelImpl.onDidChangeViewState(() => {
    called = true;
  });

  // check active and visible are false
  expect(webviewPanelImpl.active).toBeFalsy();
  expect(webviewPanelImpl.visible).toBeFalsy();

  // update view state
  webviewPanelImpl.updateViewState(false, true);

  // check active and visible are true and false
  expect(webviewPanelImpl.active).toBeTruthy();
  expect(webviewPanelImpl.visible).toBeFalsy();

  // check onDidChangeViewState has been called
  expect(called).toBeTruthy();
});

test('check no updateViewState', async () => {
  let called = false;
  webviewPanelImpl.onDidChangeViewState(() => {
    called = true;
  });

  // check active and visible are false
  expect(webviewPanelImpl.active).toBeFalsy();
  expect(webviewPanelImpl.visible).toBeFalsy();

  // update view state but with same value, should not trigger anything
  webviewPanelImpl.updateViewState(false, false);

  // check active and visible are  still false
  expect(webviewPanelImpl.active).toBeFalsy();
  expect(webviewPanelImpl.visible).toBeFalsy();

  // check onDidChangeViewState has not been called
  expect(called).toBeFalsy();
});

test('check updateViewState if disposed', async () => {
  let called = false;
  webviewPanelImpl.onDidChangeViewState(() => {
    called = true;
  });

  // check active and visible are false
  expect(webviewPanelImpl.active).toBeFalsy();
  expect(webviewPanelImpl.visible).toBeFalsy();

  // dispose the webviewPanelImpl
  webviewPanelImpl.dispose();

  // update view state
  webviewPanelImpl.updateViewState(true, true);

  // check onDidChangeViewState has not been called
  expect(called).toBeFalsy();
});

test('check reveal with true', async () => {
  webviewPanelImpl.reveal(true);

  // check apiSender called
  expect(apiSender.send).toHaveBeenCalledWith('webview-panel-reveal', { id: 'internalId0', preserveFocus: true });
});

test('check dispose', async () => {
  let called = false;
  webviewPanelImpl.onDidDispose(() => {
    called = true;
  });

  webviewPanelImpl.dispose();

  // check webviewRegistry.disposeWebviewPanel called
  expect(webviewRegistry.disposeWebviewPanel).toHaveBeenCalledWith(webviewPanelImpl);

  // check webview dipose called
  expect(webviewImpl.dispose).toHaveBeenCalled();

  // check onDidDispose has been called
  expect(called).toBeTruthy();

  // clear calls
  vi.mocked(webviewRegistry.disposeWebviewPanel).mockClear();

  // call dispose again
  webviewPanelImpl.dispose();

  // check webviewRegistry.disposeWebviewPanel not called
  expect(webviewRegistry.disposeWebviewPanel).not.toHaveBeenCalled();
});
