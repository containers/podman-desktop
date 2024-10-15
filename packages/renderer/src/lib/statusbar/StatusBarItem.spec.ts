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

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';
import { iconClass } from './StatusBarItem';
import StatusBarItem from './StatusBarItem.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'executeStatusBarEntryCommand', {
    value: vi.fn(),
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('check iconClass with font awesome icons', () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: 'fas fa-podman',
  };

  const icon = iconClass(statusBarEntry);
  expect(icon).toBe('fas fa-podman');
});

test('check iconClass with custom icon name', () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: '${podman}',
  };

  const icon = iconClass(statusBarEntry);
  expect(icon).toBe('podman-desktop-icon-podman');
});

test('check iconClass with font awesome icons and spinning', () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: 'fas fa-sync~spin',
  };

  const icon = iconClass(statusBarEntry);
  expect(icon).toBe('fas fa-sync animate-spin');
});

test('expect dot not rendered', async () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: '${podman}',
    highlight: false,
  };

  render(StatusBarItem, { entry: statusBarEntry });

  const dot = screen.queryByRole('status');
  expect(dot).toBeNull();
});

test('expect dot rendered', () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: '${podman}',
    highlight: true,
  };

  render(StatusBarItem, { entry: statusBarEntry });

  const dot = screen.getByRole('status');
  expect(dot).toBeDefined();
});

test('expect click on the item with command/args', async () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: '${podman}',
    command: 'my.command',
    commandArgs: ['arg1', 'arg2'],
  };

  render(StatusBarItem, { entry: statusBarEntry });

  /// get the item and click on it
  const item = screen.getByRole('button');
  await userEvent.click(item);

  // check we've called executeStatusBarEntryCommand
  expect(window.executeStatusBarEntryCommand).toHaveBeenCalledWith('my.command', ['arg1', 'arg2']);
});

test('expect click on the item with command but proxy args', async () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: '${podman}',
    command: 'my.command',
  };

  // here we don't have real args, but we are faking a proxy object
  const obj1 = {
    toJSON(): string {
      return 'arg1';
    },
  };
  const obj2 = {
    toJSON(): string {
      return 'arg2';
    },
  };
  const targetArray = [obj1, obj2];

  statusBarEntry.commandArgs = targetArray;

  render(StatusBarItem, { entry: statusBarEntry });

  /// get the item and click on it
  const item = screen.getByRole('button');
  await userEvent.click(item);

  // check we've called executeStatusBarEntryCommand but not with uncloneable objects, but with their values
  expect(window.executeStatusBarEntryCommand).toHaveBeenCalledWith('my.command', ['arg1', 'arg2']);
});
