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
import { beforeAll, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '../api.js';
import { InputQuickPickRegistry } from './input-quickpick-registry.js';

let inputQuickPickRegistry: InputQuickPickRegistry;

beforeAll(() => {
  inputQuickPickRegistry = new InputQuickPickRegistry({
    send: vi.fn(),
    receive: vi.fn(),
  } as ApiSenderType);
});

test('Expect no quick pick selection to resolve the promise as undefined', async () => {
  const result = inputQuickPickRegistry.showQuickPick(['a', 'b']);
  inputQuickPickRegistry.onQuickPickValuesSelected(1);
  expect(await result).toBe(undefined);
});
