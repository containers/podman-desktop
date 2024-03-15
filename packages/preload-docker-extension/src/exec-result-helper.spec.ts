/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { lines, parseJsonLines, parseJsonObject } from './exec-result-helper';

beforeEach(() => {
  vi.clearAllMocks();
});

test('expect lines with simple text', async () => {
  const text = {
    stdout: 'hello',
  };
  const result = lines(text);
  expect(result).toStrictEqual(['hello']);
});

test('expect lines with no stdout', async () => {
  const text = {
    stdout: '',
  };
  const result = lines(text);
  expect(result).toStrictEqual([]);
});

test('expect parseJsonObject with simple text', async () => {
  const text = {
    stdout: '{"hello": "world"}',
  };
  const result = parseJsonObject(text);
  expect(result).toStrictEqual({ hello: 'world' });
});

test('expect multiline JSON with complex object using cli format', async () => {
  // example: docker system df --format '"{{json .}}"'

  const text = `"{"Active":"21","Reclaimable":"12.76GB (86%)","Size":"14.79GB","TotalCount":"73","Type":"Images"}"
"{"Active":"0","Reclaimable":"2.182GB (100%)","Size":"2.182GB","TotalCount":"25","Type":"Containers"}"
"{"Active":"5","Reclaimable":"0B (0%)","Size":"205.5MB","TotalCount":"9","Type":"Local Volumes"}"
"{"Active":"0","Reclaimable":"93.34MB","Size":"93.34MB","TotalCount":"261","Type":"Build Cache"}"`;

  const result = parseJsonLines({ stdout: text });
  expect(result.length).toBe(4);
  expect(result[0].Type).toBe('Images');
});

test('expect parseJsonObject with complex object using cli format', async () => {
  // example: subset of docker info --format '"{{json .}}"'
  const text = '"{"Containers":25,"ContainersRunning":1,"ContainersPaused":0,"ContainersStopped":24,"Images":73}"';

  const result = parseJsonObject({ stdout: text });
  expect(result.Containers).toBe(25);
  expect(result.ContainersRunning).toBe(1);
  expect(result.ContainersPaused).toBe(0);
});
