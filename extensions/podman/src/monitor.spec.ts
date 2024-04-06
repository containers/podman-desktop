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
import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, expect, it, type Mock, vi } from 'vitest';

import { Monitor } from './monitor';

const logErrorTelemetry = vi.fn();

// mock the API
vi.mock('@podman-desktop/api', async () => ({
  env: {
    createTelemetryLogger: vi.fn(() => ({
      logError: logErrorTelemetry,
    })),
  },
}));

let fakeFn: Mock;
let stopPredicate: Mock;
let monitor: Monitor;
const fakeName = 'testMonitor';

beforeEach(() => {
  vi.useFakeTimers();
  fakeFn = vi.fn();
  stopPredicate = vi.fn().mockReturnValue(false); // Initially don't stop the loop
  monitor = new Monitor(fakeFn, {
    name: fakeName,
    stopMonitorPredicate: stopPredicate,
    intervalMs: 1000,
  });
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it('Expect monitor to call the function at the specified interval', async () => {
  monitor.start();

  // Initially, fakeFn should not have been called.
  expect(fakeFn).not.toHaveBeenCalled();

  // After 1000ms, fakeFn should be called once.
  vi.advanceTimersByTime(1000);
  expect(fakeFn).toHaveBeenCalledTimes(1);

  // Ensure the function is not called again if the stop predicate is true.
  stopPredicate.mockReturnValue(true);
  vi.advanceTimersByTime(1000);
  expect(fakeFn).toHaveBeenCalledTimes(1);
});

it('Expect monitor to stop monitoring when stopLoopPredicate returns true', async () => {
  stopPredicate.mockReturnValue(true);
  monitor.start();

  vi.advanceTimersByTime(1000);
  expect(fakeFn).not.toHaveBeenCalled();
});

it('Expect monitor to log an error when fn throws', async () => {
  const error = new Error('Test error');
  fakeFn.mockRejectedValueOnce(error);
  monitor.start();

  vi.advanceTimersByTime(1000);
  await new Promise(process.nextTick);

  expect(extensionApi.env.createTelemetryLogger().logError).toHaveBeenCalledWith(error);
});

it('Expect monitor to log the correct error message for non-Error instances', async () => {
  const errorMessage = 'String error';
  fakeFn.mockRejectedValueOnce(errorMessage);
  monitor.start();

  vi.advanceTimersByTime(1000);
  await new Promise(process.nextTick);

  expect(extensionApi.env.createTelemetryLogger().logError).toHaveBeenCalledWith(errorMessage);
});
