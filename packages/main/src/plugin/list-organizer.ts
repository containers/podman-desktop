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

import type { ListOrganizerItem, SavedListOrganizerConfig } from '@desktop-framework/api';
import { IDisposable } from '@desktop-framework/api';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { inject, injectable } from 'inversify';

@injectable()
export class ListOrganizerRegistry implements IDisposable {
  #disposables: IDisposable[] = [];

  // Dynamic list organizer registry - populated by frontend components during initialization
  private registeredLists: Record<string, string[]> = {};

  constructor(@inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistry) {}

  public dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
    this.#disposables = [];
  }

  // Get default configuration for a list kind
  getDefaultListConfig(listKind: string): SavedListOrganizerConfig[] {
    const defaults = this.registeredLists[listKind] ?? [];
    return defaults.map(name => ({ id: name, enabled: true }));
  }

  // Load list configuration (with fallback to defaults)
  async loadListConfig(listKind: string, availableColumns: string[]): Promise<ListOrganizerItem[]> {
    try {
      // Auto-register the list if not already registered
      if (!this.registeredLists[listKind]) {
        this.registeredLists[listKind] = availableColumns;

        // Register the configuration with the configuration registry
        const listConfiguration: IConfigurationNode = {
          id: 'preferences',
          title: 'List',
          type: 'object',
          properties: {
            [`list.${listKind}`]: {
              description: `Preferred list of columns for ${listKind}`,
              type: 'array',
              default: this.parseConfiguration(availableColumns),
              hidden: true,
            },
          },
        };

        this.#disposables.push(this.configurationRegistry.registerConfigurations([listConfiguration]));
      }

      const config = this.configurationRegistry.getConfiguration('list');
      const savedConfig = config.get<SavedListOrganizerConfig[]>(`${listKind}`, []);

      return this.mergeConfigWithAvailableColumns(listKind, savedConfig, availableColumns);
    } catch (error: unknown) {
      console.warn(`Failed to load list config for ${listKind}:`, error);
      return this.createDefaultListItems(listKind, availableColumns);
    }
  }

  // Save list configuration
  async saveListConfig(listKind: string, items: ListOrganizerItem[]): Promise<void> {
    const configToSave: SavedListOrganizerConfig[] = items.map(item => ({ id: item.id, enabled: item.enabled }));

    const config = this.configurationRegistry.getConfiguration('list');
    await config.update(`${listKind}`, configToSave);
  }

  // Reset list to defaults
  async resetListConfig(listKind: string, availableColumns: string[]): Promise<ListOrganizerItem[]> {
    const config = this.configurationRegistry.getConfiguration('list');
    await config.update(`${listKind}`, undefined);
    return this.createDefaultListItems(listKind, availableColumns);
  }

  // Helper: Create default list items
  private createDefaultListItems(listKind: string, availableColumns: string[]): ListOrganizerItem[] {
    const defaults = this.registeredLists[listKind] ?? availableColumns;
    return defaults.map((colName, index) => ({
      id: colName,
      label: this.getColumnLabel(colName),
      enabled: true,
      originalOrder: index,
    }));
  }

  // Helper: Get proper label for column (dashboard sections have different labels)
  private getColumnLabel(columnId: string): string {
    // Transform kebab-case to Title Case (e.g., 'release-notes' -> 'Release Notes')
    return columnId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Helper: Merge saved config with available columns
  private mergeConfigWithAvailableColumns(
    listKind: string,
    savedConfig: SavedListOrganizerConfig[],
    availableColumns: string[],
  ): ListOrganizerItem[] {
    const savedIds = new Set(savedConfig.map(item => item.id));
    const mergedItems: ListOrganizerItem[] = [];

    // Get default order to determine originalOrder for each column
    const defaults = this.registeredLists[listKind] ?? availableColumns;
    const getOriginalOrder = (id: string): number => {
      const index = defaults.indexOf(id);
      return index >= 0 ? index : defaults.length; // Put unknown items at the end
    };

    // Add saved columns in their saved order
    savedConfig.forEach(savedItem => {
      if (availableColumns.includes(savedItem.id)) {
        mergedItems.push({
          id: savedItem.id,
          label: this.getColumnLabel(savedItem.id),
          enabled: savedItem.enabled,
          originalOrder: getOriginalOrder(savedItem.id),
        });
      }
    });

    // Add any new columns that weren't saved
    availableColumns
      .filter(colName => !savedIds.has(colName))
      .forEach(newCol => {
        mergedItems.push({
          id: newCol,
          label: this.getColumnLabel(newCol),
          enabled: true,
          originalOrder: getOriginalOrder(newCol),
        });
      });

    return mergedItems;
  }

  parseConfiguration(list: string[]): SavedListOrganizerConfig[] {
    return list.map(item => ({
      id: item,
      enabled: true,
    }));
  }
}
