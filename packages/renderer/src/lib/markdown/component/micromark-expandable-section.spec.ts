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

import '@testing-library/jest-dom/vitest';

import type { CompileContext } from 'micromark-util-types';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ExpandableSectionProps } from '../micromark-utils';
import { createExpandableSection } from './micromark-expandable-section';

let html = '';
const context: CompileContext = {
  options: {},
  setData: vi.fn(),
  getData: vi.fn(),
  lineEndingIfNeeded: vi.fn(),
  encode: vi.fn(),
  buffer: vi.fn(),
  resume: vi.fn(),
  raw: function (value: string): undefined {
    html += value;
  },
  tag: function (value: string): undefined {
    html += value;
  },
  sliceSerialize: vi.fn(),
};

beforeEach(() => {
  html = '';
});

test('Expect createExpandableSection to return a button with an expandable section', async () => {
  const expandable: ExpandableSectionProps = {
    showToggle: true,
    toggleExpandedState: {
      label: 'Less information',
    },
    toggleCollapsedState: {
      label: 'More information',
    },
    content: {
      html: 'content',
      expanded: false,
    },
  };
  createExpandableSection.bind(context)(expandable);

  const htmlSanitized = html.replace('\n', '').replace(/\s+/g, ' ');
  expect(htmlSanitized).toContain(
    `<button class='flex space-x-2 text-purple-400 w-fit hover:bg-white hover:bg-opacity-10 text-xs items-center' data-expandable='micromark-expandable-1'`,
  );
  expect(htmlSanitized).toContain(
    `<div class='flex-col w-[250px] text-sm micromark-expandable-1' style='display: none;'`,
  );
});

test('Expect createExpandableSection to return a button and a visible expandable section', async () => {
  const expandable: ExpandableSectionProps = {
    showToggle: true,
    toggleExpandedState: {
      label: 'Less information',
    },
    toggleCollapsedState: {
      label: 'More information',
    },
    content: {
      html: 'content',
      expanded: true,
    },
  };
  createExpandableSection.bind(context)(expandable);

  const htmlSanitized = html.replace('\n', '').replace(/\s+/g, ' ');
  expect(htmlSanitized).toContain(
    `<button class='flex space-x-2 text-purple-400 w-fit hover:bg-white hover:bg-opacity-10 text-xs items-center' data-expandable='micromark-expandable-2'`,
  );
  expect(htmlSanitized).toContain(
    `<div class='flex-col w-[250px] text-sm micromark-expandable-2' style='display: flex;'`,
  );
});

test('Expect createExpandableSection to return a hidden button and expandable section', async () => {
  const expandable: ExpandableSectionProps = {
    showToggle: false,
    toggleExpandedState: {
      label: 'Less information',
    },
    toggleCollapsedState: {
      label: 'More information',
    },
    content: {
      html: 'content',
      expanded: false,
    },
  };
  createExpandableSection.bind(context)(expandable);

  const htmlSanitized = html.replace('\n', '').replace(/\s+/g, ' ');
  expect(htmlSanitized).toContain(
    `<button class='flex space-x-2 text-purple-400 w-fit hover:bg-white hover:bg-opacity-10 text-xs items-center' data-expandable='micromark-expandable-3' style='display: none;'`,
  );
  expect(htmlSanitized).toContain(
    `<div class='flex-col w-[250px] text-sm micromark-expandable-3' style='display: none;'`,
  );
});
