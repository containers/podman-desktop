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

import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';

import { providerInfos } from './providers';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

/**
 * Defines the store used to have terminals inside providers
 */
export const providerTerminals: Writable<ProviderContainerConnectionInfo[]> = writable([]);

providerInfos.subscribe(providers => {
  // search if we have a matching provider from the list of terminals
  const terminals = get(providerTerminals);
  const toRemove: ProviderContainerConnectionInfo[] = [];
  terminals.forEach(terminal => {
    const found = providers.find(provider => provider.name === terminal.name && provider.stream);
    if (!found) {
      toRemove.push(terminal);
    }
  });

  // remove the terminals that are not matching anymore
  toRemove.forEach(terminal => {
    providerTerminals.update(terminals => {
      const index = terminals.indexOf(terminal);
      if (index > -1) {
        terminals.splice(index, 1);
      }
      return terminals;
    });
  });
});

export function registerTerminal(terminal: ProviderContainerConnectionInfo) {
    console.error("registerTerminal: ", terminal)
  providerTerminals.update(terminals => {
    // remove old instance(s) of terminal if exists
    terminals = terminals.filter(
      term => !(terminal.name === term.name),
    );
    terminals.push(terminal);
    console.error("terminals: ", terminals)
    return terminals;
  });
}

export function getExistingTerminal(
  provider: ProviderInfo
): ProviderContainerConnectionInfo | undefined {
  const terminals = get(providerTerminals);
  console.error("terminals: ", terminals, "provider: ", provider)
  // console.error("getExistingTerminal: ", terminals.find(terminal => provider.containerConnections.find(connection => connection.name === terminal.name)))
  return terminals.find(terminal => provider.containerConnections.find(connection => connection.name === terminal.name));
}
