/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type * as extensionApi from '@podman-desktop/api';

import type { InstalledPodman } from './podman-cli';
import { getCustomBinaryPath, getInstallationPath } from './podman-cli';

export function getDetectionChecks(installedPodman?: InstalledPodman): extensionApi.ProviderDetectionCheck[] {
  const detectionChecks: extensionApi.ProviderDetectionCheck[] = [];
  if (installedPodman?.version) {
    detectionChecks.push({
      name: `Podman ${installedPodman.version} found`,
      status: true,
    });
  } else if (getCustomBinaryPath()) {
    detectionChecks.push({
      name: 'podman cli binary was not found in custom path',
      details: `Binary path set to ${getCustomBinaryPath()}`,
      status: false,
    });
  } else {
    detectionChecks.push({
      name: 'podman cli was not found in the PATH',
      details: `Current path is ${getInstallationPath()}`,
      status: false,
    });
  }

  return detectionChecks;
}
