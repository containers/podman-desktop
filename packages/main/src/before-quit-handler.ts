/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';

export interface BeforeQuitHandlerDeps {
  getExtensionLoader: () => Pick<ExtensionLoader, 'asyncDispose'> | undefined;
  getStoppedExtensions: () => { val: boolean };
  quit: () => void;
}

/**
 * Create the listener for the app 'before-quit' event.
 *
 * It must be registered with `on`, not `once`: Squirrel's terminate emits a second
 * 'before-quit' while the extensions disposal can still be running. That event has to be
 * vetoed too, without starting a second disposal.
 */
export function createBeforeQuitHandler(deps: BeforeQuitHandlerDeps): (event: { preventDefault: () => void }) => void {
  let disposal: Promise<void> | undefined;

  return event => {
    const stoppedExtensions = deps.getStoppedExtensions();
    if (stoppedExtensions.val) {
      return;
    }
    const extensionLoader = deps.getExtensionLoader();
    if (!extensionLoader) {
      stoppedExtensions.val = true;
      return;
    }
    event.preventDefault();
    if (disposal) {
      return;
    }
    disposal = extensionLoader
      .asyncDispose()
      .then(() => {
        console.log('Stopped all extensions');
      })
      .catch((error: unknown) => {
        console.log('Error stopping extensions', error);
      })
      .finally(() => {
        stoppedExtensions.val = true;
        deps.quit();
      });
  };
}
