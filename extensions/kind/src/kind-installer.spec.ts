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

import { beforeEach, expect, test, vi } from 'vitest';
import { KindInstaller } from './kind-installer';
import * as extensionApi from '@tmpwip/extension-api';

let installer: KindInstaller;

vi.mock('@tmpwip/extension-api', async () => {
  return {
    window: {
      showInformationMessage: vi.fn().mockReturnValue(Promise.resolve('Yes')),
      withProgress: vi.fn(),
      showNotification: vi.fn(),
    },
    ProgressLocation: {
      APP_ICON: 1,
    },
  };
});

vi.mock('@octokit/rest', () => {
  const repos = {
    getReleaseAsset: vi.fn().mockReturnValue({ name: 'kind', data: [] }),
  };
  return {
    Octokit: vi.fn().mockReturnValue({ repos: repos }),
  };
});

beforeEach(() => {
  installer = new KindInstaller('.');
  vi.clearAllMocks();
});

test('expect showNotification to be called', async () => {
  const progress = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    report: () => {},
  };
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });
  vi.spyOn(installer, 'getAssetInfo').mockReturnValue(Promise.resolve({ id: 0, name: 'kind' }));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const spy = vi.spyOn(extensionApi.window, 'showNotification').mockImplementation(() => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      dispose: () => {},
    };
  });
  const result = await installer.performInstall();
  expect(result).toBeDefined();
  expect(result).toBeTruthy();
  expect(spy).toBeCalled();
});
