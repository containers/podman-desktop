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

import { afterEach } from 'node:test';

import type { WebviewApi } from '@podman-desktop/webview-api';
import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ColorInfo } from '/@api/color-info';
import type { WebviewInfo } from '/@api/webview-info';

import { WebviewPreload } from './webview-preload';

let webviewPreload: TestWebwiewPreload;

class TestWebwiewPreload extends WebviewPreload {
  async getWebviews(): Promise<WebviewInfo[]> {
    return super.getWebviews();
  }
  buildApi(): WebviewApi {
    return super.buildApi();
  }
  ipcRendererOn(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): void {
    super.ipcRendererOn(channel, listener);
  }
  async ipcInvoke(channel: string, ...args: unknown[]): Promise<unknown> {
    return super.ipcInvoke(channel, ...args);
  }
  changeContent(): void {
    super.changeContent();
  }
  postWebviewMessage(message: unknown): void {
    super.postWebviewMessage(message);
  }
  async getTheme(): Promise<string> {
    return super.getTheme();
  }
  async getColors(themeId: string): Promise<ColorInfo[]> {
    return super.getColors(themeId);
  }
  async isDarkTheme(theme: string): Promise<boolean> {
    return super.isDarkTheme(theme);
  }
}

const webviewInfo: WebviewInfo = {
  id: '123',
  viewType: 'test',
  sourcePath: 'testPath',
  icon: 'testIcon',
  name: 'test',
  html: '<html>hello world</html>',
  uuid: '12-12-12-12',
  state: { foo: 'bar' },
};

vi.mock('electron', async () => {
  return {
    contextBridge: {
      exposeInMainWorld: vi.fn(),
    },
    ipcRenderer: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
      invoke: vi.fn(),
    },
    ipcMain: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
    },
  };
});

let spyIpcRendererOn: MockInstance<
  [channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void],
  void
>;
let spyBuildApi: MockInstance<[], WebviewApi>;
beforeEach(() => {
  vi.resetAllMocks();
  webviewPreload = new TestWebwiewPreload('123');
  // mock the window object
  (window as any).addEventListener = vi.fn();
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  // override the getWebviews method
  const spyGetWebviews = vi.spyOn(webviewPreload, 'getWebviews');
  spyGetWebviews.mockResolvedValue([webviewInfo]);

  // override buildApi method
  spyBuildApi = vi.spyOn(webviewPreload, 'buildApi');
  spyBuildApi.mockReturnValue({} as WebviewApi);

  // override ipcRendererOn
  spyIpcRendererOn = vi.spyOn(webviewPreload, 'ipcRendererOn');
  spyIpcRendererOn.mockImplementation(() => {});
});

