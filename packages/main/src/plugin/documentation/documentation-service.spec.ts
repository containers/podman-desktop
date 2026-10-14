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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DocumentationService } from '/@/plugin/documentation/documentation-service.js';
import product from '/@product.json' with { type: 'json' };

const originalConsoleError = console.error;

let documentationService: DocumentationService;

// Mock API sender
const mockApiSender = {
  send: vi.fn(),
} as unknown as ApiSenderType;

const fallbackDocumentation = [
  {
    id: 'item1',
    name: 'Item 1',
    description: 'Some description 1',
    url: '/url/1',
    category: 'Documentation',
  },
  {
    id: 'item2',
    name: 'Item 2',
    description: 'Some description 2',
    url: '/url/2',
    category: 'Tutorial',
  },
];

vi.mock(import('/@product.json'));

beforeEach(() => {
  vi.resetAllMocks();
  documentationService = new DocumentationService(mockApiSender);
  console.error = vi.fn();
  vi.mocked(product).documentation.links = [
    { link: '/docs/link', category: 'category 1' },
    { link: '/tutorial/link', category: 'category 2' },
    { link: '/some/link', category: 'category 3' },
  ];
  vi.mocked(product).documentation.fallback = fallbackDocumentation;
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('fetchDocumentation', () => {
  test('should fetch documentation and tutorials successfully', async () => {
    const mockDocsJson = [
      {
        name: 'Introduction',
        url: '/docs/intro',
      },
      {
        name: 'Containers Guide',
        url: '/docs/containers',
      },
      {
        name: 'Kubernetes Guide',
        url: '/docs/kubernetes',
      },
    ];

    const mockTutorialJson = [
      {
        name: 'Getting Started Tutorial',
        url: '/tutorial/getting-started',
      },
      {
        name: 'Kubernetes Cluster Tutorial',
        url: '/tutorial/kubernetes-cluster',
      },
    ];

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();

    // Verify fetch was called with correct URLs
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenCalledWith('/docs/link');
    expect(fetchSpy).toHaveBeenCalledWith('/tutorial/link');
    expect(fetchSpy).toHaveBeenCalledWith('/some/link');

    // Verify service is initialized
    const items = await documentationService.getDocumentationItems();
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
  });

  test('should use fallback documentation when fetch fails', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await documentationService.fetchDocumentation();

    const items = await documentationService.getDocumentationItems();
    expect(items).toBeDefined();
    expect(items.length).toBe(2);

    // Should include fallback items
    const firstItem = items.find(item => item.id === 'item1');
    expect(firstItem).toBeDefined();
    expect(firstItem?.name).toBe('Item 1');

    const secondItem = items.find(item => item.id === 'item2');
    expect(secondItem).toBeDefined();
    expect(secondItem?.name).toBe('Item 2');

    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  test('should use fallback when HTTP response is not ok', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await documentationService.fetchDocumentation();

    const items = await documentationService.getDocumentationItems();
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);

    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});

describe('getDocumentationItems', () => {
  test('should initialize automatically if not initialized', async () => {
    const mockDocsJson = [
      {
        name: 'Auto Init',
        url: '/docs/auto',
      },
    ];
    const mockTutorialJson = [
      {
        name: 'Auto Tutorial',
        url: '/tutorial/auto',
      },
    ];

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    const items = await documentationService.getDocumentationItems();

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
  });

  test('should return cached items after initialization', async () => {
    const mockDocsJson = [
      {
        name: 'Cached',
        url: '/docs/cached',
      },
    ];
    const mockTutorialJson = [
      {
        name: 'Cached Tutorial',
        url: '/tutorial/cached',
      },
    ];

    // Only mock once - should be cached after first call
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    const firstCall = await documentationService.getDocumentationItems();
    const secondCall = await documentationService.getDocumentationItems();

    expect(firstCall).toStrictEqual(secondCall); // Same content
    expect(fetchSpy).toHaveBeenCalledTimes(3); // Only called once for initialization
  });
});

describe('refreshDocumentation', () => {
  test('should re-fetch documentation and send update notification', async () => {
    const mockDocsJson = [
      {
        name: 'Refresh Test',
        url: '/docs/refresh',
      },
    ];
    const mockTutorialJson = [
      {
        name: 'Refresh Tutorial',
        url: '/tutorial/refresh',
      },
    ];

    // Initial fetch
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();
    expect(fetchSpy).toHaveBeenCalledTimes(3);

    // Refresh fetch - add more mock calls
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.refreshDocumentation();

    expect(fetchSpy).toHaveBeenCalledTimes(6); // 3 initial + 3 refresh
    expect(mockApiSender.send).toHaveBeenCalledWith('documentation-updated');
  });
});

describe('parseDocumentationContent', () => {
  test('should parse documentation and tutorial links correctly', async () => {
    const mockDocsJson = [
      {
        name: 'Introduction & Getting Started',
        url: '/docs/intro',
      },
      {
        name: 'Working with Containers',
        url: '/docs/containers',
      },
      {
        name: 'Kubernetes Integration',
        url: '/docs/kubernetes',
      },
      {
        name: 'Troubleshooting Guide',
        url: '/docs/troubleshooting',
      },
    ];

    const mockTutorialJson = [
      {
        name: 'Getting Started',
        url: '/tutorial/getting-started',
      },
      {
        name: 'Creating a Kubernetes Cluster',
        url: '/tutorial/kubernetes-cluster',
      },
      {
        name: 'Using Docker Compose',
        url: '/tutorial/compose',
      },
    ];

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();
    const items = await documentationService.getDocumentationItems();

    expect(fetchSpy).toHaveBeenCalledTimes(3);

    console.log(items);

    // Check that we have expected parsed items and categories
    const cat1Items = items.filter(item => item.category === 'category 1');
    const cat2Items = items.filter(item => item.category === 'category 2');

    expect(cat1Items.length).toBe(4); // parsed
    expect(cat2Items.length).toBe(3); // parsed

    // Check specific parsed items
    const introItem = items.find(item => item.name === 'Introduction & Getting Started');
    expect(introItem).toBeDefined();
    expect(introItem?.category).toBe('category 1');
    expect(introItem?.url).toBe('/docs/intro');

    const coreTutorialItem = items.find(item => item.name === 'Getting Started');
    expect(coreTutorialItem).toBeDefined();
    expect(coreTutorialItem?.category).toBe('category 2');
  });

  test('should handle relative and absolute URLs correctly', async () => {
    const mockDocsJson = [
      {
        name: 'Relative Link',
        url: '/docs/relative',
      },
      {
        name: 'Absolute Link',
        url: 'https://podman-desktop.io/docs/absolute',
      },
    ];

    const mockTutorialJson = [
      {
        name: 'Relative Tutorial',
        url: '/tutorial/relative',
      },
      {
        name: 'Absolute Tutorial',
        url: 'https://podman-desktop.io/tutorial/absolute',
      },
    ];

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();
    const items = await documentationService.getDocumentationItems();

    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const docItem = items.find(item => item.name === 'Relative Link');
    expect(docItem).toBeDefined();
    expect(docItem?.url).toBe('/docs/relative');

    const tutorialItem = items.find(item => item.name === 'Absolute Tutorial');
    expect(tutorialItem).toBeDefined();
    expect(tutorialItem?.url).toBe('https://podman-desktop.io/tutorial/absolute');
  });

  test('should handle empty JSON gracefully', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();
    const items = await documentationService.getDocumentationItems();

    expect(fetchSpy).toHaveBeenCalledTimes(3);

    // Should fallback to predefined documentation when JSON lists are empty
    expect(items).toStrictEqual(fallbackDocumentation);
  });

  test('should remove duplicate items', async () => {
    const mockDocsJson = [
      {
        name: 'Duplicate Item',
        url: '/docs/duplicate',
      },
      {
        name: 'Duplicate Item',
        url: '/docs/duplicate',
      },
      {
        name: 'Unique Item',
        url: '/docs/unique',
      },
    ];

    const mockTutorialJson = [
      {
        name: 'Test Tutorial',
        url: '/tutorial/test',
      },
    ];

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();
    const items = await documentationService.getDocumentationItems();

    expect(fetchSpy).toHaveBeenCalledTimes(3);

    const docItems = items.filter(item => item.category === 'category 1');

    expect(docItems.length).toBe(2);

    const tutorialItems = items.filter(item => item.category === 'category 2');
    expect(tutorialItems.length).toBe(1);
  });
});

describe('generateId', () => {
  test('should generate consistent IDs for documentation items', async () => {
    const mockDocsJson = [
      {
        name: 'Test Documentation Item',
        url: '/docs/test',
      },
    ];
    const mockTutorialJson = [
      {
        name: 'Test Tutorial Item',
        url: '/tutorial/test',
      },
    ];

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocsJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTutorialJson),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

    await documentationService.fetchDocumentation();
    const items = await documentationService.getDocumentationItems();

    expect(fetchSpy).toHaveBeenCalledTimes(3); // Only called during fetchDocumentation, cached for getDocumentationItems

    // IDs are generated from item names (sha256)
    const docItem = items.find(item => item.name === 'Test Documentation Item');
    expect(docItem).toBeDefined();
    expect(docItem?.id).toMatch(/^[a-f0-9]{64}$/);

    const tutorialItem = items.find(item => item.name === 'Test Tutorial Item');
    expect(tutorialItem).toBeDefined();
    expect(tutorialItem?.id).toMatch(/^[a-f0-9]{64}$/);
    expect(docItem?.id).not.toBe(tutorialItem?.id);
  });
});
