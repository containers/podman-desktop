/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';

const executeCommand = vi.fn();

beforeAll(() => {
  (window as any).executeCommand = executeCommand;
  executeCommand.mockImplementation(() => {});

  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect no ListItemButtonIcon', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [],
    onError: () => {},
  });
  const imgs = screen.queryAllByRole('img');
  expect(imgs).lengthOf(0);
});

test('Expect one ListItemButtonIcon', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');
  expect(item).toBeInTheDocument();
});

test('Expect one ListItemButtonIcon without detail', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: false,
  });
  const item = screen.getByLabelText('dummy-title');
  expect(item).toBeInTheDocument();
});

test('Expect one ListItemButtonIcon with detail', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: false,
    detailed: true,
  });
  const item = screen.getByLabelText('dummy-title');
  expect(item).toBeInTheDocument();
  expect(item).not.toHaveClass('m-0.5');
});

test('Expect executeCommand to be called', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');

  await fireEvent.click(item);
  expect(executeCommand).toBeCalledWith('dummy.command');
});

test('Expect executeCommand to be called with sanitize object', async () => {
  render(ContributionActions, {
    args: [
      {
        nonSerializable: () => {},
        serializable: 'hello',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');

  await fireEvent.click(item);
  expect(executeCommand).toBeCalledWith('dummy.command', { serializable: 'hello' });
});

test('Expect executeCommand to be called with sanitize object nested', async () => {
  render(ContributionActions, {
    args: [
      {
        parent: {
          nonSerializable: () => {},
          serializable: 'hello',
        },
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');

  await fireEvent.click(item);
  expect(executeCommand).toBeCalledWith('dummy.command', { parent: { serializable: 'hello' } });
});

test('Expect when property to be true', async () => {
  render(ContributionActions, {
    args: [
      {
        property: 'hello',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        when: 'property === hello',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');
  expect(item).toBeInTheDocument();
});

test('Expect when property to be false', async () => {
  render(ContributionActions, {
    args: [
      {
        property: 'hello',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        when: 'property === world',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.queryByText('dummy-title');
  expect(item).toBeNull();
});

test('Expect when property to be true multiple args', async () => {
  render(ContributionActions, {
    args: [
      {
        property: 'hello',
      },
      {
        property: 'world',
      },
    ],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        when: 'property === world',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });
  const item = screen.getByText('dummy-title');
  expect(item).toBeInTheDocument();
});

test('Expect default icon if no custom icon', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });

  const iconItem = screen.getByRole('img', { name: '', hidden: true });
  expect(iconItem).toBeInTheDocument();
  // expect to have the svelte-fa class
  expect(iconItem).toHaveClass('svelte-fa');
});

test('Expect custom icon on the contributed action', async () => {
  render(ContributionActions, {
    args: [],
    contributions: [
      {
        command: 'dummy.command',
        title: 'dummy-title',
        icon: '${dummyIcon}',
      },
    ],
    onError: () => {},
    dropdownMenu: true,
  });

  const iconItem = screen.getByRole('img', { name: 'dummy-title' });
  expect(iconItem).toBeInTheDocument();
  // expect to have the podman desktop icon class
  expect(iconItem).toHaveClass('podman-desktop-icon-dummyIcon');
});
