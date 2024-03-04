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

import { WebviewPreload } from './webview-preload';

/**
 * @module preload
 */
export const init = (): void => {
  // parse the query string and grab the webviewId parameter
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const webviewId = urlParams.get('webviewId') ?? undefined;

  if (!webviewId) {
    throw new Error('The webviewId is not defined');
  }
  // create the webviewPreload object and call the init method
  const webviewPreload = new WebviewPreload(webviewId);
  webviewPreload.init().catch((error: unknown) => console.error('Error while initializing the exposure', error));
};

// do not call init methd in case of testing
if (!process.env.VITEST) {
  init();
}
