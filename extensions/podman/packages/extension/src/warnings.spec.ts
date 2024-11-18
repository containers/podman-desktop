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

import { delay, http, HttpResponse } from 'msw';
import type { SetupServerApi } from 'msw/node';
import { setupServer } from 'msw/node';
import { afterEach, expect, test } from 'vitest';

import { isDisguisedPodmanPath } from './warnings';

let server: SetupServerApi | undefined = undefined;

afterEach(() => {
  server?.close();
});

test('isDisguisedPodman', async () => {
  const handlers = [http.get('http://localhost/libpod/_ping', () => HttpResponse.text('OK'))];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const response = await isDisguisedPodmanPath('http://localhost/socket');

  expect(response).toBe(true);
});

test('isDisguisedPodman with timeout', async () => {
  const handlers = [
    http.get('http://localhost/libpod/_ping', async () => {
      // we do a reply OK after 3s but we will check with a delay of 1s the request so it should still fail
      await delay(3_000);

      return HttpResponse.text('OK');
    }),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const response = await isDisguisedPodmanPath('http://localhost:10000/socket', 1000);

  expect(response).toBe(false);
});
