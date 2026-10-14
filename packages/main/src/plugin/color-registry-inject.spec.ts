/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { Container } from 'inversify';
import { beforeEach, expect, test, vi } from 'vitest';

import { InjectableColorRegistry } from './color-registry-inject.js';
import { ConfigurationRegistry } from './configuration-registry.js';

let colorRegistry: InjectableColorRegistry;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const configRegistry: ConfigurationRegistry = {
  onDidChangeConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  const container = new Container();

  container.bind(ApiSenderType).toConstantValue(apiSender);
  container.bind(ConfigurationRegistry).toConstantValue(configRegistry);
  container.bind(InjectableColorRegistry).toSelf().inSingletonScope();

  colorRegistry = container.get<InjectableColorRegistry>(InjectableColorRegistry);
});

test('check injection', async () => {
  colorRegistry.init();
  const colors = colorRegistry.listColors('dark');
  expect(colors[0]).toMatchObject({
    cssVar: '--pd-default-text',
    id: 'default-text',
    value: '#fff',
  });
});
