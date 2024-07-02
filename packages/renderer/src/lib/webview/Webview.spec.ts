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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { webviews } from '/@/stores/webviews';
import type { WebviewInfo } from '/@api/webview-info';

import Webview from './Webview.svelte';

const makeDefaultWebviewVisibleMock = vi.fn();
const getWebviewPreloadPathMock = vi.fn();
const getWebviewRegistryHttpPortMock = vi.fn();
const messages = new Map<string, (args: any) => void>();

// webviews for the store
const webviewTestList: WebviewInfo[] = [
  {
    id: 'webviewId1',
    uuid: 'uuid1',
    viewType: 'podman-desktop',
    sourcePath: '/path/to/source',
    icon: 'icon1',
    name: 'Podman Desktop1',
    html: '<html>newCode1</html>',
    state: { stateData1: 'stateData1' },
  },
  {
    id: 'webviewId2',
    uuid: 'uuid2',
    viewType: 'podman-desktop',
    sourcePath: '/path/to/source',
    icon: 'icon2',
    name: 'Podman Desktop2',
    html: '<html>newCode2</html>',
    state: { stateData1: 'stateData2' },
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).makeDefaultWebviewVisible = makeDefaultWebviewVisibleMock;
  (window as any).getWebviewPreloadPath = getWebviewPreloadPathMock;
  (window as any).getWebviewRegistryHttpPort = getWebviewRegistryHttpPortMock;

  (window.events as unknown) = {
    receive: vi.fn().mockImplementation((channel, func) => {
      messages.set(channel, func);
      return {
        dispose: vi.fn(),
      };
    }),
  };

  // provide preload path
  getWebviewPreloadPathMock.mockResolvedValue('/path/to/preload');

  // provide registry port
  getWebviewRegistryHttpPortMock.mockResolvedValue(5678);

  webviews.set(webviewTestList);
});

async function waitRender(customProperties: object): Promise<void> {
  render(Webview, { ...customProperties });
  await tick();
  await tick();
  await tick();
}

test('check we have webview being displayed', async () => {
  // render the first webview
  await waitRender({ id: webviewTestList[0].id });

  // get webview element
  const webview = screen.getByRole('document', { name: 'Webview Podman Desktop1' });
  expect(webview).toBeInTheDocument();

  // check webview attributes
  expect(webview).toHaveAttribute('httpreferrer', 'http://uuid1.webview.localhost:5678');
  expect(webview).toHaveAttribute('preload', '/path/to/preload');
  expect(webview).toHaveAttribute('src', 'http://uuid1.webview.localhost:5678?webviewId=webviewId1');
});

test('check post message', async () => {
  // render the first webview
  await waitRender({ id: webviewTestList[0].id });

  // get webview element
  const webview = screen.getByRole('document', { name: 'Webview Podman Desktop1' });
  expect(webview).toBeInTheDocument();

  // add a send method to the webview to check if it is called
  const sendToWebviewMock = vi.fn();
  (webview as any).send = sendToWebviewMock;

  // send a post message event
  messages.get('webview-post-message')?.({ id: webviewTestList[0].id, message: 'my-custom-message' });

  // wait
  await new Promise(resolve => setTimeout(resolve, 100));

  //  check if send method has been called
  expect(sendToWebviewMock).toHaveBeenCalledWith('webview-post-message', { message: 'my-custom-message' });
});

test('check update html', async () => {
  // render the first webview
  await waitRender({ id: webviewTestList[0].id });

  // get webview element
  const webview = screen.getByRole('document', { name: 'Webview Podman Desktop1' });
  expect(webview).toBeInTheDocument();

  // add a send method to the webview to check if it is called
  const sendToWebviewMock = vi.fn();
  (webview as any).send = sendToWebviewMock;

  // now check for html update
  messages.get('webview-update:html')?.({ id: webviewTestList[0].id, html: '<html>newCode1</html>' });
  // wait
  await new Promise(resolve => setTimeout(resolve, 100));

  //  check if send method has been called
  expect(sendToWebviewMock).toHaveBeenCalledWith('webview-update-html', '<html>newCode1</html>');
});

test('check open devtools', async () => {
  // render the first webview
  await waitRender({ id: webviewTestList[0].id });

  // get webview element
  const webview = screen.getByRole('document', { name: 'Webview Podman Desktop1' });
  expect(webview).toBeInTheDocument();

  //create a mock for openDevtools
  const openDevtoolsMock = vi.fn();
  (webview as any).openDevTools = openDevtoolsMock;

  // now check for open devtools
  messages.get('dev-tools:open-webview')?.(webviewTestList[0].id);
  // wait
  await new Promise(resolve => setTimeout(resolve, 100));

  //  check if send method has been called
  expect(openDevtoolsMock).toHaveBeenCalled();
});
