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

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { PodmanDesktopRunner } from '../runner/podman-desktop-runner';

/**
 * Function to be used in afterEach runner test context
 * @param runner Podman Desktop Runner object
 * @param taskName Task name - taken from runner context
 */
export async function takeScreenshotHook(runner: PodmanDesktopRunner, taskName: string): Promise<void> {
  const normalizedFilePath = taskName
    .replace(/([/: ])/g, '_')
    .replace(/\W/g, '')
    .replace(/_{2,}/g, '_');
  let fileName = `${normalizedFilePath}_failure`;
  let counter = 0;
  while (existsSync(resolve(runner.getTestOutput(), 'screenshots', `${fileName}.png`))) {
    counter++;
    fileName = `${fileName}_${counter}`;
    if (counter > 10) break;
  }
  console.log(`Screenshot of the failed test will be saved to: ${fileName}`);
  await runner.screenshot(`${fileName}.png`);
  runner.setTestPassed(false);
}
