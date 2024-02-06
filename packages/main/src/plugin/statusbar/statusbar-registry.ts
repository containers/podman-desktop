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

import type { ApiSenderType } from '../api.js';
import type { IDisposable } from '../types/disposable.js';

export const STATUS_BAR_UPDATED_EVENT_NAME = 'status-bar-updated';

export interface StatusBarEntry {
  text?: string;
  tooltip?: string;
  activeIconClass?: string;
  inactiveIconClass?: string;
  enabled: boolean;
  command?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commandArgs?: any[];
  highlight?: boolean;
}

export interface StatusBarEntryDescriptor {
  priority: number;
  alignLeft: boolean;
  entry: StatusBarEntry;
}

export class StatusBarRegistry implements IDisposable {
  private readonly entries: Map<string, StatusBarEntryDescriptor> = new Map();

  constructor(private apiSender: ApiSenderType) {}

  removeEntry(id: string) {
    const entry = this.entries.get(id);
    if (entry) {
      this.entries.delete(id);
      this.apiSender.send(STATUS_BAR_UPDATED_EVENT_NAME, undefined);
    }
  }

  setEntry(
    entryId: string,
    alignLeft: boolean,
    priority: number,
    text: string | undefined,
    tooltip: string | undefined,
    iconClass: string | { active: string; inactive: string } | undefined,
    enabled: boolean,
    command: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commandArgs: any[] | undefined,
    highlight?: boolean,
  ) {
    const existingEntry = this.entries.get(entryId);
    if (existingEntry && (existingEntry.alignLeft !== alignLeft || existingEntry.priority !== priority)) {
      this.entries.delete(entryId);
    }

    const activeIconClass = typeof iconClass === 'string' ? iconClass : iconClass?.active;
    const inactiveIconClass = typeof iconClass !== 'string' ? iconClass?.inactive : undefined;

    if (!existingEntry) {
      const newEntry: StatusBarEntry = {
        text: text,
        tooltip: tooltip,
        activeIconClass: activeIconClass,
        inactiveIconClass: inactiveIconClass,
        enabled: enabled,
        command: command,
        commandArgs: commandArgs,
        highlight: highlight,
      };

      const entryDescriptor: StatusBarEntryDescriptor = {
        alignLeft: alignLeft,
        priority: priority,
        entry: newEntry,
      };
      this.entries.set(entryId, entryDescriptor);
    } else {
      const entryToUpdate = existingEntry.entry;
      entryToUpdate.text = text;
      entryToUpdate.tooltip = tooltip;
      entryToUpdate.activeIconClass = activeIconClass;
      entryToUpdate.inactiveIconClass = inactiveIconClass;
      entryToUpdate.enabled = enabled;
      entryToUpdate.command = command;
      entryToUpdate.commandArgs = commandArgs;
      entryToUpdate.highlight = highlight;
    }

    this.apiSender.send(STATUS_BAR_UPDATED_EVENT_NAME, undefined);
  }

  dispose(): void {
    this.entries.clear();
  }

  getStatusBarEntries(): StatusBarEntryDescriptor[] {
    const entries: StatusBarEntryDescriptor[] = [];
    for (const entry of this.entries.values()) {
      entries.push(entry);
    }
    return entries;
  }
}
