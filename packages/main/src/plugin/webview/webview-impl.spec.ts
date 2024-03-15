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

import { beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '/@/plugin/api.js';
import { Uri } from '/@/plugin/types/uri.js';

import { WebviewImpl } from './webview-impl.js';

let webviewImpl: WebviewImpl;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

beforeEach(() => {
  vi.resetAllMocks();
  webviewImpl = new WebviewImpl(
    'customViewType',
    'internalId0',
    apiSender,
    { id: 'extensionId', extensionPath: '/extensionPath' },
    1234,
    {},
  );
});

test('allow to update html', async () => {
  // expect initial html is empty
  expect(webviewImpl.html).toBe('');

  webviewImpl.html = '<html>newCode</html>';

  // expect html has been updated
  expect(webviewImpl.html).toBe('<html>newCode</html>');

  // expect apiSender.send has been called with correct parameters
  expect(apiSender.send).toHaveBeenCalledWith('webview-update:html', {
    id: webviewImpl.internalId,
    html: '<html>newCode</html>',
  });
});

test('unable to update html if disposed', async () => {
  // dispose the webview
  webviewImpl.dispose();

  // expect update will fail
  expect(() => (webviewImpl.html = '<html>newCode</html>')).toThrow(
    'The webview coming from customViewType has been disposed',
  );

  // expect apiSender.send not called
  expect(apiSender.send).not.toBeCalled();
});

test('cspSource', async () => {
  expect(webviewImpl.cspSource).toBe('http://*.webview.localhost:1234/');
});

test('allow to update options', async () => {
  // expect initial html is empty
  expect(webviewImpl.options).toStrictEqual({});

  const newOptions = { localResourceRoots: [Uri.parse('https://www.podman-desktop.io')] };
  webviewImpl.options = newOptions;

  // expect options has been updated
  expect(webviewImpl.options).toBeDefined();
  expect(webviewImpl.options.localResourceRoots).toBeDefined();
  expect(webviewImpl.options.localResourceRoots).toHaveLength(1);
  expect(webviewImpl.options.localResourceRoots?.[0].toString()).toBe('https://www.podman-desktop.io/');

  // expect apiSender.send has been called with correct parameters
  expect(apiSender.send).toHaveBeenCalledWith('webview-update:options', {
    id: webviewImpl.internalId,
    options: expect.anything(),
  });

  // reset mock
  vi.mocked(apiSender.send).mockClear();
});

test('unable to update options if disposed', async () => {
  // dispose the webview
  webviewImpl.dispose();

  // expect update will fail
  expect(() => (webviewImpl.options = {})).toThrow('The webview coming from customViewType has been disposed');

  // expect apiSender.send not called
  expect(apiSender.send).not.toBeCalled();
});

test('allow to post messages', async () => {
  const response = await webviewImpl.postMessage('my-custom-message');

  // expect response is true
  expect(response).toBe(true);

  // expect apiSender.send has been called with correct parameters
  expect(apiSender.send).toHaveBeenCalledWith('webview-post-message', {
    id: webviewImpl.internalId,
    message: 'my-custom-message',
  });
});

test('check reject to post messages if disposed', async () => {
  // dispose the webview
  webviewImpl.dispose();

  const response = await webviewImpl.postMessage('my-custom-message');

  // expect response is false
  expect(response).toBe(false);

  // expect apiSender.send has been called with correct parameters
  expect(apiSender.send).not.toHaveBeenCalled();
});

test('allow to read/write the state (internal usage)', async () => {
  // expect initial state is {}
  expect(webviewImpl.state).toStrictEqual({});

  webviewImpl.state = { update: true };

  // expect state has been updated
  expect(webviewImpl.state).toStrictEqual({ update: true });
});

test('allow to read uuid (internal usecase)', async () => {
  expect(webviewImpl.uuid).toBeDefined();
});

test('allow to read extension info (internal usecase)', async () => {
  expect(webviewImpl.extensionInfo).toBeDefined();
  expect(webviewImpl.extensionInfo.id).toBe('extensionId');
  expect(webviewImpl.extensionInfo.extensionPath).toBe('/extensionPath');
});

test('check receive message on onDidReceiveMessage if we post messages', async () => {
  let receivedMessage: boolean = false;
  webviewImpl.onDidReceiveMessage(message => {
    expect(message).toBe('my-custom-message');
    receivedMessage = true;
  });

  // send message
  await webviewImpl.handleMessage('my-custom-message');

  // expect message has been received
  expect(receivedMessage).toBe(true);
});

test('check disposing twice is not sending error', async () => {
  // dispose
  webviewImpl.dispose();

  // dispose again (should work)
  webviewImpl.dispose();
});

test.each([
  ['https://www.podman-desktop.io', 'https://www.podman-desktop.io/'],
  ['http://www.podman-desktop.io', 'http://www.podman-desktop.io/'],
  ['file:///extensionPath/subfolder/foo', 'http://${UUID}.webview.localhost:1234/subfolder/foo'],
])('check asWebviewUri with %s return %s', (uriInput, expected) => {
  // grab uuid
  const uuid = webviewImpl.uuid;

  const result = webviewImpl.asWebviewUri(Uri.parse(uriInput));

  const expectedAfterReplace = expected.replace('${UUID}', uuid);

  expect(result.toString()).toBe(expectedAfterReplace);
});

test('check asWebviewUri throw error with unknown protocol', async () => {
  expect(() => webviewImpl.asWebviewUri(Uri.parse('unknown://foo'))).toThrowError(
    'The resource unknown://foo is not supported.',
  );
});
