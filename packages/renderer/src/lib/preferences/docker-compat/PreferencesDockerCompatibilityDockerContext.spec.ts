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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeEach, expect, type Mock, test, vi } from 'vitest';

import type { DockerContextInfo } from '/@api/docker-compatibility-info';

import PreferencesDockerCompatibilityDockerContext from '././PreferencesDockerCompatibilityDockerContext.svelte';

const UNIX_OR_MAC_HOST = 'unix:///var/run/docker.sock';

const contextInfos = [
  {
    name: 'default',
    isCurrentContext: false,
    metadata: { description: 'default context' },
    endpoints: {
      docker: {
        host: UNIX_OR_MAC_HOST,
      },
    },
  },
  {
    name: 'podman',
    isCurrentContext: true,
    metadata: { description: 'podman context' },
    endpoints: {
      docker: {
        host: UNIX_OR_MAC_HOST,
      },
    },
  },
];

const getDockerContextsMock: Mock<() => Promise<DockerContextInfo[]>> = vi.fn();
const switchDockerContextMock: Mock<(contextName: string) => Promise<void>> = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  Object.defineProperty(global, 'window', {
    value: {
      navigator: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
      getDockerContexts: getDockerContextsMock,
      switchDockerContext: switchDockerContextMock,
    },
    writable: true,
  });
});

test('only default context', async () => {
  getDockerContextsMock.mockResolvedValue([
    {
      name: 'default',
      isCurrentContext: true,
      metadata: { description: 'default context' },
      endpoints: {
        docker: {
          host: UNIX_OR_MAC_HOST,
        },
      },
    },
  ]);

  render(PreferencesDockerCompatibilityDockerContext);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getDockerContextsMock).toBeCalled());
  await tick();

  expect(screen.getByText(`default (${UNIX_OR_MAC_HOST})`)).toBeInTheDocument();
});

test('multiple contexts', async () => {
  getDockerContextsMock.mockResolvedValue(contextInfos);

  render(PreferencesDockerCompatibilityDockerContext);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getDockerContextsMock).toBeCalled());
  await tick();

  // default should be there
  expect(screen.getByText(`default (${UNIX_OR_MAC_HOST})`)).toBeInTheDocument();

  // podman should be there
  expect(screen.getByText(`podman (${UNIX_OR_MAC_HOST})`)).toBeInTheDocument();

  // get selected context from select component with id dockerContextChoice
  const select = screen.getByRole('combobox', { name: 'Docker Context selection' });
  expect(select).toBeInTheDocument();
});

test('change context', async () => {
  getDockerContextsMock.mockResolvedValue(contextInfos);
  switchDockerContextMock.mockResolvedValue();
  render(PreferencesDockerCompatibilityDockerContext);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getDockerContextsMock).toBeCalled());
  await tick();

  // select another item in the combo box
  const select = screen.getByRole('combobox', { name: 'Docker Context selection' });
  expect(select).toBeInTheDocument();

  // find default option
  const defaultOption = screen.getByRole('option', { name: `default (${UNIX_OR_MAC_HOST})` });
  expect(defaultOption).toBeInTheDocument();

  // click on the select
  await userEvent.selectOptions(select, defaultOption);

  // expect we got a call to switchDockerContext
  expect(switchDockerContextMock).toBeCalledWith('default');
});
