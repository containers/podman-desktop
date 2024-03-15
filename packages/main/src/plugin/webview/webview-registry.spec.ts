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

import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Router } from 'express';
import type express from 'express';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '/@/plugin/api.js';

import type { WebviewPanelImpl } from './webview-panel-impl.js';
import { WebviewRegistry } from './webview-registry.js';

// mock node:fs
vi.mock('node:fs');

// mock express dependency and default export
vi.mock('express', () => ({
  default: (): any => {
    return {
      use: vi.fn(),
      listen: vi.fn().mockImplementation((portNumber, func: any) => {
        func();
        return { on: vi.fn() };
      }),
      on: vi.fn().mockResolvedValue(undefined),
    };
  },
}));

// provide a custom free port number
vi.mock('../util/port.js', () => ({
  getFreePort: (): Promise<number> => Promise.resolve(45678),
}));

class TestWebviewRegistry extends WebviewRegistry {
  buildRouter(): Router {
    return super.buildRouter();
  }

  configureRouter(router: express.Router): void {
    super.configureRouter(router);
  }
}

let webviewRegistry: TestWebviewRegistry;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const getRouterMock = vi.fn();
const fakeRouter = {
  get: getRouterMock,
} as unknown as Router;

let spyRouter: MockInstance<[], Router>;

const currentConsoleLog = console.log;
beforeEach(() => {
  vi.resetAllMocks();
  console.log = vi.fn();
  webviewRegistry = new TestWebviewRegistry(apiSender);

  // mock buildRouter method
  spyRouter = vi.spyOn(webviewRegistry, 'buildRouter').mockReturnValue(fakeRouter);
});

afterEach(() => {
  console.log = currentConsoleLog;
});

test('check start', async () => {
  // check it start an express server on a free port
  await webviewRegistry.start();

  // check we asked to build a router
  expect(spyRouter).toHaveBeenCalled();

  // expect trace of the start in the log
  expect(console.log).toHaveBeenCalledWith('Starting http server to handle webviews on port', 45678);

  expect(webviewRegistry.getRegistryHttpPort()).toBe(45678);
});

function getRouterFunction(path: string): (req: any, res: any) => void {
  const map = new Map<string, (req: any, res: any) => void>();

  // create a mock of expres.Router
  const routerMock = {
    // store functions in the map
    get: vi.fn().mockImplementation((path: string, func: any) => {
      map.set(path, func);
    }),
  } as unknown as Router;

  // call configureRouter
  webviewRegistry.configureRouter(routerMock);

  // check we have 1 mapping
  expect(map.size).toBe(1);

  // check the mapping is correct
  expect(map.get('/*')).toBeDefined();

  // get the function
  return map.get(path)!;
}

test('check configureRouter with missing referrer', async () => {
  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    headers: {
      referer: undefined,
    },
  };
  const sendMock = vi.fn();
  const res = {
    status: vi.fn().mockImplementation(() => {
      return {
        send: sendMock,
      };
    }),
  };
  func(req, res);

  // expect status to have been called
  expect(res.status).toHaveBeenCalledWith(500);

  // expect send to have been called
  expect(sendMock).toHaveBeenCalledWith('invalid request');
});

test('check configureRouter with root access', async () => {
  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    path: '/',
    headers: {
      referer: 'foo',
    },
  };
  const sendMock = vi.fn();
  const res = {
    status: vi.fn(),
    send: sendMock,
  };
  func(req, res);

  // expect status not called
  expect(res.status).not.toHaveBeenCalled();

  // expect send to have been called
  expect(sendMock).toHaveBeenCalledWith('<html></html>');
});

test('check configureRouter with invalid uuid', async () => {
  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    hostname: '123',
    headers: {
      referer: 'foo',
    },
  };
  const sendMock = vi.fn();
  const res = {
    status: vi.fn().mockImplementation(() => {
      return {
        send: sendMock,
      };
    }),
  };
  func(req, res);

  // expect status not called
  expect(res.status).toHaveBeenCalledWith(404);

  // expect send to have been called
  expect(sendMock).toHaveBeenCalledWith('not found');
});

test('check configureRouter with valid uuid but no matching webview', async () => {
  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    path: '/my-requested-folder/my-requested-file.html',
    hostname: `58b7cdef-294f-4ace-93cc-de6e0a139592.webview.localhost`,
    headers: {
      referer: 'foo',
    },
  };
  const sendMock = vi.fn();
  const res = {
    sendFile: vi.fn(),
    status: vi.fn().mockImplementation(() => {
      return {
        send: sendMock,
      };
    }),
  };

  func(req, res);

  // status 500
  expect(res.status).toHaveBeenCalledWith(500);

  // send not found
  expect(sendMock).toHaveBeenCalledWith('missing parameter');

  // sendfile not to have been called
  expect(res.sendFile).not.toHaveBeenCalled();
});