test('check init method', async () => {
  await webviewPreload.init();

  // check it adds addEventListener to the window object
  expect(window.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

  // check exposure of the function to javascript
  expect(vi.mocked(contextBridge.exposeInMainWorld)).toHaveBeenCalledWith(
    'acquirePodmanDesktopApi',
    expect.any(Function),
  );

  // check we register 2 event listener on ipcRenderer
  expect(spyIpcRendererOn).toHaveBeenCalledWith('webview-post-message', expect.any(Function));
  expect(spyIpcRendererOn).toHaveBeenCalledWith('webview-update-html', expect.any(Function));
});

describe('ipcInvoke', () => {
  test('check custom ipcInvoke method', async () => {
    // override the ipcRenderer.invoke method
    const spyIpcRendererInvoke = vi.spyOn(ipcRenderer, 'invoke');

    const fakeResult = 'foo';
    // fake remote implementation sending no error and foo as result
    spyIpcRendererInvoke.mockImplementation(() => Promise.resolve({ result: fakeResult, error: undefined }));

    const result = await webviewPreload.ipcInvoke('test', 'arg1');

    expect(result).toStrictEqual(fakeResult);
    expect(spyIpcRendererInvoke).toHaveBeenCalledWith('test', 'arg1');
  });

  test('check custom ipcInvoke method with error', async () => {
    // override the ipcRenderer.invoke method
    const spyIpcRendererInvoke = vi.spyOn(ipcRenderer, 'invoke');

    const fakeError = new Error('dummy error');
    // fake remote implementation sending no error and foo as result
    spyIpcRendererInvoke.mockImplementation(() => Promise.resolve({ result: undefined, error: fakeError }));

    await expect(webviewPreload.ipcInvoke('test', 'arg1')).rejects.toThrow('dummy error');

    expect(spyIpcRendererInvoke).toHaveBeenCalledWith('test', 'arg1');
  });
});

describe('changeContent', () => {
  const originalDocument = document;
  beforeEach(() => {
    // spy document.write method
    document = originalDocument.implementation.createHTMLDocument('');
  });
  afterEach(() => {
    document = originalDocument;
  });

  test('check with light theme', async () => {
    // spy document.write method
    const spyDocumentWrite = vi.spyOn(document, 'write');

    // spy getTheme method
    const spyGetTheme = vi.spyOn(webviewPreload, 'getTheme');
    spyGetTheme.mockResolvedValue('light');

    // spy getColors method
    const spyGetColors = vi.spyOn(webviewPreload, 'getColors');
    spyGetColors.mockResolvedValue([{ id: 'my-color', value: 'test', cssVar: '--pd-my-color' }]);

    // spy isDarkTheme method
    const spyIsDarkTheme = vi.spyOn(webviewPreload, 'isDarkTheme');
    spyIsDarkTheme.mockResolvedValue(false);

    // override window.addEventListener to keep the callback
    const spyAddEventListener = vi.spyOn(window, 'addEventListener');

    // call changeContent it should not do anything as we're missing all conditions
    webviewPreload.changeContent();

    // check document.write method has not been called
    expect(spyDocumentWrite).not.toHaveBeenCalled();

    // call init to set the webviewInfo
    await webviewPreload.init();

    const callback: any = spyAddEventListener.mock.calls[0][1];

    // call the callback that should call changeContent as we'll have two mandatory fields
    callback();

    // wait timeout execute
    await new Promise(resolve => setTimeout(resolve, 100));

    // check the document.write method has been called
    expect(spyDocumentWrite).toHaveBeenCalledWith(`<!DOCTYPE html>
<html><head></head><body>hello world</body></html>`);

    // check getTheme has been called
    expect(spyGetTheme).toHaveBeenCalled();

    // check getColors has been called
    expect(spyGetColors).toHaveBeenCalledWith('light');

    // check the createCssForColors method has been called and contains the expected css
    expect(document.head.innerHTML).toContain('<style type="text/css"');
    expect(document.head.textContent).toContain('--pd-my-color: test;');
    expect(document.head.textContent).toContain('color-scheme: light;');
  });

  test('check with dark theme', async () => {
    // spy document.write method
    const spyDocumentWrite = vi.spyOn(document, 'write');

    // spy getTheme method
    const spyGetTheme = vi.spyOn(webviewPreload, 'getTheme');
    spyGetTheme.mockResolvedValue('dark');

    // spy getColors method
    const spyGetColors = vi.spyOn(webviewPreload, 'getColors');
    spyGetColors.mockResolvedValue([{ id: 'my-color', value: 'test', cssVar: '--pd-my-color' }]);

    // spy isDarkTheme method
    const spyIsDarkTheme = vi.spyOn(webviewPreload, 'isDarkTheme');
    spyIsDarkTheme.mockResolvedValue(true);

    // override window.addEventListener to keep the callback
    const spyAddEventListener = vi.spyOn(window, 'addEventListener');

    // call changeContent it should not do anything as we're missing all conditions
    webviewPreload.changeContent();

    // check document.write method has not been called
    expect(spyDocumentWrite).not.toHaveBeenCalled();

    // call init to set the webviewInfo
    await webviewPreload.init();

    const callback: any = spyAddEventListener.mock.calls[0][1];

    // call the callback that should call changeContent as we'll have two mandatory fields
    callback();

    // wait timeout execute
    await new Promise(resolve => setTimeout(resolve, 100));

    // check the document.write method has been called
    expect(spyDocumentWrite).toHaveBeenCalledWith(`<!DOCTYPE html>
<html><head></head><body>hello world</body></html>`);

    // check getTheme has been called
    expect(spyGetTheme).toHaveBeenCalled();

    // check getColors has been called
    expect(spyGetColors).toHaveBeenCalledWith('dark');

    // check the createCssForColors method has been called and contains the expected css
    expect(document.head.innerHTML).toContain('<style type="text/css"');
    expect(document.head.textContent).toContain('--pd-my-color: test;');
    expect(document.head.textContent).toContain('color-scheme: dark;');
  });
});

test('check buildApi', async () => {
  // spy postWebviewMessage
  const spyPostWebviewMessage = vi.spyOn(webviewPreload, 'postWebviewMessage');

  // spy ipcInvoke
  const spyIpcInvoke = vi.spyOn(webviewPreload, 'ipcInvoke');
  spyIpcInvoke.mockImplementation(() => Promise.resolve({ result: undefined, error: undefined }));

  // remove spy on buildApi
  spyBuildApi.mockRestore();

  // mock the contextBridge to grab the api object
  let webviewApi: WebviewApi | undefined = undefined;
  vi.mocked(contextBridge.exposeInMainWorld).mockImplementation((name: string, api: () => WebviewApi) => {
    webviewApi = api();
  });

  // init to set the webviewInfo
  await webviewPreload.init();

  if (!webviewApi) {
    throw new Error('webviewApi should be defined');
  }
  const podmanDesktopWebwievApi: WebviewApi = webviewApi;

  // check exposeInMainWorld has been called
  expect(vi.mocked(contextBridge.exposeInMainWorld)).toHaveBeenCalledWith(
    'acquirePodmanDesktopApi',
    expect.any(Function),
  );

  expect(podmanDesktopWebwievApi).toBeDefined();

  // check the podmanDesktopApi object is returned
  //get state that should be the one from the webviewInfo
  expect(podmanDesktopWebwievApi.getState()).toStrictEqual(webviewInfo.state);

  //post message
  podmanDesktopWebwievApi.postMessage('test');

  expect(spyPostWebviewMessage).toHaveBeenCalledWith({ command: 'onmessage', data: 'test' });

  // clear calls on spyIpcInvoke
  spyIpcInvoke.mockClear();

  //set state
  const newFakeState = { updated: 'state' };
  await podmanDesktopWebwievApi.setState(newFakeState);

  // check ipcInvoke has been called
  expect(spyIpcInvoke).toHaveBeenCalledWith('webviewRegistry:update-state', webviewInfo.id, newFakeState);
});
