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

import '@testing-library/jest-dom/vitest';
import { test, expect, vi } from 'vitest';
import { capitalize, deleteSelection } from './Util';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from '../container/ContainerInfoUI';
import type { VolumeInfoUI } from '../volume/VolumeInfoUI';

test('test capitalize function', () => {
  expect(capitalize('test')).toBe('Test');
  expect(capitalize('Test')).toBe('Test');
  expect(capitalize('TEST')).toBe('TEST');
});

test('test if delete function is called for selected objects with state property', () => {
  const deleteCallback = vi.fn();
  const deleteWithStateInput: ContainerInfoUI[] = [];
  for (let i = 0; i < 4; i++) {
    const containerInfo: ContainerInfoUI = {
      id: 'foobar ' + i,
      shortId: 'foobar' + i,
      name: 'foobar' + i,
      image: 'foobar',
      shortImage: 'foobar',
      engineId: 'foobar',
      engineName: 'foobar',
      engineType: ContainerGroupInfoTypeUI.PODMAN,
      state: 'running',
      uptime: 'foobar',
      startedAt: 'foobar',
      ports: [],
      portsAsString: 'foobar',
      displayPort: 'foobar',
      command: 'foobar',
      hasPublicPort: false,
      groupInfo: {
        name: 'foobar',
        type: ContainerGroupInfoTypeUI.COMPOSE,
      },
      selected: i % 2 === 0,
      created: 0,
      labels: {},
    };
    deleteWithStateInput.push(containerInfo);
  }
  deleteSelection(deleteWithStateInput, deleteCallback);
  expect(deleteCallback).toBeCalledTimes(2);
});

test('test if delete function is called for selected objects with status property', () => {
  const deleteCallback = vi.fn();
  const deleteWithStateInput: VolumeInfoUI[] = [];
  for (let i = 0; i < 4; i++) {
    const volume: VolumeInfoUI = {
      name: 'dummy' + i,
      status: 'UNUSED',
      shortName: '',
      mountPoint: '',
      scope: '',
      driver: '',
      created: '',
      age: '',
      size: 0,
      humanSize: '',
      engineId: '',
      engineName: '',
      selected: i % 2 === 0,
      containersUsage: [],
    };
    deleteWithStateInput.push(volume);
  }
  deleteSelection(deleteWithStateInput, deleteCallback);
  expect(deleteCallback).toBeCalledTimes(2);
});
