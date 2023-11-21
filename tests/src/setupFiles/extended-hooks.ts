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

import type { RunnerTestContext } from '../testContext/runner-test-context';
import { afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

afterEach(async (context: RunnerTestContext) => {
  context.onTestFailed(async () => {
    const normalizedFilePath = context.task.name
      .replace(/([/: ])/g, '_')
      .replace(/[^_a-zA-Z0-9]/g, '')
      .replace(/[_]{2,}/g, '_');
    let fileName = `${normalizedFilePath}_failure`;
    let counter = 0;
    while (fs.existsSync(path.resolve(context.pdRunner.getTestOutput(), 'screenshots', `${fileName}.png`))) {
      counter++;
      fileName = `${fileName}_${counter}`;
      if (counter > 10) break;
    }
    console.log(`Screenshot of the failed test will be saved to: ${fileName}`);
    await context.pdRunner.screenshot(`${fileName}.png`);
  });
});