test('check configureRouter with valid uuid and file exists', async () => {
  // spy fs.existsSync
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  // register the webview first
  const panel = webviewRegistry.createWebviewPanel(
    { id: 'extensionId', extensionPath: '/extensionPath' },
    'viewTypeInfo',
    'customTitle',
  );
  const panelImpl = panel as WebviewPanelImpl;
  const uuid = panelImpl.webview.uuid;

  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    path: '/my-requested-folder/my-requested-file.html',
    hostname: `${uuid}.webview.localhost`,
    headers: {
      referer: 'foo',
    },
  };
  const sendMock = vi.fn();
  const res = {
    sendFile: vi.fn(),
    status: vi.fn().mockImplementation(() => {
      return {
        send: sendMock,
      };
    }),
  };

  func(req, res);

  // sendfile to have been called
  expect(res.sendFile).toHaveBeenCalledWith(
    expect.stringContaining(`${path.sep}extensionPath${path.sep}my-requested-folder${path.sep}my-requested-file.html`),
  );
});

test('check configureRouter with valid uuid and file does not exist', async () => {
  // spy fs.existsSync
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  // register the webview first
  const panel = webviewRegistry.createWebviewPanel(
    { id: 'extensionId', extensionPath: '/extensionPath' },
    'viewTypeInfo',
    'customTitle',
  );
  const panelImpl = panel as WebviewPanelImpl;
  const uuid = panelImpl.webview.uuid;

  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    path: '/my-requested-folder/my-requested-file.html',
    hostname: `${uuid}.webview.localhost`,
    headers: {
      referer: 'foo',
    },
  };
  const sendMock = vi.fn();
  const res = {
    sendFile: vi.fn(),
    status: vi.fn().mockImplementation(() => {
      return {
        send: sendMock,
      };
    }),
  };

  func(req, res);

  // status 404
  expect(res.status).toHaveBeenCalledWith(404);

  // send not found
  expect(sendMock).toHaveBeenCalledWith('not found');

  // sendfile not to have been called
  expect(res.sendFile).not.toHaveBeenCalled();
});

test('check configureRouter with valid uuid and file from another directory', async () => {
  // spy fs.existsSync
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  // register the webview first
  const panel = webviewRegistry.createWebviewPanel(
    { id: 'extensionId', extensionPath: '/extensionPath' },
    'viewTypeInfo',
    'customTitle',
  );
  const panelImpl = panel as WebviewPanelImpl;
  const uuid = panelImpl.webview.uuid;

  const func = getRouterFunction('/*');
  // now test the missing referer
  const req = {
    path: '../different-directory',
    hostname: `${uuid}.webview.localhost`,
    headers: {
      referer: 'foo',
    },
  };
  const sendMock = vi.fn();
  const res = {
    sendFile: vi.fn(),
    status: vi.fn().mockImplementation(() => {
      return {
        send: sendMock,
      };
    }),
  };

  func(req, res);

  // status 404
  expect(res.status).toHaveBeenCalledWith(404);

  // send not found
  expect(sendMock).toHaveBeenCalledWith('not found');

  // sendfile not to have been called
  expect(res.sendFile).not.toHaveBeenCalled();
});

test('check makeDefaultWebviewVisible', async () => {
  // register two webviews
  const panel1 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId1', extensionPath: '/extensionPath1' },
    'viewTypeInfo',
    'customTitle1',
  );
  const panelImpl1 = panel1 as WebviewPanelImpl;
  const spyUpdateViewState1 = vi.spyOn(panelImpl1, 'updateViewState');

  const panel2 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId2', extensionPath: '/extensionPath2' },
    'viewTypeInfo',
    'customTitle2',
  );
  const panelImpl2 = panel2 as WebviewPanelImpl;
  const spyUpdateViewState2 = vi.spyOn(panelImpl2, 'updateViewState');

  await webviewRegistry.makeDefaultWebviewVisible(panelImpl1.internalId);

  expect(spyUpdateViewState1).toHaveBeenCalledWith(true, true);
  expect(spyUpdateViewState2).toHaveBeenCalledWith(false, false);

  // now call again with the second webview (reset first the calls)
  spyUpdateViewState1.mockClear();
  spyUpdateViewState2.mockClear();
  await webviewRegistry.makeDefaultWebviewVisible(panelImpl2.internalId);
  expect(spyUpdateViewState1).toHaveBeenCalledWith(false, false);
  expect(spyUpdateViewState2).toHaveBeenCalledWith(true, true);
});

