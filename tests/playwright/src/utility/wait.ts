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

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { NavigationBar } from '../model/workbench/navigation';

export async function wait(
  waitFunction: () => Promise<boolean>,
  until: boolean,
  timeout: number,
  diff: number,
  sendError: boolean,
  errorMessage: string,
): Promise<void> {
  let time = timeout;
  while (time > 0) {
    const waitFuncResult = await waitFunction();
    if (waitFuncResult === until) {
      return;
    }
    time = time - diff;
    await delay(diff);
  }
  const message =
    errorMessage || errorMessage.length === 0
      ? `Timeout (${timeout} ms) was reach while waiting for condition (${waitFunction.name}) to become '${String(
          until,
        )}'`
      : errorMessage;
  if (sendError) {
    throw Error(message);
  }
}

/**
 * Waiting function that tests the condition (callback) to become true until timeout is reached,
 * error is thrown if not fulfilled
 * @param waitFunction a callback returning Promise<boolean>
 * @param timeout timeout in ms
 * @param diff a diff (number) in ms defining the delay between each cycle
 *
 * Example: await waitUntil(() => dialogIsOpen(), 1000, 250, 'Dialog window was not openend as expected in 1 s');
 */
export async function waitUntil(
  waitFunction: () => Promise<boolean>,
  {
    timeout = 5000,
    diff = 500,
    sendError = true,
    message = '',
  }: { timeout?: number; diff?: number; sendError?: boolean; message?: string } = {},
): Promise<void> {
  await wait(waitFunction, true, timeout, diff, sendError, message);
}

/**
 * Waiting function that tests the condition (callback) to become false until timeout is reached,
 * error is thrown if not fulfilled
 * @param waitFunction a callback returning Promise<boolean>
 * @param timeout timeout in ms
 * @param diff a diff (number) in ms defining the delay between each cycle
 *
 * Example: await waitWhile(() => dialogIsOpen(), 1000, 250, 'Dialog window was not closed as expected in 1 s');
 */
export async function waitWhile(
  waitFunction: () => Promise<boolean>,
  {
    timeout = 5000,
    diff = 500,
    sendError = true,
    message = '',
  }: { timeout?: number; diff?: number; sendError?: boolean; message?: string } = {},
): Promise<void> {
  await wait(waitFunction, false, timeout, diff, sendError, message);
}

/**
 * Standard delay function
 * @param ms number of ms to sleep for
 * @returns promise void
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export async function executeWithTimeout(
  callback: () => Promise<void>,
  timeout: number,
  error = 'Timeout reached while waiting for a function to finish',
): Promise<unknown> {
  let cancelTimeout: NodeJS.Timeout;

  const timeoutPromise = new Promise((_, reject) => {
    cancelTimeout = setTimeout(() => {
      reject(new Error(error));
    }, timeout);
  });

  return Promise.race([callback, timeoutPromise]).then(result => {
    clearTimeout(cancelTimeout);
    return result;
  });
}

export async function waitForPodmanMachineStartup(page: Page, timeoutOut = 15000): Promise<void> {
  const dashboardPage = await new NavigationBar(page).openDashboard();
  await playExpect(dashboardPage.heading).toBeVisible();
  await waitUntil(async () => await dashboardPage.podmanStatusLabel.isVisible(), {
    timeout: timeoutOut,
    sendError: false,
  });
  await playExpect(dashboardPage.podmanStatusLabel).toHaveText('RUNNING', { timeout: timeoutOut });
}
