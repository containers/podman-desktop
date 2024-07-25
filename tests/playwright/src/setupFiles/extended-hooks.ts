/**********************************************************************
 * Copyright (C) 2023-2024-2024 Red Hat, Inc.
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

import { afterEach, beforeEach, onTestFailed, onTestFinished } from 'vitest';

import type { RunnerTestContext } from '../testContext/runner-test-context';
import { checkForFailedTest } from '../utility/operations';
import { takeScreenshotHook } from './extended-hooks-utils';

afterEach(async (context: RunnerTestContext) => {
  onTestFailed(async () => await takeScreenshotHook(context.pdRunner, context.task.name));
});

beforeEach(async (context: RunnerTestContext) => {
  onTestFinished(results => checkForFailedTest(results, context.pdRunner));
});
