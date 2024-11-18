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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { toast } from '@zerodevx/svelte-toast';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { TaskInfo } from '/@api/taskInfo';

import ToastCustomUi from './ToastCustomUi.svelte';

const started = new Date().getTime();
const onpop = vi.fn();
const IN_PROGRESS_TASK: TaskInfo = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  status: 'in-progress',
  started,
  action: 'Task action',
};

const SUCCESS_TASK: TaskInfo = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  started,
  action: 'Success action',
};

const failureTaskError = 'this is the error';
const FAILURE_TASK: TaskInfo = {
  id: '1',
  name: 'Failure Task 1',
  state: 'completed',
  status: 'failure',
  started,
  error: failureTaskError,
  action: 'failure action',
};

beforeAll(() => {
  Object.defineProperty(window, 'executeTask', {
    value: vi.fn(),
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Check with in-progress', async () => {
  // spy pop method on toast
  const toastPopSpy = vi.spyOn(toast, 'pop');
  const toastId = 1234;

  render(ToastCustomUi, {
    taskInfo: IN_PROGRESS_TASK,
    toastId,
    onpop,
  });
  // expect the in-progress is used
  const status = screen.getByRole('status', { name: 'in-progress' });
  expect(status).toBeInTheDocument();

  // expect name is there
  const name = screen.getAllByText(IN_PROGRESS_TASK.name);
  expect(name).lengthOf(2);

  // should have an action and can click on it
  const action = screen.getByRole('link', { name: 'Task action' });
  expect(action).toBeInTheDocument();
  await fireEvent.click(action);

  // expect we have been calling the method
  expect(window.executeTask).toHaveBeenCalledWith(IN_PROGRESS_TASK.id);

  // expect we can close the toast
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toBeInTheDocument();
  await fireEvent.click(close);
  expect(onpop).toHaveBeenCalled();

  expect(toastPopSpy).toHaveBeenCalledWith(toastId);
});

test('Check with success', async () => {
  // spy pop method on toast
  const toastPopSpy = vi.spyOn(toast, 'pop');
  const toastId = 1234;

  render(ToastCustomUi, {
    taskInfo: SUCCESS_TASK,
    toastId,
    onpop,
  });
  // expect the in-progress is used
  const status = screen.getByRole('status', { name: 'success' });
  expect(status).toBeInTheDocument();

  // expect name is there
  const name = screen.getAllByText(SUCCESS_TASK.name);
  expect(name).lengthOf(2);

  // should have an action and can click on it
  const action = screen.getByRole('link', { name: 'Success action' });
  expect(action).toBeInTheDocument();
  await fireEvent.click(action);

  // expect we have been calling the method
  expect(window.executeTask).toHaveBeenCalledWith(SUCCESS_TASK.id);

  // expect we can close the toast
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toBeInTheDocument();
  await fireEvent.click(close);
  expect(onpop).toHaveBeenCalled();

  expect(toastPopSpy).toHaveBeenCalledWith(toastId);
});

test('Check with failure', async () => {
  // spy pop method on toast
  const toastPopSpy = vi.spyOn(toast, 'pop');
  const toastId = 1234;

  render(ToastCustomUi, {
    taskInfo: FAILURE_TASK,
    toastId,
    onpop,
  });
  // expect the in-progress is used
  const status = screen.getByRole('status', { name: 'failure' });
  expect(status).toBeInTheDocument();

  // expect name is there
  const name = screen.getByText(FAILURE_TASK.name);
  expect(name).toBeInTheDocument();

  // expect error to be displayed
  const error = screen.getByText(failureTaskError);
  expect(error).toBeInTheDocument();

  // should have an action and can click on it
  const action = screen.getByRole('link', { name: 'failure action' });
  expect(action).toBeInTheDocument();
  await fireEvent.click(action);

  // expect we have been calling the method
  expect(window.executeTask).toHaveBeenCalledWith(FAILURE_TASK.id);

  // expect we can close the toast
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toBeInTheDocument();
  await fireEvent.click(close);
  expect(onpop).toHaveBeenCalled();

  expect(toastPopSpy).toHaveBeenCalledWith(toastId);
});
