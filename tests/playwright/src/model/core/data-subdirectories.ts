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

// Subdirectories that packages/main/src/plugin/directories-legacy.ts (and
// directories-linux-xdg.ts) define under the application data directory.
// Each is created eagerly during main-process startup:
//  - configuration: written by the test runner itself before launch, and
//    read/written by ConfigurationRegistry
//  - plugins, plugins-scanning: created in ExtensionLoader.init()
//  - extensions-storage: created in ExtensionLoader.start()
//  - contributions: created in ContributionManager.init()
//  - safe-storage: created in SafeStorageRegistry.init()
//
// Used by both data-directory-structure.spec.ts (sandboxed PODMAN_DESKTOP_HOME_DIR) and
// product-json-data-directory.spec.ts (real, unoverridden product.json-derived location) --
// same expected structure, different base directory under test.
export const APPLICATION_DATA_SUBDIRECTORIES = [
  'configuration',
  'plugins',
  'plugins-scanning',
  'extensions-storage',
  'contributions',
  'safe-storage',
];
