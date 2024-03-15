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
import { expect, test, vi } from 'vitest';

import type { ApiSenderType } from '../api.js';
import { CustomPickImpl } from './custompick-impl.js';
import { CustomPickRegistry } from './custompick-registry.js';

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const customPickRegistry = new CustomPickRegistry(apiSender);

test('Check apiSender is called when showing the custom pick', async () => {
  const customPick = new CustomPickImpl(1, customPickRegistry, apiSender);
  customPick.title = 'title';
  customPick.description = 'desc';
  customPick.items = [];
  customPick.show();
  expect(apiSender.send).toBeCalledWith('showCustomPick:add', {
    canSelectMany: false,
    description: 'desc',
    hideItemSections: false,
    icon: undefined,
    id: 1,
    items: [],
    title: 'title',
  });
});

test('Check hide removes entry from registry when called', async () => {
  customPickRegistry.removeEntry = vi.fn();
  const customPick = new CustomPickImpl(1, customPickRegistry, apiSender);
  customPick.hide();
  expect(customPickRegistry.removeEntry).toBeCalledWith(1);
});
