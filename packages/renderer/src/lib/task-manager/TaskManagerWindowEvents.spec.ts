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

import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import TaskManagerWindowEvents from './TaskManagerWindowEvents.svelte';

const callbacks = new Map<string, () => void>();
const eventEmitter = {
  receive: (message: string, callback: () => void): void => {
    callbacks.set(message, callback);
  },
};

beforeAll(() => {
  Object.defineProperty(window, 'events', {
    value: {
      receive: eventEmitter.receive,
    },
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect to close the task manager if esc is clicked', async () => {
  const outsideWindow = {} as unknown as HTMLInputElement;
  const showTaskManager = true;
  const onUpdate = vi.fn();
  render(TaskManagerWindowEvents, { outsideWindow, showTaskManager, onUpdate });

  // now, press the ESC key
  await userEvent.keyboard('{Escape}');

  // check it's being called to close the task manager
  await vi.waitFor(() => expect(onUpdate).toBeCalledWith(false));
});

test('Expect no event/change if task manager is closed but we click on esc key', async () => {
  const outsideWindow = {} as unknown as HTMLInputElement;
  const showTaskManager = false;
  const onUpdate = vi.fn();
  render(TaskManagerWindowEvents, { outsideWindow, showTaskManager, onUpdate });

  // now, press the ESC key
  await userEvent.keyboard('{Escape}');

  // check we never receive any notification
  await vi.waitFor(() => expect(onUpdate).not.toBeCalled());
});

test('Expect clicking outside of the window will close the panel', async () => {
  const outsideWindow = {
    getBoundingClientRect: vi.fn(),
  } as unknown as HTMLInputElement;

  vi.mocked(outsideWindow.getBoundingClientRect).mockReturnValue({
    top: 100,
    bottom: 100,
    left: 100,
    right: 100,
    width: 100,
    height: 100,
    x: 100,
    y: 100,
    toJSON: vi.fn(),
  });
  const showTaskManager = true;
  const onUpdate = vi.fn();
  const val = render(TaskManagerWindowEvents, { outsideWindow, showTaskManager, onUpdate });

  // now, click on the document
  await userEvent.click(val.baseElement);

  // check it's being called to close the task manager
  await vi.waitFor(() => expect(onUpdate).toBeCalledWith(false));
});

test('Expect clicking inside the window is doing nothing (not closing)', async () => {
  const outsideWindow = {
    getBoundingClientRect: vi.fn(),
  } as unknown as HTMLInputElement;

  vi.mocked(outsideWindow.getBoundingClientRect).mockReturnValue({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 100,
    y: 100,
    toJSON: vi.fn(),
  });
  const showTaskManager = true;
  const onUpdate = vi.fn();
  const val = render(TaskManagerWindowEvents, { outsideWindow, showTaskManager, onUpdate });

  // now, click on the document
  await userEvent.click(val.baseElement);

  // check it's not being called
  await vi.waitFor(() => expect(onUpdate).not.toBeCalled());
});

test('Expect close if receiving an event', async () => {
  const outsideWindow = {
    getBoundingClientRect: vi.fn(),
  } as unknown as HTMLInputElement;

  const showTaskManager = true;
  const onUpdate = vi.fn();
  render(TaskManagerWindowEvents, { outsideWindow, showTaskManager, onUpdate });

  // send a new event
  // get the callback 'toggle-task-manager'
  const callback = callbacks.get('toggle-task-manager');
  expect(callback).toBeDefined();
  // call it
  callback?.();

  // check it's being called to close the task manager
  await vi.waitFor(() => expect(onUpdate).toBeCalledWith(false));

  // call it again
  callback?.();

  // check it's being called to display the task manager
  await vi.waitFor(() => expect(onUpdate).toBeCalledWith(true));
});

test('Expect do not close if clicking on the status bar entry', async () => {
  const outsideWindow = {
    getBoundingClientRect: vi.fn(),
  } as unknown as HTMLInputElement;

  // create a status bar entry
  const statusBarEntry = document.createElement('div');
  statusBarEntry.ariaLabel = 'Status Bar';
  document.body.appendChild(statusBarEntry);

  // create the button
  const taskButton = document.createElement('button');
  taskButton.title = 'Tasks';
  statusBarEntry.appendChild(taskButton);

  const showTaskManager = true;
  const onUpdate = vi.fn();
  render(TaskManagerWindowEvents, { outsideWindow, showTaskManager, onUpdate });

  // now, click on the task button
  await userEvent.click(taskButton);

  // check we have not received any notification to close the task manager
  await vi.waitFor(() => expect(onUpdate).not.toBeCalled());
});
