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

import type { CliToolOptions } from '@podman-desktop/api';
import { expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import type { CliToolExtensionInfo } from './api/cli-tool-info.js';
import { CliToolImpl } from './cli-tool-impl.js';
import type { CliToolRegistry } from './cli-tool-registry.js';
import type { Exec } from './util/exec.js';

test('check updateVersion updates CliTool', () => {
  const options: CliToolOptions = {
    name: 'tool-name',
    displayName: 'tool-display-name',
    markdownDescription: 'markdown description',
    images: {},
    version: '1.0.1',
    path: 'path/to/tool-name',
  };
  const newCliTool = new CliToolImpl(
    vi.fn() as unknown as ApiSenderType,
    vi.fn() as unknown as Exec,
    vi.fn() as unknown as CliToolExtensionInfo,
    vi.fn() as unknown as CliToolRegistry,
    options,
  );
  expect(newCliTool.version).equals('1.0.1');

  newCliTool.updateVersion({
    version: '2.0.1',
  });
  expect(newCliTool.version).equals('2.0.1');
});
