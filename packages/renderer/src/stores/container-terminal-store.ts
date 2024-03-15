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

import type { Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';
import type { Terminal } from 'xterm';

import { containersInfos } from './containers';

// keep data of a terminal bound to a container
export interface TerminalOfContainer {
  // engine id of the container
  engineId: string;

  // container's id
  containerId: string;

  // id of the callbacks
  callbackId?: number;

  terminal: Terminal;
}

/**
 * Defines the store used to have terminals inside containers
 */
export const containerTerminals: Writable<TerminalOfContainer[]> = writable([]);

containersInfos.subscribe(containers => {
  // search if we have a matching container from the list of terminals
  const terminals = get(containerTerminals);
  const toRemove: TerminalOfContainer[] = [];
  terminals.forEach(terminal => {
    const found = containers.find(
      container => container.Id === terminal.containerId && container.engineId === terminal.engineId,
    );
    if (!found) {
      toRemove.push(terminal);
    }
  });

  // remove the terminals that are not matching anymore
  toRemove.forEach(terminal => {
    containerTerminals.update(terminals => {
      const index = terminals.indexOf(terminal);
      if (index > -1) {
        terminals.splice(index, 1);
      }
      return terminals;
    });
  });
});

export function registerTerminal(terminal: TerminalOfContainer) {
  containerTerminals.update(terminals => {
    terminals.push(terminal);
    return terminals;
  });
}

export function getExistingTerminal(engineId: string, containerId: string): TerminalOfContainer | undefined {
  const terminals = get(containerTerminals);
  return terminals.find(terminal => terminal.engineId === engineId && terminal.containerId === containerId);
}
