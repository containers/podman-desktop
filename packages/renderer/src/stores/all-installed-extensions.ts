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

// Combine PD and DD extensions being installed
import { derived, type Readable } from 'svelte/store';

import type { ExtensionInfo } from '../../../main/src/plugin/api/extension-info';
import { contributions } from './contribs';
import { extensionInfos } from './extensions';

export interface CombinedExtensionInfoUI extends ExtensionInfo {
  // type is either 'pd' for Podman Desktop or 'dd' for 'Docker Desktop'
  type: 'dd' | 'pd';
}

export const combinedInstalledExtensions: Readable<CombinedExtensionInfoUI[]> = derived(
  [contributions, extensionInfos],
  ([$contributions, $extensionInfos]) => {
    // Combine PD and DD extensions being installed

    // add type to each extension
    const pdExtensions: CombinedExtensionInfoUI[] = $extensionInfos.map(ext => ({ ...ext, type: 'pd' }));

    // now convert the contributions to the same type
    const ddExtensions: CombinedExtensionInfoUI[] = $contributions.map(ext => {
      let displayName = ext.displayName;
      if (!displayName) {
        displayName = ext.name;
      }
      return {
        ...ext,
        displayName,
        type: 'dd',
        state: 'started',
        removable: true,
        path: ext.storagePath,
        readme: ext.readme ?? '',
      };
    });

    const allExtensions = [...pdExtensions, ...ddExtensions];

    // sort by display name
    allExtensions.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return allExtensions;
  },
);
