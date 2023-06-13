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

import * as path from 'path';
import type * as api from '@podman-desktop/api';

export interface ExtensionModule {
  path: string;
  api: typeof api;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OverrideFunction = (ext: ExtensionModule) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let internalLoad: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extModuleCache = new Map<string, any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const overrides = new Map<string, object | OverrideFunction>();

export function addOverride(lookup: Record<string, object | OverrideFunction>) {
  Object.keys(lookup).forEach(entry => {
    overrides.set(entry, lookup[entry]);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function overrideRequire(analyzedExtensions: Map<string, ExtensionModule>): void {
  if (!internalLoad) {
    // save original load method
    const module = require('module');
    internalLoad = module._load;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    module._load = function load(request: string, parent: any): any {
      const override = overrides.get(request);
      if (!override) {
        // eslint-disable-next-line prefer-rest-params,prefer-spread
        return internalLoad.apply(this, arguments);
      }

      if (override) {
        const ext = Array.from(analyzedExtensions.values()).find(extension =>
          path.normalize(parent.filename).startsWith(path.normalize(extension.path)),
        );
        if (ext) {
          if (override instanceof Function) {
            return override(ext);
          }
          let cache = extModuleCache.get(ext.path);
          if (!cache) {
            extModuleCache.set(ext.path, (cache = {}));
          }
          if (!cache[request]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cache[request] = <any>{ ...override };
          }
          return cache[request];
        }
        throw Error(`Cannot find extension for ${parent.path}`);
      }
    };
  }
}
