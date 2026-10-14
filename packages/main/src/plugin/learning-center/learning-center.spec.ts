/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { Guide } from '@desktop-framework/api/learning-center';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import productJSONFile from '/@product.json' with { type: 'json' };

import { downloadGuideList } from './learning-center.js';

vi.mock(import('/@product.json'));

function createGuide(id: string): Guide {
  return { id, url: `https://example.com/${id}`, title: id, description: id, categories: [], icon: '' };
}

const threeGuides: Guide[] = [createGuide('a'), createGuide('b'), createGuide('c')];

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(productJSONFile).learningCenter = { guides: threeGuides };
});

describe('downloadGuideList', () => {
  test('returns all guides without dropping any', () => {
    const result = downloadGuideList();
    expect(result).toHaveLength(threeGuides.length);
    for (const guide of threeGuides) {
      expect(result).toContainEqual(guide);
    }
  });

  test('same hour produces the same order (deterministic)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0));

    const first = downloadGuideList();
    const second = downloadGuideList();
    expect(first).toEqual(second);
  });

  test('different hours produce different starting positions', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0));
    const atHour0 = downloadGuideList();

    vi.setSystemTime(new Date(2026, 0, 1, 1, 0, 0));
    const atHour1 = downloadGuideList();

    expect(atHour0).not.toEqual(atHour1);
  });

  test('rotation uses startingIndex = hours % length', () => {
    vi.useFakeTimers();

    for (let hour = 0; hour < 24; hour++) {
      vi.setSystemTime(new Date(2026, 0, 1, hour, 0, 0));
      const result = downloadGuideList();
      const expectedStartIndex = hour % threeGuides.length;
      expect(result[0]).toEqual(threeGuides[expectedStartIndex]);
    }
  });

  test('returns empty array as-is', () => {
    vi.mocked(productJSONFile).learningCenter = { guides: [] } as typeof productJSONFile.learningCenter;
    expect(downloadGuideList()).toEqual([]);
  });

  test('returns single-element array as-is without rotation', () => {
    const single = [createGuide('only')];
    vi.mocked(productJSONFile).learningCenter = { guides: single } as typeof productJSONFile.learningCenter;

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 5, 0, 0));
    expect(downloadGuideList()).toEqual(single);

    vi.setSystemTime(new Date(2026, 0, 1, 17, 0, 0));
    expect(downloadGuideList()).toEqual(single);
  });
});
