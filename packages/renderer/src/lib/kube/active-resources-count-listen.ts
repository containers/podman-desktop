/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { IDisposable, ResourceCount } from '@desktop-framework/api';

// listenActiveResourcesCount listens the count of active resources
export async function listenActiveResourcesCount(
  callback: (activeResourcesCounts: ResourceCount[]) => void,
): Promise<IDisposable | undefined> {
  if (!(await isKubernetesExperimentalMode())) {
    return;
  }

  const disposable = window.events.receive('kubernetes-active-resources-count', () => {
    collectAndSendCount(callback);
  });

  collectAndSendCount(callback);

  return {
    dispose: (): void => {
      disposable.dispose();
    },
  };
}

function collectAndSendCount(callback: (activeResourcesCount: ResourceCount[]) => void): void {
  window
    .kubernetesGetActiveResourcesCount()
    .then(result => {
      callback(result);
    })
    .catch(() => {
      console.error(`error getting active resources counts`);
    });
}

async function isKubernetesExperimentalMode(): Promise<boolean> {
  try {
    return await window.isExperimentalConfigurationEnabled('kubernetes.statesExperimental');
  } catch {
    return false;
  }
}
