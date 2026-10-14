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

import type { TaskInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { toast } from '@zerodevx/svelte-toast';
import { beforeEach, expect, test, vi } from 'vitest';

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
  cancellable: false,
};

const SUCCESS_TASK: TaskInfo = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  started,
  action: 'Success action',
  cancellable: false,
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
  cancellable: false,
};

const CANCELED_TASK: TaskInfo = {
  id: '1',
  name: 'Canceled Task 1',
  state: 'completed',
  status: 'canceled',
  started,
  action: 'canceled action',
  cancellable: true,
};

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
  const spinner = screen.getByRole('status', { name: 'Loading' });
  expect(spinner).toBeInTheDocument();

  // expect name is there
  const name = screen.getByText(IN_PROGRESS_TASK.name);
  expect(name).toBeInTheDocument();

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
  // expect the success status is used
  const status = screen.getByRole('status', { name: 'success' });
  expect(status).toBeInTheDocument();
  expect(status.children[0]).toHaveClass('text-[var(--pd-state-success)]');

  // expect name is there
  const name = screen.getByText(SUCCESS_TASK.name);
  expect(name).toBeInTheDocument();

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
  // expect the failure status is used
  const status = screen.getByRole('status', { name: 'failure' });
  expect(status).toBeInTheDocument();
  expect(status.children[0]).toHaveClass('text-[var(--pd-state-error)]');

  // expect name is there
  const name = screen.getByText(`Error ${FAILURE_TASK.name}`);
  expect(name).toBeInTheDocument();

  // expect error to be displayed
  const error = screen.getByText(failureTaskError);
  expect(error).toBeInTheDocument();

  // expect we can close the toast
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toBeInTheDocument();
  await fireEvent.click(close);
  expect(onpop).toHaveBeenCalled();

  expect(toastPopSpy).toHaveBeenCalledWith(toastId);
});

test('Check with cancel', async () => {
  // spy pop method on toast
  const toastPopSpy = vi.spyOn(toast, 'pop');
  const toastId = 1234;

  render(ToastCustomUi, {
    taskInfo: CANCELED_TASK,
    toastId,
    onpop,
  });
  // expect the failure status is used
  const status = screen.getByRole('status', { name: 'canceled' });
  expect(status).toBeInTheDocument();
  expect(status.children[0]).toHaveClass('text-[var(--pd-state-warning)]');

  // expect name is there
  const name = screen.getByText(`Canceled ${CANCELED_TASK.name}`);
  expect(name).toBeInTheDocument();

  // expect we can close the toast
  const close = screen.getByRole('button', { name: 'Close' });
  expect(close).toBeInTheDocument();
  await fireEvent.click(close);
  expect(onpop).toHaveBeenCalled();

  expect(toastPopSpy).toHaveBeenCalledWith(toastId);
});