test('check postMessageToWebview', async () => {
  const panel1 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId1', extensionPath: '/extensionPath1' },
    'viewTypeInfo',
    'customTitle1',
  );
  const panelImpl1 = panel1 as WebviewPanelImpl;

  // spy webviewImpl.handleMessage
  const spyHandleMessage = vi.spyOn(panelImpl1.webview, 'handleMessage');

  await webviewRegistry.postMessageToWebview(panelImpl1.internalId, { data: 'hello world' });

  // check
  expect(spyHandleMessage).toHaveBeenCalledWith('hello world');
});

test('check updateWebviewState', async () => {
  const panel1 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId1', extensionPath: '/extensionPath1' },
    'viewTypeInfo',
    'customTitle1',
  );
  const panelImpl1 = panel1 as WebviewPanelImpl;

  await webviewRegistry.updateWebviewState(panelImpl1.internalId, { state: 'myState' });

  // check
  expect(panelImpl1.webview.state).toStrictEqual({ state: 'myState' });
});

test('check listWebviews', async () => {
  // register two webviews
  const panel1 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId1', extensionPath: '/extensionPath1' },
    'viewTypeInfo',
    'customTitle1',
  );
  const panelImpl1 = panel1 as WebviewPanelImpl;
  panel1.webview.html = 'html1';
  const panel2 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId2', extensionPath: '/extensionPath2' },
    'viewTypeInfo',
    'customTitle2',
  );
  const panelImpl2 = panel2 as WebviewPanelImpl;
  panel2.webview.html = 'html2';

  const webviews = webviewRegistry.listWebviews();

  // check
  expect(webviews.length).toBe(2);
  expect(webviews[0].id).toBe(panelImpl1.internalId);
  expect(webviews[0].viewType).toBe('viewTypeInfo');
  expect(webviews[0].html).toBe('html1');

  expect(webviews[1].id).toBe(panelImpl2.internalId);
  expect(webviews[1].viewType).toBe('viewTypeInfo');
  expect(webviews[1].html).toBe('html2');
});

test('check listSimpleWebviews', async () => {
  // register two webviews
  const panel1 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId1', extensionPath: '/extensionPath1' },
    'viewTypeInfo',
    'customTitle1',
  );
  const panelImpl1 = panel1 as WebviewPanelImpl;
  panel1.webview.html = 'html1';
  const panel2 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId2', extensionPath: '/extensionPath2' },
    'viewTypeInfo',
    'customTitle2',
  );
  const panelImpl2 = panel2 as WebviewPanelImpl;
  panel2.webview.html = 'html2';

  const webviews = await webviewRegistry.listSimpleWebviews();

  // check
  expect(webviews.length).toBe(2);
  expect(webviews[0].id).toBe(panelImpl1.internalId);
  expect(webviews[0].viewType).toBe('viewTypeInfo');
  expect(webviews[0].title).toBe('customTitle1');

  expect(webviews[1].id).toBe(panelImpl2.internalId);
  expect(webviews[1].viewType).toBe('viewTypeInfo');
  expect(webviews[1].title).toBe('customTitle2');
});

test('check disposeWebviewPanel', async () => {
  // register two webviews
  const panel1 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId1', extensionPath: '/extensionPath1' },
    'viewTypeInfo',
    'customTitle1',
  );
  const panel2 = webviewRegistry.createWebviewPanel(
    { id: 'extensionId2', extensionPath: '/extensionPath2' },
    'viewTypeInfo',
    'customTitle2',
  );

  const webviews = webviewRegistry.listWebviews();

  // check
  expect(webviews.length).toBe(2);

  // dispose the first one
  webviewRegistry.disposeWebviewPanel(panel1 as WebviewPanelImpl);

  // check
  const webviewsAfterDispose = webviewRegistry.listWebviews();
  expect(webviewsAfterDispose.length).toBe(1);

  // dispose the second one
  webviewRegistry.disposeWebviewPanel(panel2 as WebviewPanelImpl);

  // check
  const webviewsAfterDispose2 = webviewRegistry.listWebviews();
  expect(webviewsAfterDispose2.length).toBe(0);
});
