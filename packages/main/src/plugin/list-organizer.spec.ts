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
import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ListOrganizerRegistry } from './list-organizer.js';

let listOrganizerRegistry: ListOrganizerRegistry;
let mockConfigurationRegistry: IConfigurationRegistry;
const mockConfiguration = {
  get: vi.fn(),
  update: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();

  mockConfigurationRegistry = {
    registerConfigurations: vi.fn(),
    getConfiguration: vi.fn().mockReturnValue(mockConfiguration),
  } as unknown as IConfigurationRegistry;

  listOrganizerRegistry = new ListOrganizerRegistry(mockConfigurationRegistry);
});

describe('ListOrganizerRegistry', () => {
  test('should auto-register layout configuration when loading for the first time', async () => {
    const columnNames = ['Status', 'Name', 'Actions'];
    mockConfiguration.get.mockReturnValue([]);

    await listOrganizerRegistry.loadListConfig('container', columnNames);

    expect(mockConfigurationRegistry.registerConfigurations).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'preferences',
        title: 'List',
        type: 'object',
        properties: expect.objectContaining({
          'list.container': expect.objectContaining({
            description: 'Preferred list of columns for container',
            type: 'array',
            hidden: true,
          }),
        }),
      }),
    ]);
  });

  test('should return empty defaults for unknown table types', () => {
    const defaultConfig = listOrganizerRegistry.getDefaultListConfig('unknown');
    expect(defaultConfig).toEqual([]);
  });

  test('should get default table config after auto-registration via load', async () => {
    // Auto-register container layout by calling load
    mockConfiguration.get.mockReturnValue([]);
    await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name', 'Actions']);

    const containerConfig = listOrganizerRegistry.getDefaultListConfig('container');
    expect(containerConfig).toEqual([
      { id: 'Status', enabled: true },
      { id: 'Name', enabled: true },
      { id: 'Actions', enabled: true },
    ]);

    // Auto-register image layout by calling load
    await listOrganizerRegistry.loadListConfig('image', ['Status', 'Name', 'Actions']);

    const imageConfig = listOrganizerRegistry.getDefaultListConfig('image');
    expect(imageConfig).toEqual([
      { id: 'Status', enabled: true },
      { id: 'Name', enabled: true },
      { id: 'Actions', enabled: true },
    ]);
  });

  test('should load table config with saved configuration', async () => {
    const savedConfig: SavedListOrganizerConfig[] = [
      { id: 'Name', enabled: true },
      { id: 'Status', enabled: false },
    ];
    mockConfiguration.get.mockReturnValue(savedConfig);

    const result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name', 'Actions']);

    expect(result).toEqual([
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
      { id: 'Status', label: 'Status', enabled: false, originalOrder: 0 },
      { id: 'Actions', label: 'Actions', enabled: true, originalOrder: 2 },
    ]);
  });

  test('should load table config with fallback to defaults when no saved config', async () => {
    mockConfiguration.get.mockReturnValue([]);

    const result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name']);

    expect(result).toEqual([
      { id: 'Status', label: 'Status', enabled: true, originalOrder: 0 },
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
    ]);
  });

  test('should load table config with fallback when configuration throws error', async () => {
    mockConfiguration.get.mockImplementation(() => {
      throw new Error('Configuration error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name', 'Actions']);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load list config for container:', expect.any(Error));
    expect(result).toEqual([
      { id: 'Status', label: 'Status', enabled: true, originalOrder: 0 },
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
      { id: 'Actions', label: 'Actions', enabled: true, originalOrder: 2 },
    ]);

    consoleSpy.mockRestore();
  });

  test('should save table configuration', async () => {
    const items: ListOrganizerItem[] = [
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
      { id: 'Status', label: 'Status', enabled: false, originalOrder: 0 },
    ];

    await listOrganizerRegistry.saveListConfig('container', items);

    expect(mockConfiguration.update).toHaveBeenCalledWith('container', [
      { id: 'Name', enabled: true },
      { id: 'Status', enabled: false },
    ]);
  });

  test('should reset table configuration', async () => {
    const result = await listOrganizerRegistry.resetListConfig('container', ['Status', 'Name', 'Actions']);

    expect(mockConfiguration.update).toHaveBeenCalledWith('container', undefined);
    expect(result).toEqual([
      { id: 'Status', label: 'Status', enabled: true, originalOrder: 0 },
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
      { id: 'Actions', label: 'Actions', enabled: true, originalOrder: 2 },
    ]);
  });

  test('should merge configuration correctly with new columns', async () => {
    const savedConfig: SavedListOrganizerConfig[] = [
      { id: 'Name', enabled: true },
      { id: 'Status', enabled: false },
    ];
    mockConfiguration.get.mockReturnValue(savedConfig);

    const result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name', 'Actions', 'NewColumn']);

    expect(result).toEqual([
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
      { id: 'Status', label: 'Status', enabled: false, originalOrder: 0 },
      { id: 'Actions', label: 'Actions', enabled: true, originalOrder: 2 },
      { id: 'NewColumn', label: 'NewColumn', enabled: true, originalOrder: 3 },
    ]);
  });

  test('should parse configuration correctly', () => {
    const layout = ['item1', 'item2', 'item3'];
    const result = listOrganizerRegistry.parseConfiguration(layout);

    expect(result).toEqual([
      { id: 'item1', enabled: true },
      { id: 'item2', enabled: true },
      { id: 'item3', enabled: true },
    ]);
  });

  test('should handle invalid saved config gracefully', async () => {
    // Test with null saved config
    mockConfiguration.get.mockReturnValue(null);
    let result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name', 'Actions']);
    expect(result).toHaveLength(3); // Should fallback to defaults

    // Test with non-array saved config
    mockConfiguration.get.mockReturnValue('invalid');
    result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name', 'Actions']);
    expect(result).toHaveLength(3); // Should fallback to defaults
  });

  test('should handle unknown table types', () => {
    const config = listOrganizerRegistry.getDefaultListConfig('unknown');
    expect(config).toEqual([]);
  });

  test('should filter out unavailable columns from saved config', async () => {
    const savedConfig: SavedListOrganizerConfig[] = [
      { id: 'Name', enabled: true },
      { id: 'RemovedColumn', enabled: true },
      { id: 'Status', enabled: false },
    ];
    mockConfiguration.get.mockReturnValue(savedConfig);

    const result = await listOrganizerRegistry.loadListConfig('container', ['Status', 'Name']);

    expect(result).toEqual([
      { id: 'Name', label: 'Name', enabled: true, originalOrder: 1 },
      { id: 'Status', label: 'Status', enabled: false, originalOrder: 0 },
    ]);
  });
});
