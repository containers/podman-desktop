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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { podsInfos } from '/@/stores/pods';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import KubernetesTerminalBrowser from './KubernetesTerminalBrowser.svelte';
import { terminalService } from './KubernetesTerminalService';
import type { PodInfoUI } from './PodInfoUI';

vi.mock('@xterm/xterm', () => {
  return {
    Terminal: vi
      .fn()
      .mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), dispose: vi.fn(), onData: vi.fn() }),
  };
});

vi.mock('@xterm/addon-serialize');

// dummy event emitter
const eventEmitter = {
  receive: () => {},
};

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      events: {
        receive: eventEmitter.receive,
      },
      navigator: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
      getConfigurationValue: vi.fn(),
      kubernetesExec: vi.fn(),
      kubernetesExecResize: vi.fn(),
      getComputedStyle: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    },
  });
  vi.mocked(window.getComputedStyle).mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
  } as unknown as CSSStyleDeclaration);
});

const podName = 'My Pod';

// create a pod with 2 containers
const podInfoUi: PodInfoUI = {
  name: podName,
  selected: true,
  containers: [
    {
      Id: '1234',
      Names: 'container1',
      Status: 'running',
    },
    {
      Id: '5678',
      Names: 'container2',
      Status: 'running',
    },
  ],
} as unknown as PodInfoUI;

const pods: PodInfo[] = [
  {
    Id: 'my-pod',
    Name: podName,
    Containers: [
      {
        Status: 'running',
        Names: 'container1',
      },
      {
        Status: 'running',
        Names: 'container2',
      },
    ],
  } as unknown as PodInfo,
];

beforeEach(() => {
  vi.clearAllMocks();
  podsInfos.set(pods);
});

test('Expect switch of terminal clicking on the item', async () => {
  render(KubernetesTerminalBrowser, { pod: podInfoUi });

  // get the dropdown button
  const dropdown = screen.getByRole('button', { name: 'Connected to:' });
  expect(dropdown).toBeInTheDocument();

  // assert we see only container1 which is the default being selected
  expect(screen.getByText('container1')).toBeInTheDocument();
  expect(screen.queryByText('container2')).not.toBeInTheDocument();

  // click on the dropdown
  await userEvent.click(dropdown);

  // select the button with container2
  const container2 = screen.getByText('container2');
  expect(container2).toBeInTheDocument();
  await userEvent.click(container2);

  // now expect that the we did the switch to container 2
  // and container1 is no longer present
  expect(screen.getByText('container2')).toBeInTheDocument();
  expect(screen.queryByText('container1')).not.toBeInTheDocument();
});

test('Expect switch of terminal using keyboard switch with arrow keys', async () => {
  // spyon terminal Service
  const spyOnTerminalServiceSpy = vi.spyOn(terminalService, 'ensureTerminalExists');
  podsInfos.set(pods);

  render(KubernetesTerminalBrowser, { pod: podInfoUi });

  // get the dropdown button
  const dropdown = screen.getByRole('button', { name: 'Connected to:' });
  expect(dropdown).toBeInTheDocument();

  // assert we see only container1 which is the default being selected
  expect(screen.getByText('container1')).toBeInTheDocument();
  expect(screen.queryByText('container2')).not.toBeInTheDocument();

  // click on the dropdown
  await userEvent.click(dropdown);

  // clear the mock of the spy
  spyOnTerminalServiceSpy.mockClear();
  // send the arrow down key
  await userEvent.keyboard('{arrowdown}');
  // send the enter key
  await userEvent.keyboard('{enter}');

  // check that the terminal service was called with the right arguments
  await vi.waitFor(() => expect(spyOnTerminalServiceSpy).toHaveBeenCalledWith('My Pod', 'container2'));

  // should have container2
  const container2 = screen.getByText('container2');
  expect(container2).toBeInTheDocument();
});
