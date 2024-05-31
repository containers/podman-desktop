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

import { removeFolderIfExists } from '../utility/cleanup';

let setupCalled = false;
let teardownCalled = false;

export async function setup(): Promise<void> {
  if (!setupCalled) {
    // remove all previous testing output files
    // Junit reporter output file is created before we can clean up output folders
    // It is not possible to remove junit output file because it is opened by the process already, at least on windows
    if (!process.env.CI && !process.env.SKIP_REMOVE_FOLDER) {
      await removeFolderIfExists('tests/output');
    } else {
      console.log(
        `On CI, skipping before All tests/output cleanup, see https://github.com/containers/podman-desktop/issues/5460`,
      );
    }
    setupCalled = true;
  }
}

export async function teardown(): Promise<void> {
  if (!teardownCalled) {
    // here comes teardown logic
    teardownCalled = true;
  }
}
