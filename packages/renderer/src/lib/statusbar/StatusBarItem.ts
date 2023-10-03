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

import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';

export function iconClass(entry: StatusBarEntry): string | undefined {
  let iconClass = undefined;
  if (entry.enabled && entry.activeIconClass !== undefined && entry.activeIconClass.trim().length !== 0) {
    iconClass = entry.activeIconClass;
  } else if (!entry.enabled && entry.inactiveIconClass !== undefined && entry.inactiveIconClass.trim().length !== 0) {
    iconClass = entry.inactiveIconClass;
  }
  // handle ${} in icon class
  // and interpret the value and replace with the class-name
  if (iconClass !== undefined) {
    const match = iconClass.match(/\$\{(.*)\}/);
    if (match?.length === 2) {
      const className = match[1];
      iconClass = iconClass.replace(match[0], `podman-desktop-icon-${className}`);
    } else if (iconClass.endsWith('~spin')) {
      // check if the iconClass ends with ~spin
      // and then remove the ~spin suffix and use animate-spin
      iconClass = iconClass.replace('~spin', ' animate-spin');
    }
  }
  return iconClass;
}
