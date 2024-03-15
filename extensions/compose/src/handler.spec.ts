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

import type { Configuration } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { expect, test, vi } from 'vitest';

import type * as detect from './detect';
import * as handler from './handler';

const config: Configuration = {
  get: () => {
    return true;
  },
  has: () => true,
  update: () => Promise.resolve(),
};

vi.mock('@podman-desktop/api', async () => {
  return {
    configuration: {
      getConfiguration: (): Configuration => config,
    },
    window: {
      showInformationMessage: vi.fn(),
    },
    context: {
      setValue: vi.fn(),
    },
  };
});

const extensionContextMock: extensionApi.ExtensionContext = {
  storagePath: '/storage-path',
} as unknown as extensionApi.ExtensionContext;

test('updateConfigAndContextComposeBinary: make sure configuration gets updated if checkSystemWideDockerCompose had returned true', async () => {
  vi.mock('./detect', () => {
    // Create mock Detect
    const detectMock: detect.Detect = {
      checkSystemWideDockerCompose: vi.fn().mockReturnValue(Promise.resolve(true)),
      checkForDockerCompose: vi.fn().mockReturnValue(Promise.resolve(true)),
      getStoragePath: vi.fn().mockReturnValue(Promise.resolve('mockPath')),
    } as unknown as detect.Detect;

    // Make sure we return it with the above mocked values
    return {
      Detect: vi.fn().mockReturnValue(detectMock),
    };
  });

  // Spy on setValue and configuration updates
  const contextUpdateSpy = vi.spyOn(extensionApi.context, 'setValue');
  const configUpdateSpy = vi.spyOn(extensionApi.configuration.getConfiguration('compose'), 'update');

  // Run updateConfigAndContextComposeBinarys
  await handler.updateConfigAndContextComposeBinary(extensionContextMock);

  expect(configUpdateSpy).toHaveBeenCalledWith('binary.installComposeSystemWide', true);
  expect(contextUpdateSpy).toHaveBeenCalledWith('compose.isComposeInstalledSystemWide', true);
});
