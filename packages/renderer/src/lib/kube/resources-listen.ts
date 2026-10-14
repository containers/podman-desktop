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

import type { IDisposable } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import type { Unsubscriber, Writable } from 'svelte/store';

import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import { findMatchInLeaves } from '/@/stores/search-util';

export interface ListenResourcesOptions {
  searchTermStore?: Writable<string>;
}

// listenResources returns undefined and does nothing when `kubernetes.statesExperimental` setting is not set to true
//
// In experimental mode:
// - watches kubernetes-update-${resourceName} events
// - watches changes of current context
// - watches changes of searchTerm
// and on each event, fetch resources from the backend (informers) filter them on searchTerm and send them through the callback
export async function listenResources(
  resourceName: string,
  options: ListenResourcesOptions,
  callback: (resoures: KubernetesObject[]) => void,
): Promise<IDisposable | undefined> {
  if (!(await isKubernetesExperimentalMode())) {
    return;
  }
  let searchTerm: string = '';
  let contextName: string | undefined;
  let searchTermStoreUnsubscribe: Unsubscriber | undefined;

  const disposable = window.events.receive(`kubernetes-update-${resourceName}`, () => {
    if (!contextName) {
      return;
    }
    collectAndSendFilteredResources(callback, contextName, resourceName, searchTerm);
  });

  const kubernetesContextsUnsubscribe = kubernetesContexts.subscribe(contexts => {
    const currentContext = contexts.find(c => c.currentContext)?.name;
    if (currentContext === contextName) {
      return;
    }
    contextName = currentContext;
    if (!contextName) {
      callback([]);
      return;
    }
    collectAndSendFilteredResources(callback, contextName, resourceName, searchTerm);
  });

  if (options.searchTermStore) {
    searchTermStoreUnsubscribe = options.searchTermStore.subscribe(newSearchTerm => {
      searchTerm = newSearchTerm;
      if (!contextName) {
        return;
      }
      collectAndSendFilteredResources(callback, contextName, resourceName, searchTerm);
    });
  }

  return {
    dispose: (): void => {
      disposable.dispose();
      kubernetesContextsUnsubscribe();
      searchTermStoreUnsubscribe?.();
    },
  };
}

function collectAndSendFilteredResources(
  callback: (resoures: KubernetesObject[]) => void,
  contextName: string,
  resourceName: string,
  searchTerm: string,
): void {
  window
    .kubernetesGetResources([contextName], resourceName)
    .then(result => {
      callback(
        filter(
          result.flatMap(r => r.items),
          searchTerm,
        ),
      );
    })
    .catch(() => {
      console.log(`error getting ${resourceName}`);
    });
}

function filter(resources: KubernetesObject[], searchTerm: string): KubernetesObject[] {
  if (!searchTerm) {
    return resources;
  }
  return resources.filter(resource => findMatchInLeaves(resource, searchTerm.toLowerCase()));
}

export async function isKubernetesExperimentalMode(): Promise<boolean> {
  try {
    return await window.isExperimentalConfigurationEnabled('kubernetes.statesExperimental');
  } catch {
    return false;
  }
}
